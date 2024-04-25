const asyncWrapper = require("../middlewares/asyncWrapper");
const Case = require("../models/cases.model");
// const appError = require("../utils/appError.js");
const httpStatusText = require("../utils/httpStatusText");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const generateJWT = require("../utils/generateJWT.js");
// const { validationResult } = require("express-validator");


const getAllCases = asyncWrapper(async (req, res) => {
  const query = req.query;

  const limit = query.limit || 10;
  const page = query.page || 1;
  const skip = (page - 1) * limit;

  const cases = await Case.find({}, { __v: false })
    .limit(limit)
    .skip(skip);

  res.json({ status: httpStatusText.SUCCESS, data: { cases } });
});

const getCase = asyncWrapper(async (req, res, next) => {
  const caseId = req.params.caseId;
  if(!caseId.match(/^[0-9a-fA-F]{24}$/)){
    res
      .status(400)
      .json({ status: httpStatusText.ERROR, message: "Invalid case id" });
  };
  const foundCase = await Case.findById(caseId);
  if(!foundCase){
    res
      .status(404)
      .json({ status: httpStatusText.ERROR, message: "Case not found" });
  }
  res
    .status(200)
    .json({ status: httpStatusText.SUCCESS, data: { case: foundCase } });
});

const addCase = asyncWrapper(async (req, res) => {
  const userId = req.userId;
  const newCase = new Case({ ...req.body, userId});
  await newCase.save();
  res
    .status(201)
    .json({ status: httpStatusText.SUCCESS, data: { case: newCase } });
});

const updateCase = asyncWrapper(async (req, res, next) => {
  const caseId = req.params.caseId;
  if(!caseId.match(/^[0-9a-fA-F]{24}$/)){
    res
      .status(400)
      .json({ status: httpStatusText.ERROR, message: "Invalid case id" });
  };
  const updatedCase = await Case.findOneAndUpdate(
    { _id: caseId },
    { $set: { ...req.body } },
    { new: true }
  );
  if(!updatedCase){
    res
      .status(404)
      .json({ status: httpStatusText.ERROR, message: "Case not found" });
  }
  res
    .status(200)
    .json({ status: httpStatusText.SUCCESS, data: { case: updatedCase } });
});

const deleteCase = asyncWrapper(async (req, res, next) => {
  const caseId = req.params.caseId;
  if(!caseId.match(/^[0-9a-fA-F]{24}$/)){
    res
      .status(400)
      .json({ status: httpStatusText.ERROR, message: "Invalid case id" });
  };
  const deletedCase = await Case.findByIdAndDelete(caseId);
  if(!deletedCase){
    res
      .status(404)
      .json({ status: httpStatusText.ERROR, message: "Case not found" });
  }
  res
    .status(200)
    .json({ status: httpStatusText.SUCCESS, message: "Case deleted" });
});

module.exports = {
  getAllCases,
  getCase,
  addCase,
  updateCase,
  deleteCase,
};