const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
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
  documentID: {
    type: String,
    required: true,
  },
  documentUrl: {
    type: String,
    required: false,
  },
  schoolType: {
    type: String,
    enum: ["primary", "secondary"],
    default: "primary", 
    required: false,   
  },
});

const Notes = mongoose.model("notes", noteSchema);
module.exports = Notes;