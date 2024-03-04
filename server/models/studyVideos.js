const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  className: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  videoID: {
    type: String,
    required: true,
  },
});

const Videos = mongoose.model("videos", videoSchema);
module.exports = Videos;