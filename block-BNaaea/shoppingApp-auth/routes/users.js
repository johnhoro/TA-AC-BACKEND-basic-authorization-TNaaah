var express = require("express");
var User = require("../models/User");

var router = express.Router();

/* GET users listing. */
router.get("/", (req, res, next) => {
  User.find({}, (err, users) => {
    console.log(users);
    if (err) return next(err);
    res.render("userHomePage", { users });
  });
});

// Handle Registration

router.get("/register", function (req, res, next) {
  var exist = req.flash(`exist`);
  var min = req.flash(`min`);
  res.render("registration", { exist, min });
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
      res.render(`login`);
    });
  });
});

//  Handle Login
router.get("/login", (req, res, next) => {
  var ep = req.flash(`ep`);
  var email = req.flash(`email`);
  var password = req.flash(`password`);
  res.render("login", { ep, email, password });
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
      req.session.userId = user.id;
      req.session.isAdmin = user.isAdmin;
      return res.redirect("/home");
    });
  });
});

// Logout
router.get("/logout", (req, res, next) => {
  console.log(req.session);
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
