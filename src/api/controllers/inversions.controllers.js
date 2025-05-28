const cds = require('@sap/cds');
const {GetAllUsers,GetUserById, CreateUser, UpdateUser } = require('../services/users.services')
const {GetAllStrategies, CreateStrategy, GetStrategiesByUser,DeleteStrategyLogical} = require('../services/strategies.services')
const {GetAllSimulation, GetSimulationsByUserId, SimulateIronCondor, UpdateSimulationName, DeleteSimulationById, GetSimulationBySymbols, GetSimulationForMonto, GetSimulationsForRangeDate, DeleteSimulationLogical} = require('../services/simulacion.services')
const {GetAllPricesHistory , calculateIndicators, GetPricesHistoryBySymbol} = require('../services/priceshistory.services')


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

        //Evento para actualizar un usuario
        this.on('UpdateUser', async (req) => {
            return await UpdateUser(req);
        });

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

        //****************** PARA STRATEGIES ***********************/
        this.on('GetAllStrategies', async (req) => {
            return await GetAllStrategies(req);
        });
        this.on('CreateStrategy', async (req) => {
            try {
                const strategy = await CreateStrategy(req);
                return strategy;
            } catch (err) {
                if (err.status) return req.reject(err.status, err.message);
                return req.reject(500, err.message);
            }
        });
        this.on('GetStrategiesByUser', async (req) => {
            return await GetStrategiesByUser(req);
        });

        //Borrado logico de estrategias
        this.on('DeleteStrategyLogical', async req => {
        return await DeleteStrategyLogical(req);
        });

        //****************** PARA SIMULATION ***********************/
        this.on('GetAllSimulation', async (req) => {
            return await GetAllSimulation(req);
        })
        // Evento para obtener las simulaciones de un usuario
        this.on('GetSimulationsByUserId', async (req) => {
            return await GetSimulationsByUserId(req);
        });
        // Evento para obtener las simulaciones de un simbolo/acciones
        this.on('GetSimulationBySymbols', async (req) => {
            return await GetSimulationBySymbols(req);
        });
        // Evento para obtener las simulaciones de un rango de dinero invertido
        this.on('GetSimulationForMonto', async (req) => {
            return await GetSimulationForMonto(req);
        });
        // Evento para obtener las simulaciones de un rango de fechas
        this.on('GetSimulationsForRangeDate', async (req) => {
            return await GetSimulationsForRangeDate(req);
        });
        // Evento para simular estrategia Iron Condor
        this.on('SimulateIronCondor', async (req) => {
          return await SimulateIronCondor(req);
        });

        // Evento para actualizar el nombre de una simulación
        this.on('UpdateSimulationName', async (req) => {
            return await UpdateSimulationName(req);
        });

        // Handler para eliminar simulación por ID
        this.on('DeleteSimulation', async (req) => {
        const { id } = req.data;
        if (!id) return req.reject(400, 'Falta el parámetro "id"');
        return await DeleteSimulationById(id);
        });
        //Borrado logico de simulacion
        this.on('DeleteSimulationLogical', async req => {
        return await DeleteSimulationLogical(req);
        });

        //****************** PARA OBTENER OPCIONES HISTÓRICAS ***********************/
        this.on('GetAllPricesHistory', async (req) => {
            return await GetAllPricesHistory(req);
        })

        this.on('GetPricesHistoryBySymbol', async (req) => {
            return await GetPricesHistoryBySymbol(req);
        })

  
      return super.init();
    }
};