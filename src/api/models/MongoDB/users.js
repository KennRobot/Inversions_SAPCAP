const { stat } = require('@sap/cds/lib/utils/cds-utils');
const mongoose = require('mongoose');

const movementSchema = new mongoose.Schema({
  movementId: { type: String, required: true },
  date: { type: Date, required: true },
  type: { 
    type: String, 
    enum: ['deposit', 'withdrawal', 'trade', 'fee'], 
    required: true 
  },
  amount: { type: Number, required: true },
  description: { type: String }
}, { _id: false });

const walletSchema = new mongoose.Schema({
  balance: { type: Number, required: true },
  currency: { type: String, required: true },
  movements: [movementSchema]
}, { _id: false });

const usersSchema = new mongoose.Schema({
  idUser: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  lastName: { type: String, required: true },
  birthDate: { type: String, required: true },
  alias: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  departament: { type: String, required: true },
  street: { type: String, required: true },
  postalCode: { type: Number, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  createdAt: { type: Date, required: true },
  wallet: { type: walletSchema, required: true }
});

module.exports = mongoose.model(
    'USERS', 
    usersSchema,
    'USERS'
);