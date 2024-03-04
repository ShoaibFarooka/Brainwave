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
    thumbnail: {
        type: String,
        required: true,
    },
});

const Books = mongoose.model("books", bookSchema);
module.exports = Books;