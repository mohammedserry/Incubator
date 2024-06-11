const Report = require('../models/reports.model.js');
const Case = require("../models/cases.model.js")
const httpStatusText = require("../utils/httpStatusText.js");
const appError = require("../utils/appError.js");
// const generateJWT = require("../utils/generateJWT.js");
const asyncWrapper = require("../middlewares/asyncWrapper.js");



const getAllReports = asyncWrapper(async (req, res) => {
  const userId = req.userId;
  const latestCase = await Case.findOne().sort({ _id: -1 });
  const query = req.query;

  const limit = query.limit || 10;
  const page = query.page || 1;
  const skip = (page - 1) * limit;

  const reports = await Report.find({ userId, caseId: latestCase._id}, { __v: false, password: false })
    .limit(limit)
    .skip(skip);

  res.json({ status: httpStatusText.SUCCESS, data: { reports } });
});

const getReport = asyncWrapper(async (req, res, next) => {
  const reportId = req.params.reportId;
  if(!reportId.match(/^[0-9a-fA-F]{24}$/)){
    const error = appError.create("Invalid ID", 404, httpStatusText.FAIL);
    return next(error);
  }
  const foundReport = await Report.findById(reportId);
  if(!foundReport){
    const error = appError.create("not found report", 404, httpStatusText.FAIL);
    return next(error);
  }
  return res.json({ status: httpStatusText.SUCCESS, data: { foundReport } });
});

const addReport = asyncWrapper(async (req, res, next) => {
  const userId = req.userId; 
  const report = req.file.filename;
  const createdAt = new Date();

  // Fetch the most recent case from the database
  // const latestCase = await Case.findOne().sort({ _id: -1 });

  // Check if a case exists
  // if (!latestCase) {
  //   return res.status(400).json({ message: 'No case found' });
  // }

  const newReport = await Report.create({
    userId,
    caseId : req.body.caseId,
    report,
    createdAt
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
  );

  if (!updatedReport) {
    // If user is not found, create an error
    const error = appError.create(
      'Report not found',
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
  if(!deletedReport){
    const error = appError.create("not found report", 404, httpStatusText.FAIL);
    return next(error);
  }
  // fs.unlinkSync(report.reportPath);
  return res.json({ status: httpStatusText.SUCCESS, data: { }, message: "Report deleted successfully" });
  
});

module.exports = {
  getAllReports,
  getReport,
  addReport,
  updateReport,
  deleteReport,
};
