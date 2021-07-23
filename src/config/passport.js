require("dotenv").config();
const bcrypt = require("bcrypt");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const JWTstrategy = require("passport-jwt").Strategy;
const ExtractJWT = require("passport-jwt").ExtractJwt;

const User = require("../models/User");

passport.use(
  "register",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      await User.findOne({ email })
        .then((user) => {
          if (!user) {
            const hash = bcrypt.hashSync(password, 10);
            const newUser = new User({
              role: req.body.role,
              name: req.body.name,
              email,
              password: hash,
            });
            newUser
              .save()
              .then(() => done(null, newUser))
              .catch((err) => done(err, null));
          } else {
            throw new Error("User already exists");
          }
        })
        .catch((err) => done(err, null));
    }
  )
);

passport.use(
  "login",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true, // Receive req in case more fields are needed when registering user
    },
    (req, email, password, done) => {
      User.findOne({ email })
        .then((user) => {
          if (!user) {
            throw new Error("User does not exist");
          }

          const userPassword = user.get("password");
          const isValidPassword = bcrypt.compareSync(password, userPassword);

          if (!isValidPassword) {
            throw new Error("Incorrect email and password");
          }

          done(null, user);
        })
        .catch((err) => done(err, null));
    }
  )
);

passport.use(
  new JWTstrategy(
    {
      secretOrKey: process.env.TOKEN_SECRET,
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    },
    async (token, done) => {
      try {
        return done(null, token.user);
      } catch (error) {
        done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

module.exports = passport;
