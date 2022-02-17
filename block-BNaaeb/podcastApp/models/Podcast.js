var mongoose = require(`mongoose`);
var bcrypt = require(`bcrypt`);

var Schema = mongoose.Schema;

var podcastSchema = new Schema(
  {
    name: { type: String, required: true },
    image: { type: String, required: true },
    video: { type: String, required: true },
    forUserType: { type: String, required: true },
    likes: { type: Number, default: 0 },
    createdBy: { type: mongoose.Types.ObjectId, ref: `User` },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

var Podcast = mongoose.model(`Podcast`, podcastSchema);

module.exports = Podcast;
