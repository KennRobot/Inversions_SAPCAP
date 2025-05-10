const cds = require('@sap/cds');
const { fetchHistoricalOptions } = require('./utils/alphaVantage');

module.exports = cds.service.impl(async function () {
  const { Simulation } = this.entities;

  this.on('fetchOptionsData', async (req) => {
    const { symbol } = req.data;

    try {
      const optionsData = await fetchHistoricalOptions(symbol);
      return { symbol, optionsData };
    } catch (err) {
      req.error(500, `No se pudo obtener opciones para ${symbol}`);
    }
  });
});
