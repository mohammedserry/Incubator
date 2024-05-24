require("dotenv").config();

const httpStatusText = require("./utils/httpStatusText");

const express = require("express");
const cors = require("cors");
const path = require("path");
const morgan = require("morgan");


const app = express();

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/Reports", express.static(path.join(__dirname, "Reports")));

const mongoose = require("mongoose");

const url = process.env.MONGO_URL;

mongoose.connect(url).then(() => {
  console.log("mongodb server started");
});

app.use(express.json());
app.use(cors());
app.use(morgan("dev"))


const usersRouter = require("./routes/user.route.js");
const casesRouter = require("./routes/cases.route.js");
const reportsRouter = require("./routes/reports.route.js");
const visitingRouter = require("./routes/visiting.route.js");

app.use("/api/v1/users", usersRouter);
app.use("/api/v1/cases", casesRouter);
app.use("/api/v1/reports", reportsRouter);
app.use("/api/v1/visiting", visitingRouter);

app.all("*", (req, res, next) => {
  return res.status(404).json({
    status: httpStatusText.ERROR,
    message: "this resource is not available",
  });
});

app.use((error, req, res, next) => {
  res.status(error.statusCode || 500).json({
    status: error.statusText || httpStatusText.ERROR,
    message: error.message,
    code: error.statusCode || 500,
    data: null,
  });
});

app.listen(process.env.PORT || 5000, () => {
  console.log("listening on port : 5000");
});
