const cds = require('@sap/cds');
const {GetAllUsers,GetUserById } = require('../services/users.services')
const {GetAllStrategies, CreateIronCondorStrategy, GetStrategiesByUser} = require('../services/strategies.services')
const {GetAllSimulation} = require('../services/simulacion.services')
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

        // Llamada al método init del servicio base de CAP
        return await super.init();
    }       
};