const cds = require('@sap/cds');
const {GetAllUsers} = require('../services/users.services')

module.exports = class InversionsClass extends cds.ApplicationService {
    async init() {
      //****************** PARA MONGODB ***********************/
        // Evento para obtener todos los datos de MongoDB
        this.on('GetAllUsers', async (req) => {
            return await GetAllUsers(req);
        });

        // Llamada al método init del servicio base de CAP
        return await super.init();
    }       
};