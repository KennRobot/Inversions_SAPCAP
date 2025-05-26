const priceHistorySchema = require('../models/MongoDB/prices_history');
const math = require('mathjs');

// === FUNCIÓN AUXILIAR: Obtener precios de cierre válidos ===
async function getValidClosePrices(symbol) {
  const data = await priceHistorySchema.find({ symbol, last: { $gt: 0 } }).sort({ date: 1 }).lean();
  if (!data || data.length < 2) throw new Error(`No hay suficientes datos para ${symbol}`);
  return { data, closePrices: data.map(e => e.last) };
}

// === FUNCIÓN: Calcular Volatilidad ===
function computeVolatility(prices) {
  const logReturns = [];
  for (let i = 1; i < prices.length; i++) {
    const prev = prices[i - 1];
    const curr = prices[i];
    if (prev > 0 && curr > 0) {
      logReturns.push(Math.log(curr / prev));
    }
  }
  return math.std(logReturns) * Math.sqrt(252);
}

// === FUNCIÓN PRINCIPAL: Calcular Prima de Opción ===
async function calculateOptionPremium(symbol, strike, type, side) {
  const { closePrices } = await getValidClosePrices(symbol);
  const price = closePrices[closePrices.length - 1];
  const volatility = computeVolatility(closePrices);
  const riskFreeRate = 0.05;
  const timeToExpiration = 30 / 365;

  const d1 = (Math.log(price / strike) + (riskFreeRate + 0.5 * volatility ** 2) * timeToExpiration) / (volatility * Math.sqrt(timeToExpiration));
  const d2 = d1 - volatility * Math.sqrt(timeToExpiration);

  const Nd1 = normalCDF(d1), Nd2 = normalCDF(d2);
  const Nnd1 = normalCDF(-d1), Nnd2 = normalCDF(-d2);
  const discount = Math.exp(-riskFreeRate * timeToExpiration);

  if (type === 'call') {
    return side === 'buy'
      ? price * Nd1 - strike * discount * Nd2
      : strike * discount * Nnd2 - price * Nnd1;
  } else if (type === 'put') {
    return side === 'buy'
      ? strike * discount * Nnd2 - price * Nnd1
      : price * Nd1 - strike * discount * Nd2;
  }

  throw new Error('Tipo de opción no válido');
}


// === FUNCIONES AUXILIARES ===
function normalCDF(x) {
  return (1 + Math.erf(x / Math.sqrt(2))) / 2;
}

if (!Math.erf) {
  Math.erf = function (x) {
    const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);
    const t = 1 / (1 + p * x);
    const y = 1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
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

function calculateRSIArray(closes, period = 14) {
  const rsiArray = Array(closes.length).fill(null);
  if (closes.length < period + 1) return rsiArray;

  for (let i = period; i < closes.length; i++) {
    const window = closes.slice(i - period, i + 1);
    let gains = 0, losses = 0;
    for (let j = 1; j < window.length; j++) {
      const change = window[j] - window[j - 1];
      if (change > 0) gains += change;
      else losses -= change;
    }
    gains /= period;
    losses /= period;
    const rs = losses === 0 ? 100 : gains / losses;
    const rsi = losses === 0 ? 100 : 100 - (100 / (1 + rs));
    rsiArray[i] = parseFloat(rsi.toFixed(2));
  }
  return rsiArray;
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
  const { data, closePrices } = await getValidClosePrices(symbol);
  const closes = data.map(entry => entry.last);

  if (closes.length < 30) {
    throw new Error(`No hay suficientes datos para ${symbol}. Tiene ${closes.length}`);
  }

  const volatility = computeVolatility(closePrices);
  const rsiArray = calculateRSIArray(closes);  // <-- aquí usamos el nuevo RSI por array
  const macdArray = calculateMACD(closes);

  return data.map((entry, i) => ({
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
        VALUE: rsiArray[i]
      },
      {
        INDICATOR: 'MACD',
        VALUE: macdArray[i]
      }
    ].filter(ind => ind.VALUE !== null)
  }));
}


module.exports = {
  calculateOptionPremium,
  normalCDF,
  calculateEMA,
  calculateMACD,
  generateChartData
};
