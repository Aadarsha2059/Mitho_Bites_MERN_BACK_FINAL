const mongoose = require("mongoose");

const paymentMethodSchema = new mongoose.Schema({
    food: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    totalprice: {
        type: Number,
        required: true
    },
    paymentmode: {
        type: String,
        required: true,
        enum: ['online', 'cod', 'card', 'esewa', 'khalti']
    },
    status: {
        type: String,
        default: 'completed',
        enum: ['pending', 'completed', 'failed', 'cancelled']
    },
    customerInfo: {
        name: String,
        phone: String,
        address: String
    },
    orderId: {
        type: String,
        unique: true
    }
}, {
    timestamps: true // This adds createdAt and updatedAt fields automatically
});

module.exports = mongoose.model("PaymentMethod", paymentMethodSchema); 