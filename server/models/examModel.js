const mongoose = require("mongoose");

const examSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    schoolType: {
      type: String,
      enum: ["primary", "secondary"],
      default: "primary", 
      required: false,
    },
    class: {
      type: String,
      required: true,
      default: "default"
    },
    totalMarks: {
      type: Number,
      required: true,
    },
    passingMarks: {
      type: Number,
      required: true,
    },
    questions: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "questions",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Exam = mongoose.model("exams", examSchema);
module.exports = Exam;