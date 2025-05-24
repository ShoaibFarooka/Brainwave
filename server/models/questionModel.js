const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    answerType: {
      type: String,
      enum: ["Options", "Free Text"], 
      required: true,
    },
    correctOption: {
      type: String,
      required: true,
    },
    options: {
      type: Object,
      required: function () {
        return this.answerType === "Options";
      },
    },
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "exams",
    },
    image: { 
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Question = mongoose.model("questions", questionSchema);
module.exports = Question;
