const simulationSchema = require('../models/MongoDB/simulation');
const { calculateOptionPremium, generateChartData } = require('../utils/calculatorsSimulations');
const usersSchema = require('../models/MongoDB/users');
const { v4: uuidv4 } = require('uuid');
const strategiesSchema = require('../models/MongoDB/strategies');


//OBTENER TODAS LAS SIMULACIONES
async function GetAllSimulation(req) {
  try {
    let simulation = await simulationSchema.find().lean(); 
    return simulation;
  } catch (error) {
    return error;
  }
}
//OBTENER SIMULACIONES POR USUARIO
async function GetSimulationsByUserId(req) {
  try {
    // Obtener el USER_ID desde el cuerpo de la solicitud (req.data)
    const { IDUSER } = req.data; // Asumiendo que el body es { "USER_ID": "user-001" }

    if (!IDUSER) {
      throw new Error("El ID de usuario no fue proporcionado.");
    }

    // Buscar todas las simulaciones del usuario por el ID en la base de datos
    const simulations = await simulationSchema.find({ IDUSER: IDUSER}).lean(); 

    // Verificar si no hay simulaciones
    if (!simulations || simulations.length === 0) {
      throw new Error(`No se encontraron simulaciones para el usuario con ID ${IDUSER}`);
    }

    // Retornar todas las simulaciones encontradas
    return {
      simulations: simulations // Devuelve un objeto con las simulaciones
    };

  } catch (error) {
    // Manejo de errores
    throw new Error(`Error al obtener las simulaciones del usuario: ${error.message}`);
  }
}

//OBTENER TODAS LAS SIMULACIONES POR SIMBOLO
async function GetSimulationBySymbols(req){
  try {
    const { symbol } = req.data;
    const simulation = await simulationSchema.find({ SYMBOL: symbol }).lean();

    if (!simulation || simulation.length === 0) {
      throw new Error(`No se encontraron simulaciones con el simbolo de ${symbol}`);
    }

    return {
      simulation: simulation
    };
  } catch (error) {
    return error;
  }
}
//OBTENER SIMULACIONES POR MONTO
async function GetSimulationForMonto(req) {
  try {
    const { min, max } = req.data;

    if (min == null || max == null) {
      throw new Error("Debes proporcionar valores para 'min' y 'max'");
    }

    const simulations = await simulationSchema.find({
      AMOUNT: { $gte: min, $lte: max }
    }).lean();

    if (!simulations || simulations.length === 0) {
      throw new Error(`No se encontraron simulaciones con monto entre ${min} y ${max}`);
    }

    return {
      simulation: simulations
    };

  } catch (error) {
    return { error: error.message };
  }
}
//OBTENER SIMULACIONES POR FECHAS
async function GetSimulationsForRangeDate(req) {
  try {
    const { startDate, endDate } = req.data;

    if (!startDate || !endDate) {
      throw new Error("Debes proporcionar valores para 'startDate' y 'endDate'.");
    }

    /* const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start) || isNaN(end)) {
      throw new Error("Las fechas proporcionadas no son válidas.");
    } */

    const simulations = await simulationSchema.find({
      STARTDATE: { $gte: startDate },
      ENDDATE: { $lte: endDate }
    }).lean();

    if (!simulations || simulations.length === 0) {
      return {
        message: `No se encontraron simulaciones entre ${startDate} y ${endDate}.`,
        simulation: []
      };
    }

    return {
      simulation: simulations
    };

  } catch (error) {
    return { error: error.message };
  }
}

// Función para actualizar el nombre de la simulación
async function UpdateSimulationName(req) {
  try {
    const { IDSIMULATION, newName } = req.data;

    // Validación de entrada
    if (!IDSIMULATION || !newName) {
      throw new Error('Se requiere el ID de la simulación y el nuevo nombre.');
    }

    // Verificar que exista la simulación
    const simulation = await simulationSchema.findOne({ IDSIMULATION }).lean();
    if (!simulation) {
      throw new Error(`Simulación con ID ${IDSIMULATION} no encontrada.`);
    }

    // Actualizar el nombre de la simulación
    await simulationSchema.updateOne(
      { IDSIMULATION },
      { $set: { SIMULATIONNAME: newName } }
    );

    return {
      success: true,
      message: `Nombre de la simulación actualizado a "${newName}".`,
      IDSIMULATION,
      newName
    };

  } catch (error) {
    console.error('Error en UpdateSimulationName:', error);
    throw new Error(`Error al actualizar el nombre de la simulación: ${error.message}`);
  }
}

// Delete simulation by ID
async function DeleteSimulationById(id) {
  const deleted = await simulationSchema.deleteOne({ IDSIMULATION: id });
  if (deleted.deletedCount === 0) throw new Error('Simulación no encontrada');
  return { IDSIMULATION: id, status: 'deleted' };
}


async function SimulateIronCondor(req) {
  try {
    const {
      symbol,
      entryDate,
      expiryDate,
      shortCallStrike,
      longCallStrike,
      shortPutStrike,
      longPutStrike,
      idUser,
      amount = 1000,
      startDate = new Date(),
      endDate = new Date(),
      simulationName = `Iron Condor ${symbol}`,
      idStrategy
    } = req.data;

    // Validaciones básicas
    if (!symbol || !idUser || !shortCallStrike || !longCallStrike || !shortPutStrike || !longPutStrike) {
      throw new Error('Faltan datos obligatorios para la simulación.');
    }

    //VALIDACIONES DE SI EXISTE LA ESTRATEGIA
    // Buscar la estrategia por idStrategy y validar LABELID
    const strategy = await strategiesSchema.findOne({ LABELID: idStrategy }).lean();

    if (!strategy) {
      throw cds.error('Estrategia no encontrada.', {
        code: 'STRATEGY_NOT_FOUND',
        status: 404
      });
    }

    if (strategy.LABELID !== 'IRON_CONDOR') {
      throw cds.error('La estrategia especificada no es de tipo Iron Condor.', {
        code: 'INVALID_STRATEGY_LABELID',
        status: 400
      });
    }

    //VALIDACIONES USUARIO
    const user = await usersSchema.findOne({ idUser }).lean();
    if (!user) throw cds.error('Usuario no encontrado.', { code: 'USER_NOT_FOUND', status: 404 });

    if (user.wallet.balance < amount) {
      throw cds.error('Saldo insuficiente para realizar la simulación.', {
        code: 'INSUFFICIENT_FUNDS',
        status: 400
      });
    }

    // Cálculos simulados 
    const premiumShortCall = await calculateOptionPremium(symbol, shortCallStrike, 'call', 'sell');
    const premiumLongCall = await calculateOptionPremium(symbol, longCallStrike, 'call', 'buy');
    const premiumShortPut = await calculateOptionPremium(symbol, shortPutStrike, 'put', 'sell');
    const premiumLongPut = await calculateOptionPremium(symbol, longPutStrike, 'put', 'buy');
    
    const specs = `Iron Condor - CALL:${shortCallStrike}/${longCallStrike}, PUT:${shortPutStrike}/${longPutStrike}, EXP:${expiryDate}`;

    //DATOS FINALES DE LA SIMULACION
    const netCredit = premiumShortCall + premiumShortPut - premiumLongCall - premiumLongPut;
    const maxLoss = (longCallStrike - shortCallStrike) + (shortPutStrike - longPutStrike) - netCredit;
    const maxProfit = netCredit;
    const riskRewardRatio = maxProfit / maxLoss;
    const percentageReturn = (netCredit / amount) * 100;

    // Genera los datos del gráfico para el frontend
    const chartData = await generateChartData(symbol);

    // ID generado
    const idSimulation = uuidv4();
    //console.log('Valor idSimulation:', idSimulation);

    //CREACION DEL ESQUEMA DE SIGNALS DEL MODELO DE SIMULACION
    const signals = [
      {
        DATE: entryDate,
        TYPE: 'sell',
        PRICE: shortCallStrike,
        REASONING: 'Venta de CALL como parte del Iron Condor',
        SHARES: 1
      },
      {
        DATE: entryDate,
        TYPE: 'buy',
        PRICE: longCallStrike,
        REASONING: 'Compra de CALL como protección',
        SHARES: 1
      },
      {
        DATE: entryDate,
        TYPE: 'sell',
        PRICE: shortPutStrike,
        REASONING: 'Venta de PUT como parte del Iron Condor',
        SHARES: 1
      },
      {
        DATE: entryDate,
        TYPE: 'buy',
        PRICE: longPutStrike,
        REASONING: 'Compra de PUT como protección',
        SHARES: 1
      }
    ];

    //CREACION DEL RESUMEN DEL MODELO DE SIMULACION
    const summary = {
      TOTALBOUGHTUNITS: 2,
      TOTALSOLDUNITS: 2,
      REMAININGUNITS: 0,
      FINALCASH: amount + netCredit,
      FINALVALUE: 0,
      FINALBALANCE: amount + netCredit,
      REALPROFIT: netCredit,
      PERCENTAGERETURN: percentageReturn
    };

    //CREACION DEL DETALLE DEL MODELO DE SIMULACION
    const detailRow = [
      {
        ACTIVED: true,
        DELETED: false,
        DETAIL_ROW_REG: [
          {
            CURRENT: true,
            REGDATE: new Date(),
            REGTIME: new Date().toTimeString().split(' ')[0],
            REGUSER: user.alias
          }
        ]
      }
    ];



    // Guardar en MongoDB
    await simulationSchema.create({
      IDSIMULATION: idSimulation,
      IDUSER: idUser,
      IDSTRATEGY: idStrategy,
      SIMULATIONNAME: simulationName,
      SYMBOL: symbol,
      SPECS: specs,
      AMOUNT: amount,
      STARTDATE: startDate,
      ENDDATE: endDate,
      SIGNALS: signals,
      SUMMARY: summary,
      CHART_DATA: chartData,
      DETAIL_ROW: detailRow
    });

    // Actualizar saldo de usuario
    const profitOrLoss = summary.REALPROFIT;
    const updatedBalance = await updateUserWallet(idUser, profitOrLoss, symbol);

    return {
      saved: true,
      simulationId: idSimulation,
      idStrategy,
      simulationName,
      symbol,
      specs,
      summary,
      signals,
      updatedBalance,
      chartData
    };

  } catch (error) {
    console.error('Error en SimulateIronCondor:', error);
    throw new Error(`Error al simular estrategia Iron Condor: ${error.message}`);
  }
}


// Función para actualizar la wallet del usuario con el retorno de la simulación
async function updateUserWallet(userId, profitOrLoss, symbol) {
  try {
    const user = await usersSchema.findOne({ idUser: userId }).lean();
    if (!user) throw new Error('Usuario no encontrado');

    const newBalance = user.wallet.balance + profitOrLoss;

    const movement = {
      movementId: `mov-${Date.now()}`,
      date: new Date(),
      type: profitOrLoss >= 0 ? 'deposit' : 'loss',
      amount: Math.abs(profitOrLoss),
      description: 'Resultado de simulación Iron Condor con acciones de ' + symbol
    };

    await usersSchema.updateOne(
      { idUser: userId },
      {
        $set: { 'wallet.balance': newBalance },
        $push: { 'wallet.movements': movement }
      }
    );

    return {
      ...user,
      wallet: {
        ...user.wallet,
        balance: newBalance,
        movements: [...user.wallet.movements, movement]
      }
    };
  } catch (error) {
    console.error('Error al actualizar la wallet del usuario:', error);
    throw new Error('Hubo un error al actualizar el saldo del usuario');
  }
}

// Delete Logico 
async function DeleteSimulationLogical(req) {
  const { IDSIMULATION } = req.data;
  if (!IDSIMULATION) {
    const err = new Error("Se requiere 'IDSIMULATION'");
    err.status = 400;
    throw err;
  }

  // Buscar la simulación
  const doc = await simulationSchema.findOne({ IDSIMULATION });
  if (!doc) {
    const err = new Error(`Simulación ${IDSIMULATION} no encontrada`);
    err.status = 404;
    throw err;
  }

  // Asegurar que DETAIL_ROW es array y tomar el primer elemento
  const detailArr = Array.isArray(doc.DETAIL_ROW) ? doc.DETAIL_ROW : [];
  if (detailArr.length === 0) {
    detailArr[0] = { ACTIVED: true, DELETED: false, DETAIL_ROW_REG: [] };
  }
  const detail = detailArr[0];

  // Obtener reguser del primer registro previo (si existe)
  const prevRegs = Array.isArray(detail.DETAIL_ROW_REG)
    ? detail.DETAIL_ROW_REG
    : [];
  const firstReg = prevRegs[0];
  const reguser  = firstReg?.REGUSER || 'system';

  // Invertir ACTIVED y calcular DELETED
  const newActivated = !detail.ACTIVED;
  const newDeleted   = !newActivated;
  const now          = new Date();

  // Marcar todos los previos DETAIL_ROW_REG como CURRENT=false
  const updatedRegs = prevRegs.map(r => ({
    CURRENT: false,
    REGDATE: r.REGDATE,
    REGTIME: r.REGTIME,
    REGUSER: r.REGUSER
  }));

  // Agregar nuevo registro con CURRENT=true
  updatedRegs.push({
    CURRENT: true,
    REGDATE: now,
    REGTIME: now.toISOString(),  // o lo que uses
    REGUSER: reguser
  });

  // Asignar de vuelta al documento
  detail.ACTIVED        = newActivated;
  detail.DELETED        = newDeleted;
  detail.DETAIL_ROW_REG = updatedRegs;
  doc.DETAIL_ROW = [ detail ];

  // Guardar
  await doc.save();

  // Retornar mensaje
  const message = newActivated
    ? 'La simulación ha sido ACTIVADA'
    : 'La simulación ha sido DESACTIVADA';

  return { message };
}

module.exports = { GetAllSimulation, GetSimulationsByUserId, SimulateIronCondor, UpdateSimulationName, DeleteSimulationById, GetSimulationBySymbols, GetSimulationForMonto, GetSimulationsForRangeDate, DeleteSimulationLogical };
