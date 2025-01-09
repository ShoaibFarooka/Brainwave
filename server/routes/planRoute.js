const Plan = require("../models/planModel");

const createPlan = async () => {
  try {
    const newPlan = new Plan({
      title: "Basic Plan",
      description: "This is a basic subscription plan.",
      actualPrice: 200,
      discuntedPrice:100,
      discuntPercentage:20,
      duration: 1, // in days
      status: true,
    });

    const savedPlan = await newPlan.save();
    console.log('Plan saved:', savedPlan);
  } catch (error) {
    console.error('Error creating plan:', error);
  }
};

// createPlan();
