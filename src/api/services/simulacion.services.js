const simulationSchema = require('../models/MongoDB/simulation');
const { v4: uuidv4 } = require('uuid');
const { calculateOptionPremium, calculateVolatility, normalCDF } = require('../utils/calculatorsSimulations');
const usersSchema = require('../models/MongoDB/users');

//OBTENER TODAS LAS SIMULACIONES
async function GetAllSimulation(req) {
  try {
    let simulation = await simulationSchema.find().lean(); 
    return simulation;
  } catch (error) {
    return error;
  }
}
//FALTA POR ACTUALIZAR
async function GetSimulationsByUserId(req) {
  try {
    // Obtener el USER_ID desde el cuerpo de la solicitud (req.data)
    const { USER_ID } = req.data; // Asumiendo que el body es { "USER_ID": "user-001" }

    if (!USER_ID) {
      throw new Error("El ID de usuario no fue proporcionado.");
    }

    // Buscar todas las simulaciones del usuario por el ID en la base de datos
    const simulations = await simulationSchema.find({ idUser: USER_ID }).lean(); 

    // Verificar si no hay simulaciones
    if (!simulations || simulations.length === 0) {
      throw new Error(`No se encontraron simulaciones para el usuario con ID ${USER_ID}`);
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
      idStrategy = 'IronCondor'
    } = req.data;

    // Validaciones básicas
    if (!symbol || !idUser || !shortCallStrike || !longCallStrike || !shortPutStrike || !longPutStrike) {
      throw new Error('Faltan datos obligatorios para la simulación.');
    }
    
    // Obtener usuario y validar saldo suficiente
    const user = await usersSchema.findOne({ idUser }).lean();
    if (!user) {
      throw cds.error('Usuario no encontrado.', { code: 'USER_NOT_FOUND', status: 404 });
    }

    if (user.wallet.balance < amount) {
      throw cds.error(
        'Saldo insuficiente para realizar la simulación.',
        { code: 'INSUFFICIENT_FUNDS', status: 400 }
      );
    }

    const IndicadorVIX = await calculateVolatility(symbol);

    // Cálculo de primas
    const premiumShortCall = await calculateOptionPremium(symbol, shortCallStrike, 'call', 'sell');
    const premiumLongCall = await calculateOptionPremium(symbol, longCallStrike, 'call', 'buy');
    const premiumShortPut = await calculateOptionPremium(symbol, shortPutStrike, 'put', 'sell');
    const premiumLongPut = await calculateOptionPremium(symbol, longPutStrike, 'put', 'buy');

    const netCredit = premiumShortCall + premiumShortPut - premiumLongCall - premiumLongPut;
    const maxLoss = (longCallStrike - shortCallStrike) + (shortPutStrike - longPutStrike) - netCredit;
    const maxProfit = netCredit;
    const riskRewardRatio = maxProfit / maxLoss;
    const percentageReturn = (netCredit / amount) * 100;

    const simulation = await simulationSchema.create({
      idSimulation: uuidv4(),
      idUser,
      idStrategy,
      symbol,
      entryDate,
      expiryDate,
      startDate,
      endDate,
      amount,
      simulationName,
      legs: [
        { strike: shortCallStrike, type: 'call', side: 'sell', premium: premiumShortCall },
        { strike: longCallStrike, type: 'call', side: 'buy', premium: premiumLongCall },
        { strike: shortPutStrike, type: 'put', side: 'sell', premium: premiumShortPut },
        { strike: longPutStrike, type: 'put', side: 'buy', premium: premiumLongPut }
      ],
      result: {
        netCredit,
        maxLoss,
        maxProfit,
        riskRewardRatio,
        percentageReturn,
      }
    });

    const profitOrLoss = (percentageReturn / 100) * amount;
    const updatedBalance = await updateUserWallet(idUser, profitOrLoss, symbol);

    return {
      netCredit,
      maxLoss,
      maxProfit,
      riskRewardRatio,
      percentageReturn,
      IndicadorVIX,
      saved: true,
      simulationId: simulation.idSimulation,
      updatedBalance
    };

  } catch (error) {
    console.error('Error en SimulateIronCondor:', error);
    throw new Error(`Error al simular estrategia Iron Condor: ${error.message}`);
  }
}
// Función para actualizar el nombre de la simulación
async function UpdateSimulationName(req) {
  try {
    const { idSimulation, newName } = req.data;

    // Validación de entrada
    if (!idSimulation || !newName) {
      throw new Error('Se requiere el ID de la simulación y el nuevo nombre.');
    }

    // Verificar que exista la simulación
    const simulation = await simulationSchema.findOne({ idSimulation }).lean();
    if (!simulation) {
      throw new Error(`Simulación con ID ${idSimulation} no encontrada.`);
    }

    // Actualizar el nombre de la simulación
    await simulationSchema.updateOne(
      { idSimulation },
      { $set: { simulationName: newName } }
    );

    return {
      success: true,
      message: `Nombre de la simulación actualizado a "${newName}".`,
      idSimulation,
      newName
    };

  } catch (error) {
    console.error('Error en UpdateSimulationName:', error);
    throw new Error(`Error al actualizar el nombre de la simulación: ${error.message}`);
  }
}

// Delete simulation by ID
async function DeleteSimulationById(id) {
  const deleted = await simulationSchema.deleteOne({ idSimulation: id });
  if (deleted.deletedCount === 0) throw new Error('Simulación no encontrada');
  return { idSimulation: id, status: 'deleted' };
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


module.exports = { GetAllSimulation, GetSimulationsByUserId, SimulateIronCondor, UpdateSimulationName, DeleteSimulationById, GetSimulationBySymbols, GetSimulationForMonto, GetSimulationsForRangeDate };
