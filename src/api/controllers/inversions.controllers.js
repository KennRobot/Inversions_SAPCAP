const cds = require('@sap/cds');
const {GetAllUsers,GetUserById } = require('../services/users.services')
const {GetAllStrategies, CreateIronCondorStrategy} = require('../services/strategies.services')

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

        // Llamada al método init del servicio base de CAP
        return await super.init();
    }       
};