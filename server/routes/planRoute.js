const Plan = require("../models/planModel");
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const plans = await Plan.find({ status: true }); 
    res.status(200).json(plans);
  } catch (error) {
    res.status(500).json({ message: "Error fetching plans", error });
  }
});


const createPlan = async () => {
  try {
    const newPlan = new Plan({
      title: "Basic Membership",
      features: [
        "2-month full access",
        "Unlimited quizzes",
        "Personalized profile",
        "AI chat for instant help",
        "Forum for student discussions",
        "Study notes",
        "Past papers",
        "books",
        "Learning videos",
        "Track progress with rankings"
      ],
      actualPrice: 28570,
      discuntedPrice: 20000,
      discuntPercentage: 30,
      duration: 2, // in months
      status: true,
    });

    const savedPlan = await newPlan.save();
    console.log('Plan saved:', savedPlan);
  } catch (error) {
    console.error('Error creating plan:', error);
  }
};

// createPlan();


module.exports = router;