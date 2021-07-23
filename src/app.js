require("dotenv").config();
const express = require("express");
const logger = require("morgan");

const app = express();

require("./config/db");
const routes = require("./routes");
const passport = require("./config/passport");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(logger("dev"));

app.use(passport.initialize());

app.use("/", routes);

// Handle errors.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.code || 500).json({
    message: err.message,
  });
});

app.listen(process.env.PORT, () => {
  console.log("Server started. 🚀");
});
