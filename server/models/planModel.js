const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  features: {
    type: [String],
    required: true,
    trim: true,
  },
  actualPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  discountedPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  discountPercentage: {
    type: Number,
    required: true,
    min: 0,
  },
  duration: {
    type: Number,
    required: true,
    min: 1,
  },
  status: {
    type: Boolean, 
    default: true,
  },
}, {
  timestamps: true, 
});

const Plan = mongoose.model('Plan', planSchema);

module.exports = Plan;
