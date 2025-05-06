const mongoose = require('mongoose');

const usersSchema = new mongoose.Schema({
    ID: { type: Number, required: true },
    USERNAME:   { type: String, required: true },
    EMAIL:   { type: String, required: true },
    PASSWORD_HASH:    { type: Number, required: true },
    CREATE_AT:   { type: Date, required: true }
});

module.exports = mongoose.model(
    'USERS', 
    usersSchema,
    'USERS'
);