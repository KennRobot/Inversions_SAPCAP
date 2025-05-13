const simulationSchema = require('../models/MongoDB/simulation');
const { v4: uuidv4 } = require('uuid');
const { calculateOptionPremium, calculateVolatility, normalCDF } = require('../utils/calculatorsSimilations');

async function GetAllSimulation(req) {
  try {
    let simulation = await simulationSchema.find().lean(); 
    return simulation;
  } catch (error) {
    return error;
  }
}
async function GetSimulatonByUserId(req) {
  try {
    // Obtener el USER_ID desde el cuerpo de la solicitud (req.data)
    const { USER_ID } = req.data; // Asumiendo que el body es { "USER_ID": "user-001" }

    if (!USER_ID) {
      throw new Error("El ID de usuario no fue proporcionado.");
    }

    // Buscar el usuario por su ID en la base de datos
    const user = await simulationSchema.findOne({ idUser: USER_ID }).lean();

    // Si no se encuentra el usuario, lanzar un error
    if (!user) {
      throw new Error(`No se encontró un usuario con el ID ${USER_ID}`);
    }

    // Retornar el usuario encontrado
    return user;

  } catch (error) {
    // Manejo de errores
    throw new Error(`Error al obtener el usuario por ID: ${error.message}`);
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
      strategy: idStrategy,
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
        percentageReturn
      }
    });

    return {
      netCredit,
      maxLoss,
      maxProfit,
      riskRewardRatio,
      percentageReturn,
      saved: true,
      simulationId: simulation.idSimulation
    };

  } catch (error) {
    console.error('Error en SimulateIronCondor:', error);
    throw new Error(`Error al simular estrategia Iron Condor: ${error.message}`);
  }
}


module.exports = { GetAllSimulation, GetSimulatonByUserId, SimulateIronCondor };