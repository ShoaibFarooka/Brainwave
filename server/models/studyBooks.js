const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
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
    year: {
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
    thumbnail: {
        type: String,
        required: true,
    },
    schoolType: {
        type: String,
        enum: ["primary", "secondary"],
        default: "primary", 
        required: false,   
      },
});

const Books = mongoose.model("books", bookSchema);
module.exports = Books;