//************* SERVICIO PARA MONGO DB */
const strategiesSchema = require('../models/MongoDB/strategies');
const { v4: uuidv4 } = require('uuid');

async function GetAllStrategies(req) {
  try {
    let strategie = await strategiesSchema.find().lean(); 
    return strategie;
  } catch (error) {
    return error;
  }
}

async function CreateStrategy(req) {
  try {
    const { 
      VALUEID,
      VALUE,
      LABELID,
      COMPANYID,
      CEDIID,
      ALIAS,
      SEQUENCE,
      IMAGE,
      DESCRIPTION,
      USER_ID // Asumiendo que necesitamos asociar el usuario creador
    } = req.data;

    // Validación básica de campos requeridos
    if (!VALUEID || !VALUE || !LABELID || !COMPANYID || !CEDIID) {
      throw {
        status: 400,
        message: 'Faltan campos obligatorios: VALUEID, VALUE, LABELID, COMPANYID, CEDIID'
      };
    }

    // Estructura de DETAIL_ROW según el modelo
    const detailRow = {
      ACTIVED: true,
      DELETED: false,
      DETAIL_ROW_REG: [{
        CURRENT: true,
        REGDATE: new Date(),
        REGTIME: new Date(),
        REGUSER: USER_ID || 'system' // Usar USER_ID o 'system' si no está disponible
      }]
    };

    const newStrategy = new strategiesSchema({
      VALUEID,
      LABELID,
      VALUE,
      ALIAS: ALIAS || '',
      COMPANYID,
      CEDIID,
      VALUEPAID: '', // Valor por defecto según modelo
      SEQUENCE: SEQUENCE || 0,
      IMAGE: IMAGE || '',
      DESCRIPTION: DESCRIPTION || '',
      DETAIL_ROW: detailRow,
      USER_ID // Asociar el usuario creador si es necesario
    });

    const savedStrategy = await newStrategy.save();
    return savedStrategy.toObject(); // Devuelve como objeto simple

  } catch (error) {
    console.error('Error en CreateStrategy:', error);
    if (error.status) {
      throw error; // Preserva errores personalizados
    }
    throw {
      status: 500,
      message: `Error al crear la estrategia: ${error.message}`
    };
  }
}

async function GetStrategiesByUser(req) {
  try {
    // Obtener el USER_ID desde el cuerpo de la solicitud (req.data)
    const { USER_ID } = req.data; // Asumiendo que el body es { "USER_ID": "user-001" }

    if (!USER_ID) {
      throw new Error("El ID de usuario no fue proporcionado.");
    }

    // Buscar estrategias por el userId
    const strategies = await strategiesSchema.find({ USER_ID }).lean();
    
    return strategies;
  } catch (error) {
    throw new Error(`Error al obtener las estrategias: ${error.message}`);
  }
}


module.exports = { GetAllStrategies, CreateStrategy, GetStrategiesByUser };