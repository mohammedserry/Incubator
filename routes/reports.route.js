const express = require("express");
const router = express.Router({ mergeParams : true });
const reportController = require("../controllers/reports.controller.js");
const verifyToken = require("../middlewares/verifyToken");
const multer = require("multer");
const allowedTo = require("../middlewares/allowedTo");
const userRoles = require("../utils/userRoles");
const requireAuth = require("../middlewares/requireAuth");
const appError = require("../utils/appError");

router.use(requireAuth);

const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "Reports");
  },
  filename: function (req, file, cb) {
    const ext = "pdf"; // Ensure the file extension is always pdf
    const fileName = `report-${Date.now()}.${ext}`;
    cb(null, fileName);
  },
});

const fileFilter = (req, file, cb) => { 
  const fileType = file.mimetype.split("/")[1]; // Check the file extension

  if (fileType === "pdf") {
    return cb(null, true); // Allow only pdf files
  } else {
    return cb(appError.create("The file must be a PDF", 400), false);
  }
};

const uploads = multer({ 
  storage: diskStorage, 
  fileFilter: fileFilter 
});


router
  .route("/")
  .get(verifyToken, allowedTo(userRoles.ADMIN), reportController.getAllReports)
  .post(reportController.setCaseIdToBody, uploads.single("report"), verifyToken, allowedTo(userRoles.ADMIN), reportController.addReport)


router
  .route("/:reportId")
  .get(verifyToken, reportController.getReport)
  .patch(verifyToken, allowedTo(userRoles.ADMIN), reportController.updateReport)
  .delete(verifyToken, allowedTo(userRoles.ADMIN), reportController.deleteReport);



module.exports = router;