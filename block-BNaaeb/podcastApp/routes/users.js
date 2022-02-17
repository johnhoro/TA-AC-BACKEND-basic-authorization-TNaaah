var express = require("express");
var User = require("../models/User");
var auth = require("../middlewares/auth");

var router = express.Router();

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

//register user

router.get("/register", function (req, res, next) {
  var exist = req.flash(`exist`);
  var min = req.flash(`min`);
  res.render("userRegistrationForm", { exist, min });
});

router.post("/register", (req, res, next) => {
  User.findOne({ email: req.body.email }, (err, user) => {
    if (err) return next(err);
    if (user) {
      req.flash(`exist`, `Email is already registered`);
      return res.redirect(`/users/register`);
    }
    if (req.body.password.length < 5) {
      req.flash(`min`, `Password is less than 5 character`);
      return res.redirect(`/users/register`);
    }
    User.create(req.body, (err, user) => {
      if (err) return next(err);
      res.redirect(`/users/login`);
    });
  });
});

//user login

router.get("/login", (req, res, next) => {
  var ep = req.flash(`ep`);
  var email = req.flash(`email`);
  var password = req.flash(`password`);
  res.render("userLoginForm", { ep, email, password });
});

router.post("/login", (req, res, next) => {
  var { email, password } = req.body;
  if (!email || !password) {
    req.flash("ep", "Email/Password required!");
    return res.redirect("/users/login");
  }
  User.findOne({ email }, (err, user) => {
    if (err) return next(err);
    if (!user) {
      req.flash("email", "This email is not registered");
      return res.redirect("/users/login");
    }
    user.verifyPassword(password, (err, result) => {
      if (err) return next(err);
      if (!result) {
        req.flash("password", "Incorrect password! Try Again!");
        return res.redirect("/users/login");
      }
      //password match
      req.session.userId = user.id;
      req.session.userType = user.userType;
      return res.redirect("/home");
    });
  });
});

router.get("/logout", auth.isLoggedIn, (req, res, next) => {
  if (!req.session) {
    req.flash("error", "You must login first");
    res.redirect("/users/login");
  } else {
    req.session.destroy();
    res.clearCookie("connect.sid");
    res.redirect("/users/login");
  }
});

module.exports = router;
