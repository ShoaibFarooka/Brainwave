const authMiddleware = require("../middlewares/authMiddleware");
const Review = require("../models/reviewModel");
const router = require("express").Router();

// add review

router.post("/add-review", authMiddleware, async (req, res) => {
    const { rating, text, userId } = req.body;
    const data = {
        rating,
        text,
        user: userId
    };
    const newReview = new Review(data);
    await newReview.save();
    try {
        res.send({
            message: "Review added successfully",
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

router.get("/get-all-reviews", async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate('user');
        res.send({
            message: "Reviews fetched successfully",
            data: reviews,
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