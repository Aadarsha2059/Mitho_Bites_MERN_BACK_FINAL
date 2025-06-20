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
        required: true
    }
});

module.exports = mongoose.model("PaymentMethod", paymentMethodSchema); 