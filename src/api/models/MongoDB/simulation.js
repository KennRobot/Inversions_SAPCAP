const mongoose = require('mongoose');

const indicatorSchema = new mongoose.Schema({
  key:   { type: String, required: true },
  value: { type: Number, required: true }
}, { _id: false });

const chartDataSchema = new mongoose.Schema({
  date:   { type: Date, required: true },
  open:   { type: Number, required: true },
  high:   { type: Number, required: true },
  low:    { type: Number, required: true },
  close:  { type: Number, required: true },
  volume: { type: Number, required: true },
  indicators: { type: [indicatorSchema], required: false }
}, { _id: false });

const summarySchema = new mongoose.Schema({
  totalBoughtUnits:   { type: Number, required: true },
  totalSoldUnits:     { type: Number, required: true },
  remainingUnits:     { type: Number, required: true },
  finalCash:          { type: Number, required: true },
  finalValue:         { type: Number, required: true },
  finalBalance:       { type: Number, required: true },
  realProfit:         { type: Number, required: true },
  percentageReturn:   { type: Number, required: true }
}, { _id: false });

const detailRowRegSchema = new mongoose.Schema({
  CURRENT:  { type: Boolean, required: true },
  REGDATE:  { type: Date, required: true },
  REGTIME:  { type: String, required: true }, // era Date, pero es una cadena "15:28:35"
  REGUSER:  { type: String, required: true }
}, { _id: false });

const detailRowSchema = new mongoose.Schema({
  ACTIVED:        { type: Boolean, required: true },
  DELETED:        { type: Boolean, required: true },
  DETAIL_ROW_REG: { type: [detailRowRegSchema], required: true }
}, { _id: false });

const signalSchema = new mongoose.Schema({
  date:      { type: Date, required: true },
  type:      { type: String, enum: ['buy', 'sell'], required: true },
  price:     { type: Number, required: true },
  reasoning: { type: String, required: false },
  shares:    { type: Number, required: true }
}, { _id: false });

const simulationSchema = new mongoose.Schema({
  idSimulation:      { type: String, required: true, unique: true },
  idUser:            { type: String, required: true },
  idStrategy:        { type: String, required: true },
  simulationName:    { type: String, required: true },
  symbol:            { type: String, required: true },
  specs:             { type: String, required: false },
  amount:            { type: Number, required: true },
  startDate:         { type: Date, required: true },
  endDate:           { type: Date, required: true },
  signals:           { type: [signalSchema], required: true },
  summary:           { type: summarySchema, required: true },
  chart_data:        { type: [chartDataSchema], required: false },
  DETAIL_ROW:        { type: [detailRowSchema], required: true }
});

module.exports = mongoose.model('SIMULATION', simulationSchema, 'SIMULATION');
