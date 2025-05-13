const mongoose = require('mongoose');

const detailRowRegSchema = new mongoose.Schema({
  CURRENT:   { type: Boolean, required: true },
  REGDATE:   { type: Date, required: true },
  REGTIME:   { type: Date, required: true },
  REGUSER:   { type: String, required: true }
}, { _id: false });

const detailRowSchema = new mongoose.Schema({
  ACTIVED:         { type: Boolean, required: true },
  DELETED:         { type: Boolean, required: true },
  DETAIL_ROW_REG:  { type: [detailRowRegSchema], required: true }
}, { _id: false });

const signalSchema = new mongoose.Schema({
  date:       { type: Date, required: true },
  type:       { type: String, enum: ['buy', 'sell'], required: true },
  price:      { type: Number, required: true },
  reasoning:  { type: String, required: false }
}, { _id: false });

const simulationSchema = new mongoose.Schema({
  idSimulation:       { type: String, required: true, unique: true },
  idUser:             { type: String, required: true },
  idStrategy:         { type: String, required: true },
  simulationName:     { type: String, required: true },
  symbol:             { type: String, required: true },
  startDate:          { type: Date, required: true },
  endDate:            { type: Date, required: true },
  amount:             { type: Number, required: true }, // Cambiado a Number
  signals:            { type: [signalSchema], required: true },
  specs:              { type: String, required: false },
  result:             { 
    type: {
      netCredit: { type: Number, required: true },
      maxLoss: { type: Number, required: true },
      maxProfit: { type: Number, required: true },
      riskRewardRatio: { type: Number, required: true },
      percentageReturn: { type: Number, required: true }
    },
    required: false 
  },
  percentageReturn:   { type: Number, required: false },
  DETAIL_ROW:         { type: [detailRowSchema], required: true }
});

module.exports = mongoose.model('SIMULATION', simulationSchema, 'SIMULATION');
