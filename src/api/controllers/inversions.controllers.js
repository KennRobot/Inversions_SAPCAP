const cds = require('@sap/cds');
const {GetAllUsers,GetUserById } = require('../services/users.services')
const {GetAllStrategies, CreateIronCondorStrategy, GetStrategiesByUser} = require('../services/strategies.services')
const {GetAllSimulation} = require('../services/simulacion.services')
const {fetchHistoricalOptions} = require('../models/MongoDB/priceshistory')

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
        this.on('GetHistoricalOptions', async (req) => {
            const { symbol } = req.data;
            try {
            const options = await fetchHistoricalOptions(symbol);
            return { optionsData: options }; // 👈 MUY IMPORTANTE: debes envolver en objeto con "optionsData"
        } catch (error) {
            console.error('Error fetching options:', error.message);
            return { optionsData: [] };
        }
        });

        // Llamada al método init del servicio base de CAP
        return await super.init();
    }       
};