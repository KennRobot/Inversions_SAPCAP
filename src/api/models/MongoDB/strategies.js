const mongoose = require('mongoose');

const strategiesSchema = new mongoose.Schema({
    STRATEGY_ID:         { type: String, required: true },
    USER_ID:             { type: String, required: true },
    TYPE:                { type: String, required: true }, // Ej: 'iron_condor'
    UNDERLYING:          { type: String, required: true }, // Ej: 'SPY'
    OPENED_AT:           { type: Date, required: true },
    CLOSED_AT:           { type: Date, default: null },
    POSITIONS: {
        CALL_CREDIT_SPREAD: {
            SHORT_CALL:  { type: Number, required: true },
            LONG_CALL:   { type: Number, required: true }
        },
        PUT_CREDIT_SPREAD: {
            SHORT_PUT:   { type: Number, required: true },
            LONG_PUT:    { type: Number, required: true }
        }
    },
    PREMIUM_COLLECTED:   { type: Number, required: true, default: 0 },
    RISK_INDICATORS_SNAPSHOT: {
        VIX:            { type: Number, required: true, default: 0 },
        RSI:            { type: Number, required: true, default: 0 },
        PUT_CALL_RATIO: { type: Number, required: true, default: 0 }
    },
    NOTES:               { type: String, default: "" }
});

module.exports = mongoose.model(
    'STRATEGIES',
    strategiesSchema,
    'STRATEGIES'
);
