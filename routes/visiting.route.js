const express = require("express");
const router = express.Router();
const visitingController = require("../controllers/visiting.controller.js");
const verifyToken = require("../middlewares/verifyToken.js");
const allowedTo = require("../middlewares/allowedTo.js");
const userRoles = require("../utils/userRoles.js");
const requireAuth = require("../middlewares/requireAuth.js");

router.use(requireAuth);

router
  .route("/")
  .get(verifyToken, allowedTo(userRoles.ADMIN), visitingController.getAllVisiting)
  .post(verifyToken, allowedTo(userRoles.ADMIN), visitingController.addVisiting);


router
  .route("/:visitingId")
  .get(verifyToken, visitingController.getVisiting)
  .patch(verifyToken, allowedTo(userRoles.ADMIN), visitingController.updateVisiting)
  .delete(verifyToken, allowedTo(userRoles.ADMIN), visitingController.deleteVisiting);  


module.exports = router;