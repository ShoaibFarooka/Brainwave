    //user, plan, order_id, invoice_status

const PaymentHistorySchema = new Schema({
    orderId: { type: String, required: true },
    referenceId: { type: String, required: false, default: null },
    plan: { type: Schema.Types.ObjectId, ref: 'Plan', required: true },
    amount: { type: Number, required: false },
    coupon: { type: Schema.Types.ObjectId, ref: 'Coupon', required: false, default: null },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        required: true
    },
    paymentDate: { type: String, required: true },
    paymentMethod: { type: String, default: 'ZenoPay' },
});

// Subscription Schema
const SubscriptionSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    activePlan: { type: Schema.Types.ObjectId, ref: 'Plan', required: true },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        required: true
    },
    startDate: { type: String, required: false, default: null },
    endDate: { type: String, required: false, default: null },
    status: {
        type: String,
        enum: ['pending', 'active', 'expired'],
        required: true
    },
    renewalAttempts: { type: Number, default: 0 },
    paymentHistory: [PaymentHistorySchema],
});

// Model creation
const Subscription = mongoose.model('Subscription', SubscriptionSchema);

module.exports = Subscription;