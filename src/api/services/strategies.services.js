//************* SERVICIO PARA MONGO DB */
const strategiesSchema = require('../models/MongoDB/strategies');

async function GetAllStrategies(req) {
  try {
    let strategie = await strategiesSchema.find().lean(); 
    return strategie;
  } catch (error) {
    return error;
  }
}

module.exports = { GetAllStrategies};