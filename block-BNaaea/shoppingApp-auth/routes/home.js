var express = require("express");
var User = require("../models/User");
var Product = require("../models/Product");

var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  console.log(req.session.isAdmin);
  if (req.session.isAdmin === "true" && req.session.userId) {
    User.find({}, (err, users) => {
      console.log(users);
      if (err) return next(err);

      Product.find({}, (err, products) => {
        if (err) return next(err);
        User.findOne({ _id: req.session.userId }, (err, admin) => {
          if (err) return next(err);
          return res.render("adminHomePage", { users, products, admin });
        });
      });
    });
  } else if (req.session.isAdmin === "false" && req.session.userId) {
    let error = req.flash("error")[0];
    User.findOne({ _id: req.session.userId }, (err, user) => {
      if (err) return next(err);
      console.log(user);
      return res.render("userHomePage", { error, user });
    });
  } else {
    req.flash("error", "you must login first");
    return res.redirect("/users/login");
  }
});

module.exports = router;
