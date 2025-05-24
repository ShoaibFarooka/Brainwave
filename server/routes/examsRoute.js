const router = require("express").Router();
const Exam = require("../models/examModel");
const authMiddleware = require("../middlewares/authMiddleware");
const Question = require("../models/questionModel");
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const User = require("../models/userModel");
const multer = require("multer");
const Report = require("../models/reportModel");
// Configure Multer Memory Storage
const storage = multer.memoryStorage();
const upload = multer({ storage });
const mongoose = require("mongoose");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// add exam

router.post("/add", authMiddleware, async (req, res) => {
  try {
    // check if exam already exists
    const examExists = await Exam.findOne({ name: req.body.name });
    if (examExists) {
      return res
        .status(200)
        .send({ message: "Exam already exists", success: false });
    }
    req.body.questions = [];
    const newExam = new Exam(req.body);
    await newExam.save();
    res.send({
      message: "Exam added successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      data: error,
      success: false,
    });
  }
});

router.post("/get-all-exams", authMiddleware, async (req, res) => {
  try {
    const userId = req.body.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send({
        message: "User not found",
        success: false,
      });
    }

    if (user.isAdmin) {
      const exams = await Exam.find();
      return res.send({
        message: "Exams fetched successfully (Admin)",
        data: exams,
        success: true,
      });
    }

    const userSchoolType = user.schoolType;

    let exams;

    // If schoolType is "secondary," fetch exams with only "secondary" schoolType
    if (userSchoolType === "secondary") {
      exams = await Exam.find({ schoolType: "secondary" });
    } else {
      // Otherwise, fetch exams excluding "secondary"
      exams = await Exam.find({ schoolType: { $ne: "secondary" } });
    }

    res.send({
      message: "Exams fetched successfully",
      data: exams,
      success: true,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      data: error,
      success: false,
    });
  }
});

router.post("/get-exam-by-id", authMiddleware, async (req, res) => {
  try {
    const exam = await Exam.findById(req.body.examId).populate("questions");
    res.send({
      message: "Exam fetched successfully",
      data: exam,
      success: true,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      data: error,
      success: false,
    });
  }
});

// edit exam by id
router.post("/edit-exam-by-id", authMiddleware, async (req, res) => {
  try {
    await Exam.findByIdAndUpdate(req.body.examId, req.body);
    res.send({
      message: "Exam edited successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      data: error,
      success: false,
    });
  }
});

// delete exam by id

router.post("/delete-exam-by-id", authMiddleware, async (req, res) => {
  const session = await mongoose.startSession(); 
  session.startTransaction();

  try {
    const deletedExam = await Exam.findByIdAndDelete(req.body.examId).session(session);

    if (!deletedExam) {
      throw new Error("Exam not found");
    }

    const deleteReportsResult = await Report.deleteMany({ exam: req.body.examId }).session(session);

    await session.commitTransaction();
    session.endSession();

    res.send({
      message: "Exam and related reports deleted successfully",
      success: true,
      deletedReportsCount: deleteReportsResult.deletedCount, 
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    res.status(500).send({
      message: error.message || "Failed to delete exam and reports",
      data: error,
      success: false,
    });
  }
});


// add question to exam

router.post(
  "/add-question-to-exam",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      // Get the uploaded image file
      const questionImage = req.file;

      let imageUrl = null;

      // Define the folder name in S3
      if (questionImage) {
        const folderName = "Questions";

        // Generate a unique filename with the original extension
        const filename = `${folderName}/${uuidv4()}-${
          questionImage.originalname
        }`;

        // S3 upload parameters
        const params = {
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: filename,
          Body: questionImage.buffer,
          ContentType: questionImage.mimetype || "application/octet-stream",
        };

        // Upload image to S3
        const s3Response = await s3.upload(params).promise();

        // Get the S3 image URL
        imageUrl = s3Response.Location;
      }

      // Add question to the Questions collection
      const newQuestion = new Question({
        ...req.body,
        image: imageUrl, // Include the image URL
      });

      const question = await newQuestion.save();

      // Add question to the exam
      const exam = await Exam.findById(req.body.exam);
      if (!exam) {
        return res.status(404).send({
          message: "Exam not found.",
          success: false,
        });
      }
      exam.questions.push(question._id);
      await exam.save();

      // Success response
      res.send({
        message: "Question added successfully",
        success: true,
        data: question,
      });
    } catch (error) {
      // Error response
      res.status(500).send({
        message: error.message,
        data: error,
        success: false,
      });
    }
  }
);

// edit question in exam
router.post(
  "/edit-question-in-exam",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      const { questionId } = req.body;
      const updateData = { ...req.body };

      // Handle image upload if present
      if (req.file) {
        // Define the folder name in S3
        const folderName = "Questions";

        // Generate a unique filename with the original extension
        const filename = `${folderName}/${uuidv4()}-${req.file.originalname}`;

        // S3 upload parameters
        const params = {
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: filename,
          Body: req.file.buffer,
          ContentType: req.file.mimetype || "application/octet-stream",
        };

        // Upload image to S3
        const s3Response = await s3.upload(params).promise();

        // Add the image URL to update data
        updateData.image = s3Response.Location;
      } else {
        // Remove image field if no new image is uploaded
        delete updateData.image;
      }

      // Parse options if it's a string (from FormData)
      if (typeof updateData.options === "string") {
        try {
          updateData.options = JSON.parse(updateData.options);
        } catch (parseError) {
          // If parsing fails, set to null or handle as needed
          updateData.options = null;
        }
      }

      // Remove questionId from update data to prevent mongoose error
      delete updateData.questionId;

      // Update question in Questions collection
      const updatedQuestion = await Question.findByIdAndUpdate(
        questionId,
        updateData,
        { new: true } // Return the updated document
      );

      if (!updatedQuestion) {
        return res.status(404).send({
          message: "Question not found",
          success: false,
        });
      }

      res.send({
        message: "Question edited successfully",
        success: true,
        data: updatedQuestion,
      });
    } catch (error) {
      res.status(500).send({
        message: error.message,
        data: error,
        success: false,
      });
    }
  }
);

// delete question in exam
router.post("/delete-question-in-exam", authMiddleware, async (req, res) => {
  try {
    // delete question in Questions collection
    await Question.findByIdAndDelete(req.body.questionId);

    // delete question in exam
    const exam = await Exam.findById(req.body.examId);
    exam.questions = exam.questions.filter(
      (question) => question._id != req.body.questionId
    );
    await exam.save();
    res.send({
      message: "Question deleted successfully",
      success: true,
    });
  } catch (error) {}
});

module.exports = router;
