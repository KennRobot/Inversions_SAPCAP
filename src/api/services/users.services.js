//************* SERVICIO PARA MONGO DB */
const usersSchema = require('../models/MongoDB/users');

async function GetAllUsers(req) {
  try {
    let users = await usersSchema.find().lean(); 
    return users;
  } catch (error) {
    return error;
  }
}

module.exports = { GetAllUsers};