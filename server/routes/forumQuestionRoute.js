const router = require("express").Router();
const ForumQuestion = require("../models/forumQuestionModel");
const authMiddleware = require("../middlewares/authMiddleware");
const User = require("../models/userModel");

// add question in the forum

router.post("/add-question", authMiddleware, async (req, res) => {
    const startTime = performance.now();
    const userId = req.body.userId; // Assuming userId is retrieved from the authMiddleware

    // Fetch the requesting user's details
    const user = await User.findById(userId);

    if (!user) {
        return res.status(404).send({
            message: "User not found",
            success: false,
        });
    }

    const userSchoolType = user.schoolType;

    try {
        const { title, body, userId } = req.body;
        const newForumQuestion = new ForumQuestion({
            title,
            body,
            user: userId,
            schoolType: userSchoolType
        });
        await newForumQuestion.save();
        res.send({
            message: "question added successfully",
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

// add reply to the question in the forum

router.post("/add-reply", authMiddleware, async (req, res) => {
    const userId = req.body.userId; // Assuming userId is retrieved from the authMiddleware

    // Fetch the requesting user's details
    const user = await User.findById(userId);

    if (!user) {
        return res.status(404).send({
            message: "User not found",
            success: false,
        });
    }

    const userSchoolType = user.schoolType;
    try {
        const { text, questionId, userId } = req.body;
        const question = await ForumQuestion.findById(questionId);
        question.replies.push({
            text,
            user: userId,
            schoolType: userSchoolType
        });
        await question.save();
        res.send({
            message: "reply added successfully",
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

// get all questions

router.get("/get-all-questions", authMiddleware, async (req, res) => {
    const startTime = performance.now();
    const userId = req.body.userId; // Assuming userId is retrieved from the authMiddleware

    // Fetch the requesting user's details
    const user = await User.findById(userId);

    if (!user) {
        return res.status(404).send({
            message: "User not found",
            success: false,
        });
    }

    const userSchoolType = user.schoolType;
    const isAdmin = user.isAdmin;

    try {
        // Extract page and limit from query parameters, with default values
        const page = parseInt(req.query.page) || 1; // Default to page 1
        const limit = parseInt(req.query.limit) || 10; // Default to 10 questions per page

        // Calculate the starting index for pagination
        const skip = (page - 1) * limit;

        let filter = {};

        // Define the filter condition based on schoolType
        if (userSchoolType === "secondary") {
            filter = { schoolType: "secondary" };
        } else {
            filter = { schoolType: { $ne: "secondary" } }; // Exclude "secondary"
        }

        if (isAdmin) {
            filter = {};
        }

        // Fetch questions with the defined filter and pagination
        const questions = await ForumQuestion
            .find(filter)
            .populate("user")
            .populate("replies.user")
            .skip(skip)
            .limit(limit);

        // Get the total count of questions matching the filter
        const totalQuestions = await ForumQuestion.countDocuments(filter);

        const endTime = performance.now();
        // console.log("Time taken in milliseconds by forum endpoint", endTime - startTime);

        res.send({
            message: "Questions fetched successfully",
            data: questions,
            currentPage: page,
            totalPages: Math.ceil(totalQuestions / limit),
            totalQuestions: totalQuestions,
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



router.delete("/delete-question/:questionId", authMiddleware, async (req, res) => {
    try {
        const { questionId } = req.params;
        const deletedQuestion = await ForumQuestion.findByIdAndDelete(questionId);
        if (!deletedQuestion) {
            return res.send({
                message: "Unable to delete question",
                success: false,
            });
        }
        res.send({
            message: "question deleted successfully",
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

router.put("/update-question/:questionId", authMiddleware, async (req, res) => {
    const userId = req.body.userId; // Assuming userId is retrieved from the authMiddleware

    // Fetch the requesting user's details
    const user = await User.findById(userId);

    if (!user) {
        return res.status(404).send({
            message: "User not found",
            success: false,
        });
    }

    const userSchoolType = user.schoolType;

    try {
        const { questionId } = req.params;
        const { title, body } = req.body;

        const updatedQuestion = await ForumQuestion.findByIdAndUpdate(questionId, { title, body, schoolType: userSchoolType });
        if (!updatedQuestion) {
            return res.send({
                message: "Unable to update question",
                success: false,
            });
        }
        res.send({
            message: "question updated successfully",
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

router.put("/update-reply-status/:questionId", authMiddleware, async (req, res) => {
    try {
        const { questionId } = req.params;
        const { replyId, status } = req.body;
        if (!questionId || !replyId || typeof (status) !== 'boolean') {
            return res.status(400).send({
                success: false,
                message: "QuestionId, replyId and status are required."
            });
        }
        const question = await ForumQuestion.findById(questionId);
        if (!question) {
            return res.status(404).send({
                success: false,
                message: "Question not found."
            });
        }
        const reply = question.replies.find(r => r._id.equals(replyId));
        if (!reply) {
            return res.status(404).send({
                success: false,
                message: "Reply not found."
            });
        }
        reply.isVerified = status;
        await question.save();
        return res.status(200).send({
            success: true,
            message: "Reply status updated successfully."
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