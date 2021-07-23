require("dotenv").config();
const router = require("express").Router();
const jwt = require("jsonwebtoken");

const TOKEN_SECRET = process.env.TOKEN_SECRET;
const passport = require("../config/passport");

router.get("/", (req, res, next) => {
  res.send(`<h1>HOLA MUNDO</h1> <p>esto sera una bonita api rest</p>`);
});

router.post("/register", (req, res, next) => {
  passport.authenticate("register", (err, user) => {
    if (err) {
      return res.status(402).json({ data: err.message, success: false });
    }
    req.login(user, { session: false }, async (error) => {
      if (error) return next(error);

      const body = { _id: user._id, email: user.email };
      const token = jwt.sign({ user: body }, TOKEN_SECRET, {
        expiresIn: "1d",
      });

      return res.status(201).json({
        success: true,
        message: "user registration succesful",
        token,
      });
    });
  })(req, res, next);
});

router.post("/login", (req, res, next) => {
  passport.authenticate("login", (error, user) => {
    if (error) {
      return res.status(402).json({ data: error.message, success: false });
    }

    req.login(user, { session: false }, async (error) => {
      if (error) return next(error);
      const body = { _id: user._id, email: user.email };
      const token = jwt.sign({ user: body }, process.env.TOKEN_SECRET, {
        expiresIn: "1800s",
      });
      return res.status(200).json({
        success: true,
        user: req.user,
        message: "user logged in successfully",
        token,
      });
    });
  })(req, res, next);
});

router.get("/logout", (req, res) => {
  req.logout();
  res.status(200).send("User successfully logget out.");
});

module.exports = router;
