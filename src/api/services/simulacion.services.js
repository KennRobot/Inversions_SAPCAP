const simulationSchema = require('../models/MongoDB/simulation');


async function GetAllSimulation(req) {
  try {
    let simulation = await simulationSchema.find().lean(); 
    return simulation;
  } catch (error) {
    return error;
  }
}

module.exports = { GetAllSimulation };