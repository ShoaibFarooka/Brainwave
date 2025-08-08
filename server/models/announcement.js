const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  heading: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);
