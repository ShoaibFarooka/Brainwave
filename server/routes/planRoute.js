const Plan = require("../models/planModel");

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
