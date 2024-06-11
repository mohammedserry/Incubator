const Visiting = require("../models/visiting.model.js");
const Case = require("../models/cases.model.js");
const httpStatusText = require("../utils/httpStatusText.js");
const appError = require("../utils/appError.js");
const asyncWrapper = require("../middlewares/asyncWrapper.js");


const getAllVisiting = asyncWrapper(async (req, res) => {
  const query = req.query;

  const limit = query.limit || 10;
  const page = query.page || 1;
  const skip = (page - 1) * limit;

  let filterObject = {};
  if(req.params.caseId){
    filterObject = { caseId : req.params.caseId}
  }

  const visiting = await Visiting.find(filterObject, { __v: false, password: false })
    .limit(limit)
    .skip(skip);

  res.json({ status: httpStatusText.SUCCESS, data: { visiting } });
});

const getVisiting = asyncWrapper(async (req, res, next) => {
  const visitingId = req.params.visitingId;
  if(!visitingId.match(/^[0-9a-fA-F]{24}$/)){
    const error = appError.create("Invalid ID", 404, httpStatusText.FAIL);
    return next(error);
  }
  const foundVisiting = await Visiting.findById(visitingId);
  if(!foundVisiting){
    const error = appError.create("not found visiting", 404, httpStatusText.FAIL);
    return next(error);
  }
  return res.json({ status: httpStatusText.SUCCESS, data: { foundVisiting } });
});

const setCaseIdToBody = (req,res,next) => {
  if(!req.body.caseId){
    req.body.caseId = req.params.caseId;
  }
  next();
}

const addVisiting = asyncWrapper(async (req, res, next) => {
  const userId = req.userId; 
  const {visiting, comments} = req.body;
  const caseId = req.body.caseId || req.params.caseId;

  // Check if a case exists
  if (!caseId) {
    return res.status(400).json({ message: 'No case found' });
  }

  const newVisiting = await Visiting.create({
    userId,
    caseId,
    visiting,
    comments
  });
  await newVisiting.save();
  res
    .status(201)
    .json({ status: httpStatusText.SUCCESS, data: { newVisiting } });
});

const updateVisiting = asyncWrapper(async (req, res, next) => {
  const visitingId = req.params.visitingId;
  const visiting = req.body;
  const updatedVisiting = await Visiting.findByIdAndUpdate(visitingId, visiting, { new: true });
  if (!updatedVisiting) {
    const error = appError.create("not found visiting", 404, httpStatusText.FAIL);
    return next(error);
  }
  res.json({ status: httpStatusText.SUCCESS, data: { updatedVisiting } });
});

const deleteVisiting = asyncWrapper(async (req, res, next) => {
  const visitingId = req.params.visitingId;
  const deletedVisiting = await Visiting.findByIdAndDelete(visitingId);
  if (!deletedVisiting) {
    const error = appError.create("not found visiting", 404, httpStatusText.FAIL);
    return next(error);
  }
  res.json({ status: httpStatusText.SUCCESS, data: { deletedVisiting } });
});


module.exports = {
  getAllVisiting,
  getVisiting,
  addVisiting,
  updateVisiting,
  deleteVisiting,
  setCaseIdToBody,
};