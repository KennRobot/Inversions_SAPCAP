const priceHistorySchema = require('../models/MongoDB/prices_history');
const math = require('mathjs');

// Calcular la volatilidad histórica utilizando los precios de cierre
//INDICADOR VIX
async function calculateVolatility(symbol) {
  try {
    const data = await priceHistorySchema.find({ symbol }).sort({ date: 1 }).lean();
    
    if (!data || data.length < 2) {
      throw new Error(`No hay suficientes datos para calcular la volatilidad de ${symbol}`);
    }

    // Obtener precios de cierre
    const closePrices = data.map(entry => entry.last);

    // Calcular los retornos logarítmicos
    const logReturns = [];

    for (let i = 1; i < closePrices.length; i++) {
      const prev = closePrices[i - 1];
      const current = closePrices[i];

      if (
        typeof prev === 'number' && !isNaN(prev) && prev > 0 &&
        typeof current === 'number' && !isNaN(current) && current > 0
      ) {
        const logReturn = Math.log(current / prev);
        logReturns.push(logReturn);

        // Imprimir solo precios válidos usados en el cálculo
       //console.log(`Precios válidos en posición ${i}: prev=${prev}, current=${current}, logReturn=${logReturn}`);
      }
    }

    // Calcular la desviación estándar de los retornos logarítmicos
    const volatility = math.std(logReturns) * Math.sqrt(252); // Usamos 252 como días de trading en un año

    return volatility;
  } catch (error) {
    console.error(`Error al calcular volatilidad para ${symbol}:`, error);
    throw new Error('Hubo un error al calcular la volatilidad.');
  }
}

async function calculateOptionPremium(symbol, strike, type, side) {
  // Obtener datos requeridos
  const price = await getCurrentPrice(symbol); // Obtener el precio actual del activo
  const volatility = await calculateVolatility(symbol); // Calcular la volatilidad histórica
  const riskFreeRate = 0.05; // Tasa libre de riesgo (5% como ejemplo)
  const timeToExpiration = 30 / 365; // Tiempo hasta la expiración (en años). Aquí asumimos 30 días

  // Calcular d1 y d2
  const d1 = (math.log(price / strike) + (riskFreeRate + 0.5 * math.pow(volatility, 2)) * timeToExpiration) / (volatility * math.sqrt(timeToExpiration));
  const d2 = d1 - volatility * math.sqrt(timeToExpiration);

  // Calcular la prima de la opción (Call o Put)
  if (type === 'call') {
    if (side === 'buy') {
      return price * normalCDF(d1) - strike * math.exp(-riskFreeRate * timeToExpiration) * normalCDF(d2);
    } else if (side === 'sell') {
      return strike * math.exp(-riskFreeRate * timeToExpiration) * normalCDF(-d2) - price * normalCDF(-d1);
    }
  } else if (type === 'put') {
    if (side === 'buy') {
      return strike * math.exp(-riskFreeRate * timeToExpiration) * normalCDF(-d2) - price * normalCDF(-d1);
    } else if (side === 'sell') {
      return price * normalCDF(d1) - strike * math.exp(-riskFreeRate * timeToExpiration) * normalCDF(d2);
    }
  }

  throw new Error('Tipo de opción no válido');
}

// Obtener el precio más reciente del símbolo desde la colección de historial de precios
async function getCurrentPrice(symbol) {
  const latest = await priceHistorySchema.findOne({symbol: symbol,
    last: { $gt: 0 }
  }).sort({ date: -1 });


  //console.log('Precio encontrado para', symbol, ':', latest); // <== Añade esto


  if (!latest || typeof latest.last !== 'number') {
    throw new Error(`No se pudo encontrar el precio actual para el símbolo ${symbol}`);
  }

  return latest.last;
}


// Función de distribución acumulativa de la normal estándar
function normalCDF(x) {
  return (1.0 + Math.erf(x / Math.sqrt(2))) / 2.0;
}

// Polyfill de Math.erf si no está disponible (algunas versiones de Node.js no lo incluyen)
if (!Math.erf) {
  Math.erf = function (x) {
    // Aproximación de Abramowitz y Stegun fórmula 7.1.26
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;

    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
  };
}

//calcular solo el indicador RSI
function calculateRSI(closes, period = 14) {
  if (closes.length < period + 1) return null;
  let gains = 0;
  let losses = 0;
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
//calcular solo el indicador MACD
function calculateMACD(closes, shortPeriod = 12, longPeriod = 26) {
  if (closes.length < longPeriod) return { macd: null };
  const shortEMA = calculateEMA(closes, shortPeriod);
  const longEMA = calculateEMA(closes, longPeriod);
  const macdArray = shortEMA.map((val, idx) =>
    idx < longPeriod - 1 ? null : parseFloat((val - longEMA[idx]).toFixed(2))
  );
  const recentMacd = macdArray[macdArray.length - 1];
  return { macd: recentMacd };
}

//funcion para obtener los indicadores RSI y MACD
async function calculateIndicators(symbol) {
  try {
    const data = await priceHistorySchema.find({ symbol }).sort({ date: 1 }).lean();

    if (!data || data.length < 30) {
      throw new Error(`No hay suficientes datos para calcular indicadores para ${symbol}`);
    }

    // Obtener precios de cierre
    const closes = data.map(entry => entry.last);

    // Calcular RSI y MACD
    const RSI = calculateRSI(closes);
    const { macd: MACD } = calculateMACD(closes);

    return {
      RSI,
      MACD
    };
  } catch (error) {
    console.error(`Error al calcular indicadores para ${symbol}:`, error);
    throw new Error('Hubo un error al calcular los indicadores RSI y MACD.');
  }
}


module.exports = { calculateVolatility, calculateOptionPremium , normalCDF, calculateEMA, calculateRSI, calculateMACD, calculateIndicators };