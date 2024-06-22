const express = require("express");
const router = express.Router();
const caseController = require("../controllers/cases.controller");
const verifyToken = require("../middlewares/verifyToken");
const allowedTo = require("../middlewares/allowedTo");
const userRoles = require("../utils/userRoles.js");
const requireAuth = require("../middlewares/requireAuth");
const reportsRoute = require("./reports.route.js");
const visitingRoute = require("./visiting.route.js")

router.use(requireAuth);

router.use("/:caseId/reports", reportsRoute);
router.use("/:caseId/visiting", visitingRoute);

router
  .route("/")
  .get(verifyToken, allowedTo(userRoles.ADMIN), caseController.getAllCases)
  .post(verifyToken, allowedTo(userRoles.ADMIN), caseController.addCase);

router
  .route("/:caseId")
  .get(verifyToken, caseController.getCase)
  .patch(verifyToken, allowedTo(userRoles.ADMIN), caseController.updateCase)
  .delete(verifyToken, allowedTo(userRoles.ADMIN), caseController.deleteCase);


module.exports = router;
