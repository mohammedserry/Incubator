const Visiting = require("../models/visiting.model.js");
const Case = require("../models/cases.model.js");
const httpStatusText = require("../utils/httpStatusText.js");
const appError = require("../utils/appError.js");
const asyncWrapper = require("../middlewares/asyncWrapper.js");


const getAllVisiting = asyncWrapper(async (req, res) => {
  const userId = req.userId;
  const latestCase = await Case.findOne().sort({ _id: -1 });
  const query = req.query;

  const limit = query.limit || 10;
  const page = query.page || 1;
  const skip = (page - 1) * limit;

  const visiting = await Visiting.find({ userId, caseId: latestCase._id}, { __v: false, password: false })
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

const addVisiting = asyncWrapper(async (req, res, next) => {
  const userId = req.userId; 
  const {visiting, comments, caseId} = req.body;

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
};