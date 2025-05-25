const priceHistorySchema = require('../models/MongoDB/prices_history');
const math = require('mathjs');

// === FUNCIÓN PRINCIPAL: Calcular Prima de Opción ===
async function calculateOptionPremium(symbol, strike, type, side) {
  const data = await priceHistorySchema.find({ symbol, last: { $gt: 0 } }).sort({ date: 1 }).lean();

  if (!data || data.length < 2) {
    throw new Error(`No hay suficientes datos para ${symbol}`);
  }

  const closePrices = data.map(entry => entry.last);
  const price = closePrices[closePrices.length - 1];

  const logReturns = [];
  for (let i = 1; i < closePrices.length; i++) {
    const prev = closePrices[i - 1];
    const current = closePrices[i];
    if (typeof prev === 'number' && prev > 0 && typeof current === 'number' && current > 0) {
      logReturns.push(Math.log(current / prev));
    }
  }

  const volatility = math.std(logReturns) * Math.sqrt(252);
  const riskFreeRate = 0.05;
  const timeToExpiration = 30 / 365;

  const d1 = (math.log(price / strike) + (riskFreeRate + 0.5 * math.pow(volatility, 2)) * timeToExpiration) / (volatility * math.sqrt(timeToExpiration));
  const d2 = d1 - volatility * math.sqrt(timeToExpiration);

  if (type === 'call') {
    return side === 'buy'
      ? price * normalCDF(d1) - strike * math.exp(-riskFreeRate * timeToExpiration) * normalCDF(d2)
      : strike * math.exp(-riskFreeRate * timeToExpiration) * normalCDF(-d2) - price * normalCDF(-d1);
  } else if (type === 'put') {
    return side === 'buy'
      ? strike * math.exp(-riskFreeRate * timeToExpiration) * normalCDF(-d2) - price * normalCDF(-d1)
      : price * normalCDF(d1) - strike * math.exp(-riskFreeRate * timeToExpiration) * normalCDF(d2);
  }

  throw new Error('Tipo de opción no válido');
}

// === FUNCIÓN: Calcular Volatilidad ===
async function calculateVolatility(symbol) {
  const data = await priceHistorySchema.find({ symbol }).sort({ date: 1 }).lean();
  if (!data || data.length < 2) throw new Error(`No hay suficientes datos para ${symbol}`);
  const closePrices = data.map(entry => entry.last);
  const logReturns = [];
  for (let i = 1; i < closePrices.length; i++) {
    const prev = closePrices[i - 1];
    const current = closePrices[i];
    if (typeof prev === 'number' && prev > 0 && typeof current === 'number' && current > 0) {
      logReturns.push(Math.log(current / prev));
    }
  }
  return math.std(logReturns) * Math.sqrt(252);
}

// === FUNCIONES AUXILIARES ===
function normalCDF(x) {
  return (1.0 + Math.erf(x / Math.sqrt(2))) / 2.0;
}

if (!Math.erf) {
  Math.erf = function (x) {
    const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);
    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    return sign * y;
  };
}

function calculateEMA(closes, period) {
  const k = 2 / (period + 1);
  let emaArray = [closes[0]];
  for (let i = 1; i < closes.length; i++) {
    const ema = closes[i] * k + emaArray[i - 1] * (1 - k);
    emaArray.push(parseFloat(ema.toFixed(2)));
  }
  return emaArray;
}

function calculateRSI(closes, period = 14) {
  if (closes.length < period + 1) return null;
  let gains = 0, losses = 0;
  for (let i = 1; i <= period; i++) {
    const change = closes[i] - closes[i - 1];
    if (change > 0) gains += change;
    else losses -= change;
  }
  gains /= period;
  losses /= period;
  if (losses === 0) return 100;
  const rs = gains / losses;
  return parseFloat((100 - (100 / (1 + rs))).toFixed(2));
}

function calculateMACD(closes, shortPeriod = 12, longPeriod = 26) {
  if (closes.length < longPeriod) return Array(closes.length).fill(null);
  const shortEMA = calculateEMA(closes, shortPeriod);
  const longEMA = calculateEMA(closes, longPeriod);
  return shortEMA.map((val, idx) =>
    idx < longPeriod - 1 ? null : parseFloat((val - longEMA[idx]).toFixed(2))
  );
}

// === FUNCIÓN: Generar datos del gráfico con indicadores ===
async function generateChartData(symbol) {
  const data = await priceHistorySchema.find({ symbol }).sort({ date: 1 }).lean();

  if (!data || data.length < 30) {
    throw new Error(`No hay suficientes datos para generar gráfico de ${symbol}`);
  }

  const closes = data.map(entry => entry.last);
  const volatility = await calculateVolatility(symbol); // indicador VIX (valor único)
  const rsiArray = closes.map((_, idx) => idx < 14 ? null : calculateRSI(closes.slice(idx - 14, idx + 1)));
  const macdArray = calculateMACD(closes);

const chart_data = data.map((entry, idx) => ({
  DATE: entry.date,
  OPEN: entry.open ?? null,  
  HIGH: entry.high ?? null,
  LOW: entry.low ?? null,
  CLOSE: entry.last,
  VOLUME: entry.volume,
  INDICATORS: [
    {
      INDICATOR: 'VIX',
      VALUE: parseFloat(volatility.toFixed(4))
    },
    {
      INDICATOR: 'RSI',
      VALUE: rsiArray[idx]
    },
    {
      INDICATOR: 'MACD',
      VALUE: macdArray[idx]
    }
  ].filter(i => i.VALUE !== null)
}));


  return chart_data;
}

module.exports = {
  calculateVolatility,
  calculateOptionPremium,
  normalCDF,
  calculateEMA,
  calculateRSI,
  calculateMACD,
  generateChartData
};
