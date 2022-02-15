var express = require("express");
var Article = require("../models/Article");
var Comment = require("../models/Comment");
var User = require("../models/User");
var auth = require("../middleware/auth");

var router = express.Router();

// Routes Without Authorisation
router.get("/", (req, res, next) => {
  Article.find({}, (err, articles) => {
    if (err) return next(err);
    res.render("articles", { articles });
  });
});

router.get("/my-articles", auth.loggdInUser, (req, res, next) => {
  let currentUserId = req.user.id;
  Article.find({ author: currentUserId }, (err, articles) => {
    if (err) return next(err);
    res.render("articles", { articles });
  });
});

router.get("/new", auth.loggdInUser, (req, res) => {
  res.render("addArticle");
});

router.get("/:slug", (req, res, next) => {
  let givenSlug = req.params.slug;
  var error = req.flash("error")[0];
  Article.findOne({ slug: givenSlug })
    .populate("comments")
    .populate("author", "firstname lastname fullName email")
    .exec((err, article) => {
      console.log(article);
      if (err) return next(err);
      Comment.find({ articleId: article.id })
        .populate("author", "firstname lastname fullName")
        .exec((err, comments) => {
          if (err) return next(err);
          res.render("articleDetails", { article, comments, error });
        });
    });
});

router.use(auth.loggdInUser);

router.post("/", (req, res, next) => {
  req.body.author = req.user.id;
  req.body.tags = req.body.tags.trim().split(",");
  Article.create(req.body, (err, createdArticle) => {
    if (err) return next(err);
    res.redirect("/articles");
  });
});

// Increment Likes
router.get("/:slug/likes", (req, res, next) => {
  let givenSlug = req.params.slug;

  Article.findOneAndUpdate(
    { slug: givenSlug },
    { $inc: { likes: 1 } },
    (err, article) => {
      if (err) return next(err);
      res.redirect("/articles/" + givenSlug);
    }
  );
});

// Update Article
router.get("/:slug/edit", (req, res, next) => {
  let givenSlug = req.params.slug;
  let currentUserId = req.user.id;
  Article.findOne({ slug: givenSlug }, (err, article) => {
    if (err) return next(err);
    if (currentUserId !== article.author.toString()) {
      req.flash("error", "You Are Not Authorised to Edit this Article!");
      res.redirect("/articles/" + givenSlug);
    } else {
      Article.findOne({ slug: givenSlug }, (err, article) => {
        console.log(article);
        if (err) return next(err);
        res.render("editArticle", { article });
      });
    }
  });
});

router.post("/:slug", (req, res, next) => {
  let givenSlug = req.params.slug;
  req.body.tags = req.body.tags.trim().split(",");
  let userId = req.user.id;
  Article.findOneAndUpdate(
    { slug: givenSlug },
    req.body,
    (err, updatedArticle) => {
      if (err) return next(err);
      res.redirect("/articles");
    }
  );
});
// Delete Article
router.get("/:slug/delete", (req, res, next) => {
  let givenSlug = req.params.slug;
  currentUserId = req.user.id;
  Article.findOne({ slug: givenSlug }, (err, article) => {
    if (err) return next(err);
    if (currentUserId !== article.author.toString()) {
      req.flash("error", "You Are Not Authorised to Delete this Article!");
      res.redirect("/articles/" + givenSlug);
    } else {
      Article.findOneAndDelete({ slug: givenSlug }, (err, deletedArticle) => {
        if (err) return next(err);
        Comment.deleteMany({ articleId: deletedArticle._id }, (err, info) => {
          if (err) return next(err);
          res.redirect("/articles");
        });
      });
    }
  });
});
// Add comment
router.post("/:id/comments", (req, res, next) => {
  let id = req.params.id;
  req.body.articleId = id;
  req.body.author = req.user._id;
  Comment.create(req.body, (err, comment) => {
    console.log(comment);
    if (err) return next(err);
    Article.findByIdAndUpdate(
      id,
      { $push: { comments: comment._id } },
      (err, updatedArticle) => {
        if (err) return next(err);
        let givenSlug = updatedArticle.slug;
        res.redirect("/articles/" + givenSlug);
      }
    );
  });
});

module.exports = router;
