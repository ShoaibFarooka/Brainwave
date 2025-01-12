const mongoose = require("mongoose");
const { Schema } = mongoose;

// Payment History Schema
const PaymentHistorySchema = new Schema({
  orderId: { type: String, required: true },
  referenceId: { type: String, default: null },
  plan: { type: Schema.Types.ObjectId, ref: "Plan", required: true },
  amount: { type: Number, required: true }, // Amount should be required to avoid issues
  coupon: { type: Schema.Types.ObjectId, ref: "Coupon", default: null },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed"],
    required: true,
  },
  paymentDate: { type: String, required: true }, // Changed to Date for better handling
  paymentMethod: { type: String, default: "ZenoPay" },
});

// Subscription Schema
const SubscriptionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    activePlan: { type: Schema.Types.ObjectId, ref: "Plan", required: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      required: true,
    },
    startDate: { type: String, default: null }, // Changed to Date type
    endDate: { type: String, default: null }, // Changed to Date type
    status: {
      type: String,
      enum: ["pending", "active", "expired"],
      required: true,
    },
    renewalAttempts: { type: Number, default: 0 },
    paymentHistory: [PaymentHistorySchema],
  },
  { timestamps: true }
); // Added timestamps for createdAt and updatedAt fields

// Model creation
const Subscription = mongoose.model("Subscription", SubscriptionSchema);

module.exports = Subscription;
