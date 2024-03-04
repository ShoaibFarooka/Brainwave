const authMiddleware = require("../middlewares/authMiddleware");
const Exam = require("../models/examModel");
const User = require("../models/userModel");
const Report = require("../models/reportModel");
const router = require("express").Router();

// add report

router.post("/add-report", authMiddleware, async (req, res) => {
  try {
    const newReport = new Report(req.body);
    await newReport.save();
    res.send({
      message: "Attempt added successfully",
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

// get all reports

router.post("/get-all-reports", authMiddleware, async (req, res) => {
  try {
    const { examName, userName } = req.body;

    const exams = await Exam.find({
      name: {
        $regex: examName,
      },
    });

    const matchedExamIds = exams.map((exam) => exam._id);

    const users = await User.find({
      name: {
        $regex: userName,
      },
    });

    const matchedUserIds = users.map((user) => user._id);

    const reports = await Report.find({
      exam: {
        $in: matchedExamIds,
      },
      user: {
        $in: matchedUserIds,
      },
    })
      .populate("exam")
      .populate("user")
      .sort({ createdAt: -1 });
    res.send({
      message: "Attempts fetched successfully",
      data: reports,
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

// get all reports by user
router.post("/get-all-reports-by-user", authMiddleware, async (req, res) => {
  try {
    const reports = await Report.find({ user: req.body.userId })
      .populate("exam")
      .populate("user")
      .sort({ createdAt: -1 });
    res.send({
      message: "Attempts fetched successfully",
      data: reports,
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

// get all reports for ranking
router.get("/get-all-reports-for-ranking", authMiddleware, async (req, res) => {
  try {
    const distinctPassReportsCountPerUser = await Report.aggregate([
      // Stage 1: Match reports where the verdict is "Pass"
      {
        $match: {
          "result.verdict": "Pass",
        },
      },
      // Stage 2: Group by both user and exam to count the number of reports for each distinct user-exam combination
      {
        $group: {
          _id: {
            user: "$user",
            exam: "$exam",
          },
          count: { $sum: 1 },
        },
      },
      // Stage 3: Group by user to get the count of distinct exams for each user
      {
        $group: {
          _id: "$_id.user",
          score: { $sum: 1 },
        },
      },
      // Stage 4: Lookup user details from the "users" collection
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      // Stage 5: Unwind the array created by the $lookup stage
      {
        $unwind: "$userDetails",
      },
      // Stage 6: Project to shape the final output
      {
        $project: {
          userId: "$_id",
          userPhoto:"$userDetails.profileImage",
          userName: "$userDetails.name",
          userSchool: "$userDetails.school",
          userClass: "$userDetails.class",
          score: 1,
          _id: 0,
        },
      },
      // Stage 7: Sort the results in descending order based on the score
      {
        $sort: {
          score: -1,
          userName: 1,
        },
      },
    ]);
    res.send({
      message: "Reports for all users fetched successfully",
      data: distinctPassReportsCountPerUser,
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

module.exports = router;