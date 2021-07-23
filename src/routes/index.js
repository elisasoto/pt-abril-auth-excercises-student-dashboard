require("dotenv").config();
const express = require("express");
const passport = require("passport");

const router = express.Router();

router.use("/auth", require("./auth"));
router.use(
  "/user",
  passport.authenticate("jwt", { session: false }),
  require("./user")
);
router.use(
  "/courses",
  passport.authenticate("jwt", { session: false }),
  require("./courses")
);

module.exports = router;
