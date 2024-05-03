const asyncWrapper = require("../middlewares/asyncWrapper");
const User = require("../models/user.model");
const appError = require("../utils/appError");
const httpStatusText = require("../utils/httpStatusText");
const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
const generateJWT = require("../utils/generateJWT");
const { validationResult } = require("express-validator");

const getAllUsers = asyncWrapper(async (req, res) => {
  const query = req.query;

  const limit = query.limit || 10;
  const page = query.page || 1;
  const skip = (page - 1) * limit;

  const users = await User.find({}, { __v: false, password: false })
    .limit(limit)
    .skip(skip);

  res.json({ status: httpStatusText.SUCCESS, data: { users } });
});

const getUser = asyncWrapper(async (req, res, next) => {
  const user = await User.findById(req.params.userId);

  if (!user) {
    const error = appError.create("not found user", 404, httpStatusText.FAIL);
    return next(error);
  }
  return res.json({ status: httpStatusText.SUCCESS, data: { user } });
});

const addUser = asyncWrapper(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = appError.create(errors.array(), 400, httpStatusText.ERROR);
    return next(error);
  }

  const newUser = new User(req.body);
  await newUser.save();

  res
    .status(201)
    .json({ status: httpStatusText.SUCCESS, data: { user: newUser } });
});

const updateUser = asyncWrapper(async (req, res, next) => {
  const userId = req.params.userId;
  
  // Use findOneAndUpdate to update and return the updated document
  const updatedUser = await User.findOneAndUpdate(
    { _id: userId },
    { $set: { ...req.body } },
    { new: true } // Return the modified document rather than the original
  );

  if (!updatedUser) {
    // If user is not found, create an error
    const error = appError.create(
      'User not found',
      404,
      httpStatusText.NOT_FOUND
    );
    return next(error);
  }

  // Send the updated user data in the response
  res.json({ status: httpStatusText.SUCCESS, data: { user: updatedUser } });
});


const deleteUser = asyncWrapper(async (req, res) => {
  const data = await User.deleteOne({ _id: req.params.userId });

  res.status(200).json({ status: httpStatusText.SUCCESS, data: null });
});

const register = asyncWrapper(async (req, res, next) => {
  const { firstName, lastName, email, password, role } = req.body;
  const avatar = req.file && req.file.filename ? req.file.filename : "profile.jpg";

  const oldUser = await User.findOne({ email: email });

  if (oldUser) {
    const error = appError.create(
      "user already exists",
      400,
      httpStatusText.FAIL
    );
    return next(error);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    role,
    avatar,
    
  });

  // generate JWT token
  const token = await generateJWT({
    email: newUser.email,
    id: newUser._id,
    role: newUser.role,
  });
  newUser.token = token;

  await newUser.save();

  res
    .status(201)
    .json({ status: httpStatusText.SUCCESS, data: { user: newUser } });
});

const login = asyncWrapper(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email && !password) {
    const error = appError.create(
      "email and password are required",
      400,
      httpStatusText.FAIL
    );
    return next(error);
  }

  const user = await User.findOne({ email: email });

  if (!user) {
    const error = appError.create("user not found", 400, httpStatusText.FAIL);
    return next(error);
  }

  const matchedPassword = await bcrypt.compare(password, user.password);

  if (user && matchedPassword) {
    const token = await generateJWT({
      email: user.email,
      id: user._id,
      role: user.role,
    });

    return res
      .status(200)
      .json({ status: httpStatusText.SUCCESS, data: { token } });
  } else {
    const error = appError.create("something wrong", 500, httpStatusText.ERROR);
    return next(error);
  }
});

module.exports = {
  getAllUsers,
  getUser,
  addUser,
  updateUser,
  deleteUser,
  register,
  login,
};
