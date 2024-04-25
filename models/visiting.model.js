const mongoose = require('mongoose');
const Joi = require('joi');

const visitingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  caseId :{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Case',
    required: true,
  },
  visiting: {
    type: Joi.date(),
    required: true,
  },
  comments: {
    type: String,
    required: false,
  },
});

module.exports = mongoose.model('Visiting', visitingSchema);