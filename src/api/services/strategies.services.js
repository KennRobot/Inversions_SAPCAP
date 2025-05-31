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

//Actualizar Estrategia
async function UpdateStrategy(req) {
  try {
    const { 
      LABELID,
      VALUE,
      ALIAS,
      VALUEID,
      DESCRIPTION,
      USER_ID // Para registrar quién realizó la actualización
    } = req.data;

    // Validación básica
    if (!LABELID) {
      throw {
        status: 400,
        message: 'LABELID es obligatorio para actualizar una estrategia.'
      };
    }

    // Buscar la estrategia existente por LABELID
    const strategy = await strategiesSchema.findOne({ LABELID });

    if (!strategy) {
      throw {
        status: 404,
        message: `No se encontró ninguna estrategia con LABELID: ${LABELID}`
      };
    }

    // Actualizar los campos si están presentes en el request
    if (VALUE !== undefined) strategy.VALUE = VALUE;
    if (ALIAS !== undefined) strategy.ALIAS = ALIAS;
    if (VALUEID !== undefined) strategy.VALUEID = VALUEID;
    if (DESCRIPTION !== undefined) strategy.DESCRIPTION = DESCRIPTION;

    // Actualizar DETAIL_ROW para registrar modificación
    if (!strategy.DETAIL_ROW) strategy.DETAIL_ROW = {};
    if (!Array.isArray(strategy.DETAIL_ROW.DETAIL_ROW_REG)) {
      strategy.DETAIL_ROW.DETAIL_ROW_REG = [];
    }

    strategy.DETAIL_ROW.DETAIL_ROW_REG.push({
      CURRENT: false, // Puedes marcar los anteriores como no actuales
      REGDATE: new Date(),
      REGTIME: new Date(),
      REGUSER: USER_ID || 'system'
    });

    // Opcionalmente, podrías marcar solo el último como CURRENT = true
    strategy.DETAIL_ROW.DETAIL_ROW_REG[strategy.DETAIL_ROW.DETAIL_ROW_REG.length - 1].CURRENT = true;

    // Guardar cambios
    const updatedStrategy = await strategy.save();
    return updatedStrategy.toObject();

  } catch (error) {
    console.error('Error en UpdateStrategy:', error);
    if (error.status) {
      throw error; // Errores personalizados
    }
    throw {
      status: 500,
      message: `Error al actualizar la estrategia: ${error.message}`
    };
  }
}



// Borrado logico 
async function DeleteStrategyLogical(req) {
  const { LABELID } = req.data;
  if (!LABELID) {
    const err = new Error("Se requiere 'LABELID'");
    err.status = 400;
    throw err;
  }

  // Cargar el doc
  const doc = await strategiesSchema.findOne({ LABELID });
  if (!doc) {
    const err = new Error(`Estrategia con LABELID=${LABELID} no encontrada`);
    err.status = 404;
    throw err;
  }

  // Extraer el usuario del primer registro
  const firstReg = doc.DETAIL_ROW.DETAIL_ROW_REG[0];
  const userId   = (firstReg && firstReg.REGUSER) ? firstReg.REGUSER : 'system';

  // Invertir ACTIVED y calcular DELETED
  const newActivated = !doc.DETAIL_ROW.ACTIVED;
  const newDeleted   = !newActivated;
  const now          = new Date();

  // Marcar todos los registros previos CURRENT=false
  const regs = doc.DETAIL_ROW.DETAIL_ROW_REG.map(r => ({
    ...r.toObject(),
    CURRENT: false
  }));

  // Agregar el nuevo registro como CURRENT=true usando userId
  regs.push({
    CURRENT: true,
    REGDATE: now,
    REGTIME: now,
    REGUSER: userId
  });

  // Guardar cambios en el documento
  doc.DETAIL_ROW.ACTIVED        = newActivated;
  doc.DETAIL_ROW.DELETED        = newDeleted;
  doc.DETAIL_ROW.DETAIL_ROW_REG = regs;
  await doc.save();

  // Mensaje según nuevo estado
  const message = newActivated
    ? 'La estrategia ha sido ACTIVADA'
    : 'La estrategia ha sido DESACTIVADA';

  return { message };
}

module.exports = { GetAllStrategies, CreateStrategy, DeleteStrategyLogical, UpdateStrategy };