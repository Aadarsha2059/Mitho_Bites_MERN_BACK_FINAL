const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    categoryName: {
        type: String,
        required: true
    },
    restaurantName: {
        type: String,
        required: true
    },
    restaurantLocation: {
        type: String,
        required: true
    },
    foodType: {
        type: String,
        required: true
    }
});

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    items: [orderItemSchema],
    totalAmount: {
        type: Number,
        required: true
    },
    deliveryAddress: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    deliveryInstructions: {
        type: String,
        default: ""
    },
    paymentMethod: {
        type: String,
        enum: ["cash", "card", "online"],
        default: "cash"
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "paid", "failed"],
        default: "pending"
    },
    orderStatus: {
        type: String,
        enum: ["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"],
        default: "pending"
    },
    estimatedDeliveryTime: {
        type: Date
    },
    actualDeliveryTime: {
        type: Date
    },
    orderDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Calculate total amount before saving
orderSchema.pre('save', function(next) {
    this.totalAmount = this.items.reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);
    next();
});

module.exports = mongoose.model("Order", orderSchema);
