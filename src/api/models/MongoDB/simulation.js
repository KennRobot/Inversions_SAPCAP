const mongoose = require('mongoose');

const indicatorSchema = new mongoose.Schema({
  INDICATOR: { type: String, required: true },
  VALUE:     { type: Number, required: false }
}, { _id: false });

const chartDataSchema = new mongoose.Schema({
  DATE:       { type: Date, required: true },
  OPEN:       { type: Number, required: false },
  HIGH:       { type: Number, required: false },
  LOW:        { type: Number, required: false },
  CLOSE:      { type: Number, required: true },
  VOLUME:     { type: Number, required: true },
  INDICATORS: { type: [indicatorSchema], required: false }
}, { _id: false });

const summarySchema = new mongoose.Schema({
  TOTALBOUGHTUNITS:  { type: Number, required: true },
  TOTALSOLDUNITS:    { type: Number, required: true },
  REMAININGUNITS:    { type: Number, required: true },
  FINALCASH:         { type: Number, required: true },
  FINALVALUE:        { type: Number, required: true },
  FINALBALANCE:      { type: Number, required: true },
  REALPROFIT:        { type: Number, required: true },
  PERCENTAGERETURN:  { type: Number, required: true }
}, { _id: false });

const detailRowRegSchema = new mongoose.Schema({
  CURRENT:  { type: Boolean, required: true },
  REGDATE:  { type: Date, required: true },
  REGTIME:  { type: String, required: true },
  REGUSER:  { type: String, required: true }
}, { _id: false });

const detailRowSchema = new mongoose.Schema({
  ACTIVED:         { type: Boolean, required: true },
  DELETED:         { type: Boolean, required: true },
  DETAIL_ROW_REG:  { type: [detailRowRegSchema], required: true }
}, { _id: false });

const signalSchema = new mongoose.Schema({
  DATE:      { type: Date, required: true },
  TYPE:      { type: String, enum: ['buy', 'sell'], required: true },
  PRICE:     { type: Number, required: true },
  REASONING: { type: String, required: false },
  SHARES:    { type: Number, required: true }
}, { _id: false });

const simulationSchema = new mongoose.Schema({
  IDSIMULATION:    { type: String, required: true, unique: true },
  IDUSER:          { type: String, required: true },
  IDSTRATEGY:      { type: String, required: true },
  SIMULATIONNAME:  { type: String, required: true },
  SYMBOL:          { type: String, required: true },
  SPECS:           { type: String, required: false },
  AMOUNT:          { type: Number, required: true },
  STARTDATE:       { type: Date, required: true },
  ENDDATE:         { type: Date, required: true },
  SIGNALS:         { type: [signalSchema], required: true },
  SUMMARY:         { type: summarySchema, required: true },
  CHART_DATA:      { type: [chartDataSchema], required: false },
  DETAIL_ROW:      { type: [detailRowSchema], required: true }
});

module.exports = mongoose.model('SIMULATION', simulationSchema, 'SIMULATION');
