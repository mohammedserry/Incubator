const Report = require("../models/reports.model.js");
const Case = require("../models/cases.model.js");
const httpStatusText = require("../utils/httpStatusText.js");
const appError = require("../utils/appError.js");
// const generateJWT = require("../utils/generateJWT.js");
const asyncWrapper = require("../middlewares/asyncWrapper.js");

const getAllReports = asyncWrapper(async (req, res) => {
  const query = req.query;

  const limit = query.limit || 10;
  const page = query.page || 1;
  const skip = (page - 1) * limit;

  let filterObject = {};
  if (req.params.caseId) {
    filterObject = { caseId: req.params.caseId };
  }

  const reports = await Report.find(filterObject, {
    __v: false,
    password: false,
  })
    .limit(limit)
    .skip(skip)
    .populate({
      path: "caseId",
      select: "fullName -_id",
    });

  res.json({ status: httpStatusText.SUCCESS, data: { reports } });
});

const getReport = asyncWrapper(async (req, res, next) => {
  const reportId = req.params.reportId;
  if (!reportId.match(/^[0-9a-fA-F]{24}$/)) {
    const error = appError.create("Invalid ID", 404, httpStatusText.FAIL);
    return next(error);
  }
  const foundReport = await Report.findById(reportId).populate({
    path: "caseId",
    select: "fullName -_id",
  });
  if (!foundReport) {
    const error = appError.create("not found report", 404, httpStatusText.FAIL);
    return next(error);
  }
  return res.json({ status: httpStatusText.SUCCESS, data: { foundReport } });
});

const setCaseIdToBody = (req, res, next) => {
  if (!req.body.caseId) {
    req.body.caseId = req.params.caseId;
  }
  next();
};

const addReport = asyncWrapper(async (req, res, next) => {
  const userId = req.userId;
  const caseId = req.body.caseId || req.params.caseId;
  const report = req.file.filename;
  const createdAt = new Date();

  // Check if a case exists
  if (!caseId) {
    return res.status(400).json({ message: "No case found" });
  }

  const newReport = await Report.create({
    userId,
    caseId,
    report,
    createdAt,
  });
  await newReport.save();
  res
    .status(201)
    .json({ status: httpStatusText.SUCCESS, data: { report: newReport } });
});

const updateReport = asyncWrapper(async (req, res, next) => {
  const reportId = req.params.reportId;

  // Use findOneAndUpdate to update and return the updated document
  const updatedReport = await Report.findOneAndUpdate(
    { _id: reportId },
    { $set: { ...req.body } },
    { new: true } // Return the modified document rather than the original
  ).populate({
    path: "caseId",
    select: "fullName -_id",
  });

  if (!updatedReport) {
    // If user is not found, create an error
    const error = appError.create(
      "Report not found",
      404,
      httpStatusText.NOT_FOUND
    );
    return next(error);
  }
  return res.json({ status: httpStatusText.SUCCESS, data: { updatedReport } });
});

const deleteReport = asyncWrapper(async (req, res, next) => {
  const reportId = req.params.reportId;
  const deletedReport = await Report.findByIdAndDelete(reportId);
  if (!deletedReport) {
    const error = appError.create("not found report", 404, httpStatusText.FAIL);
    return next(error);
  }
  // fs.unlinkSync(report.reportPath);
  return res.json({
    status: httpStatusText.SUCCESS,
    data: {},
    message: "Report deleted successfully",
  });
});

module.exports = {
  getAllReports,
  getReport,
  addReport,
  updateReport,
  deleteReport,
  setCaseIdToBody,
};
