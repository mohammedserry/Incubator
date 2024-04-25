const express = require("express");
const router = express.Router();
const userController = require("../controllers/users.controller");
const verifyToken = require("../middlewares/verifyToken");
const multer = require("multer");
const appError = require("../utils/appError");
const allowedTo = require("../middlewares/allowedTo");
const userRoles = require("../utils/userRoles");

const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("FILE", file);
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    const ext = file.mimetype.split("/")[1];
    const fileName = `user-${Date.now()}.${ext}`;
    cb(null, fileName);
  },
});

const fileFilter = (req, file, cb) => {
  const imageType = file.mimetype.split("/")[0];

  if (imageType === "image") {
    return cb(null, true);
  } else {
    return cb(appError.create("the file must be an image", 400), false);
  }
};

const upload = multer({ storage: diskStorage, fileFilter });

// get all users
// register
// login

router
  .route("/")
  .get(verifyToken, allowedTo(userRoles.SUPER_ADMIN), userController.getAllUsers)
  .post(verifyToken, allowedTo(userRoles.SUPER_ADMIN), userController.addUser);

router
  .route("/:userId")
  .get(verifyToken, allowedTo(userRoles.SUPER_ADMIN), userController.getUser)
  .patch(userController.updateUser)
  .delete(verifyToken, allowedTo(userRoles.SUPER_ADMIN), userController.deleteUser);

router
  .route("/register")
  .post(upload.single("avatar"), userController.register);

router.route("/login").post(userController.login);

module.exports = router;
