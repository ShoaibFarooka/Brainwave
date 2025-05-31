const authMiddleware = require("../middlewares/authMiddleware");
const Exam = require("../models/examModel");
const User = require("../models/userModel");
const Report = require("../models/reportModel");
const Subscription = require("../models/subscriptionModel");
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
    const { examName, userName, page, limit } = req.body;

    // Fetch exams matching the name
    const exams = await Exam.find({
      name: {
        $regex: examName,
        $options: "i", // Case-insensitive matching
      },
    });

    const matchedExamIds = exams.map((exam) => exam._id);

    // Fetch users matching the name
    const users = await User.find({
      name: {
        $regex: userName,
        $options: "i",
      },
    });

    const matchedUserIds = users.map((user) => user._id);

    // Fetch reports with pagination
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
      .sort({ createdAt: -1 }) // Sort by most recent
      .skip((page - 1) * limit) // Skip documents for previous pages
      .limit(parseInt(limit)); // Limit number of documents per page

    // Count total matching documents
    const totalReports = await Report.countDocuments({
      exam: {
        $in: matchedExamIds,
      },
      user: {
        $in: matchedUserIds,
      },
    });

    res.send({
      message: "Attempts fetched successfully",
      data: reports,
      success: true,
      pagination: {
        totalReports,
        currentPage: page,
        totalPages: Math.ceil(totalReports / limit),
      },
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
    const userId = req.body.userId;

    // Fetch the requesting user's details
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send({
        message: "User not found",
        success: false,
      });
    }

    // Determine match conditions based on user's school type
    let matchConditions;
    if (user.schoolType === "secondary") {
      // If viewing user is secondary, show only users who are secondary AND took secondary exams
      matchConditions = {
        $and: [
          {
            "userDetails.schoolType": "secondary",
          },
          {
            "examDetails.schoolType": "secondary"
          }
        ]
      };
    } else {
      // For all other cases, exclude any reports where either user or exam is secondary
      matchConditions = {
        $and: [
          {
            "userDetails.schoolType": { $ne: "secondary" }
          },
          {
            "examDetails.schoolType": { $ne: "secondary" }
          }
        ]
      };
    }

    const distinctPassReportsCountPerUser = await Report.aggregate([
      // Stage 1: Lookup exam details
      {
        $lookup: {
          from: "exams",
          localField: "exam",
          foreignField: "_id",
          as: "examDetails"
        }
      },
      // Stage 2: Unwind exam details
      {
        $unwind: "$examDetails"
      },
      // Stage 3: Lookup user details
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      // Stage 4: Unwind user details
      {
        $unwind: "$userDetails"
      },
      // Stage 5: Match conditions
      {
        $match: {
          $and: [
            { "result.verdict": "Pass" },
            matchConditions
          ]
        }
      },
      // Stage 6: Group by user and exam for distinct score & attempts
      {
        $group: {
          _id: { user: "$user", exam: "$exam" },
          maxScore: { $max: "$result.score" },
          totalMarks: { $first: "$examDetails.totalMarks" },
          attempts: { $sum: 1 },
          userDetails: { $first: "$userDetails" }
        }
      },
      // Stage 7: Group by user to compute aggregates
      {
        $group: {
          _id: "$_id.user",
          totalMaxScores: { $sum: "$maxScore" },
          totalPossibleScores: { $sum: "$totalMarks" },
          retryCount: { $sum: { $subtract: ["$attempts", 1] } },
          score: { $sum: 1 },
          userDetails: { $first: "$userDetails" }
        }
      },
      // Stage 8: Project final output with rankingScore
      {
        $project: {
          userId: "$_id",
          userPhoto: "$userDetails.profileImage",
          userName: "$userDetails.name",
          userSchool: "$userDetails.school",
          userClass: "$userDetails.class",
          score: 1,
          retryCount: 1,
          scoreRatio: {
            $cond: [
              { $gt: ["$totalPossibleScores", 0] },
              { $divide: ["$totalMaxScores", "$totalPossibleScores"] },
              0
            ]
          },
          rankingScore: {
            $subtract: [
              {
                $cond: [
                  { $gt: ["$totalPossibleScores", 0] },
                  { $divide: ["$totalMaxScores", "$totalPossibleScores"] },
                  0
                ]
              },
              { $divide: ["$retryCount", 10] }
            ]
          },
          _id: 0
        }
      },
      // Stage 9: Sort by rankingScore then name
      {
        $sort: {
          score: -1,
          userName: 1
        }
      }
    ]);

    const updatedResults = await Promise.all(
      distinctPassReportsCountPerUser.map(async (row) => {
        const subscription = await Subscription.findOne({ user: row.userId });

        let subscriptionStatus = "expired";

        if (subscription && subscription.paymentStatus === "paid" && new Date(subscription.endDate) > new Date()) {
          const history = subscription.paymentHistory || [];
          const lastPayment = history[history.length - 1];

          if (lastPayment && lastPayment.paymentStatus === "paid") {
            subscriptionStatus = "active";
          }
        }

        return {
          ...row,
          subscriptionStatus
        };
      })
    );

    res.send({
      message: "Reports for all users fetched successfully",
      data: updatedResults,
      success: true
    });


  } catch (error) {
    res.status(500).send({
      message: error.message,
      data: error,
      success: false
    });
  }
});

module.exports = router;