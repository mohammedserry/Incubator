const express = require("express");
const router = express.Router();
const caseController = require("../controllers/cases.controller");
const verifyToken = require("../middlewares/verifyToken");
// const multer = require("multer");
// const appError = require("../utils/appError.js");
const allowedTo = require("../middlewares/allowedTo");
const userRoles = require("../utils/userRoles.js");
const requireAuth = require("../middlewares/requireAuth");
const reportsRoute = require("./reports.route.js");

router.use(requireAuth);

// const diskStorage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "Reports");
//   },
//   filename: function (req, file, cb) {
//     const ext = "pdf"; // Ensure the file extension is always pdf
//     const fileName = `report-${Date.now()}.${ext}`;
//     cb(null, fileName);
//   },
// });

// const fileFilter = (req, file, cb) => { 
//   const fileType = file.mimetype.split("/")[1]; // Check the file extension

//   if (fileType === "pdf") {
//     return cb(null, true); // Allow only pdf files
//   } else {
//     return cb(appError.create("The file must be a PDF", 400), false);
//   }
// };

// const uploads = multer({ 
//   storage: diskStorage, 
//   fileFilter: fileFilter 
// });

router.use("/:caseId/reports", reportsRoute)

router
  .route("/")
  .get(verifyToken, allowedTo(userRoles.ADMIN), caseController.getAllCases)
  .post(uploads.single("reports"), verifyToken, allowedTo(userRoles.ADMIN), caseController.addCase);

router
  .route("/:caseId")
  .get(verifyToken, caseController.getCase)
  .patch(verifyToken, allowedTo(userRoles.ADMIN), caseController.updateCase)
  .delete(verifyToken, allowedTo(userRoles.ADMIN), caseController.deleteCase);


module.exports = router;
