const router = require("express").Router();
const forumQuestion = require("../models/forumQuestionModel");
const authMiddleware = require("../middlewares/authMiddleware");

// add question in the forum

router.post("/add-question", authMiddleware, async (req, res) => {
    try {
        const { title, body, userId } = req.body;
        const newForumQuestion = new forumQuestion({
            title,
            body,
            user: userId
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
    try {
        const { text, questionId, userId } = req.body;
        const question = await forumQuestion.findById(questionId);
        question.replies.push({
            text,
            user: userId,
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
    try {
        const questions = await forumQuestion.find()
            .populate('user')
            .populate('replies.user');
        res.send({
            message: "questions fetched successfully",
            data: questions,
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
        const deletedQuestion = await forumQuestion.findByIdAndDelete(questionId);
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
    try {
        const { questionId } = req.params;
        const { title, body } = req.body;
        const updatedQuestion = await forumQuestion.findByIdAndUpdate(questionId, { title, body });
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
        const question = await forumQuestion.findById(questionId);
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