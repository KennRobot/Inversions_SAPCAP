const priceHistorySchema = require('../models/MongoDB/prices_history');

async function GetAllPricesHistory(req) {
  try {
    let prices_history = await priceHistorySchema.find().lean(); 
    return prices_history;
  } catch (error) {
    return error;
  }
}

async function GetPricesHistoryBySymbol(req) {
  try {
    const { symbol } = req.data;
    let prices_historys = await priceHistorySchema.find({ symbol }).lean(); 
    return {
      prices_historys: prices_historys
    };
  } catch (error) {
    return error;
  }
}

module.exports = {  GetAllPricesHistory, GetPricesHistoryBySymbol };