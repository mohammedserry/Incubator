const mongoose = require("mongoose");
// const { report } = require("../routes/user.route");

const caseSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  code: {
    type: Number,
    required: true,
  },
  disease: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

module.exports = mongoose.model("Case", caseSchema);
