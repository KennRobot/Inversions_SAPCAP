const cds = require('@sap/cds');
const {GetAllUsers,GetUserById, CreateUser } = require('../services/users.services')
const {GetAllStrategies, CreateIronCondorStrategy, GetStrategiesByUser} = require('../services/strategies.services')
const {GetAllSimulation} = require('../services/simulacion.services')
const {fetchHistoricalOptions} = require('../models/MongoDB/alphavantage')
const { calculateIndicators } = require('../services/ironcondor');
const {GetAllPricesHistory} = require('../services/priceshistory.services')


module.exports = class InversionsClass extends cds.ApplicationService {
    async init() {
      //****************** PARA USERS ***********************/
        // Evento para obtener todos los usuarios
        this.on('GetAllUsers', async (req) => {
            return await GetAllUsers(req);
        });

        // Evento para obtener un usuario
        this.on('GetUserById', async (req) => {
            return await GetUserById(req);
        });

        //****************** PARA STRATEGIES ***********************/
        this.on('GetAllStrategies', async (req) => {
            return await GetAllStrategies(req);
        });
        this.on('CreateIronCondorStrategy', async (req) => {
            return await CreateIronCondorStrategy(req);
        });
        this.on('GetStrategiesByUser', async (req) => {
            return await GetStrategiesByUser(req);
        });

        //****************** PARA SIMULATION ***********************/
        this.on('GetAllSimulation', async (req) => {
            return await GetAllSimulation(req);
        })

        //****************** PARA OBTENER OPCIONES HISTÓRICAS ***********************/
        this.on('GetAllPricesHistory', async (req) => {
            return await GetAllPricesHistory(req);
        })

        //****************** PARA CALCULAR INDICADORES ***********************/
        this.on('CalculateIndicators', async (req) => {
            const { symbol, indicators } = req.data;
            
            try {
                // 1. Obtener los precios históricos
                const historicalData = await fetchHistoricalOptions(symbol);

                if (historicalData.length === 0) {
                    return { message: 'No se encontraron precios históricos para el símbolo proporcionado.' };
                }

                // 2. Extraer los precios de las opciones (usamos solo 'last' de cada contrato)
                const prices = historicalData.map(option => parseFloat(option.last));

                if (prices.length === 0) {
                    return { message: 'No hay datos de precios disponibles para calcular indicadores.' };
                }

                // 3. Calcular los indicadores usando los precios históricos
                const result = await calculateIndicators(symbol, indicators); // Se espera el resultado de la función asíncrona

                // 4. Devolver los resultados calculados
                return { indicators: result };
            } catch (error) {
                console.error('Error calculating indicators:', error.message);
                return { message: 'Hubo un error al calcular los indicadores.' };
            }
        });
        // Llamada al método init del servicio base de CAP 

      // Handler para crear usuario:
      this.on('CreateUser', async (req) => {
        try {
          const user = await CreateUser(req);
          // CAP responde con status 201 automáticamente en actions
          return user;
        } catch (err) {
          // errores custom con status
          if (err.status)  return req.reject(err.status,  err.message);
          return req.reject(500, err.message);
        }
      });
  
      return super.init();
    }
};