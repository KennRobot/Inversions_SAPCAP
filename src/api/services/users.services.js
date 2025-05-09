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

async function GetUserById(req) {
  try {
    // Obtener el USER_ID desde el cuerpo de la solicitud (req.data)
    const { USER_ID } = req.data; // Asumiendo que el body es { "USER_ID": "user-001" }

    if (!USER_ID) {
      throw new Error("El ID de usuario no fue proporcionado.");
    }

    // Buscar el usuario por su ID en la base de datos
    const user = await usersSchema.findOne({ idUser: USER_ID }).lean();

    // Si no se encuentra el usuario, lanzar un error
    if (!user) {
      throw new Error(`No se encontró un usuario con el ID ${USER_ID}`);
    }

    // Retornar el usuario encontrado
    return user;

  } catch (error) {
    // Manejo de errores
    throw new Error(`Error al obtener el usuario por ID: ${error.message}`);
  }
}

module.exports = { GetAllUsers, GetUserById};