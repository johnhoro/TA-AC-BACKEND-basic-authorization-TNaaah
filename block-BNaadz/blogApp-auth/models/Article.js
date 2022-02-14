var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var articleSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    slug: String,
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
  }
);

articleSchema.pre("save", function (next) {
  let random = Math.floor(Math.random() * 10);
  let str = this.title.split(" ").join("-").trim().concat(random);
  this.slug = str;
  next();
});

var Article = mongoose.model(`Article`, articleSchema);

module.exports = Article;
