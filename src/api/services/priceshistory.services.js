const priceHistorySchema = require('../models/MongoDB/prices_history');


async function GetAllPricesHistory(req) {
  try {
    let prices_history = await priceHistorySchema.find().lean(); 
    return prices_history;
  } catch (error) {
    return error;
  }
}

module.exports = {  GetAllPricesHistory };