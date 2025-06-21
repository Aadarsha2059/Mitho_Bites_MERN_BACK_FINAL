const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// Create order from cart
exports.createOrder = async (req, res) => {
    try {
        const userId = req.user._id;
        const {
            deliveryAddress,
            deliveryInstructions = "",
            paymentMethod = "cash"
        } = req.body;

        if (!deliveryAddress) {
            return res.status(400).json({
                success: false,
                message: "Delivery address is required"
            });
        }

        // Get user's cart
        const cart = await Cart.findOne({ userId })
            .populate({
                path: 'items.productId',
                select: 'name price isAvailable'
            });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Cart is empty"
            });
        }

        // Validate all products are available
        for (const item of cart.items) {
            if (!item.productId.isAvailable) {
                return res.status(400).json({
                    success: false,
                    message: `${item.productId.name} is not available`
                });
            }
        }

        // Create order items
        const orderItems = cart.items.map(item => ({
            productId: item.productId._id,
            quantity: item.quantity,
            price: item.price,
            productName: item.productId.name
        }));

        // Calculate estimated delivery time (30-45 minutes from now)
        const estimatedDeliveryTime = new Date();
        estimatedDeliveryTime.setMinutes(estimatedDeliveryTime.getMinutes() + 45);

        // Create order
        const order = new Order({
            userId,
            items: orderItems,
            deliveryAddress,
            deliveryInstructions,
            paymentMethod,
            estimatedDeliveryTime
        });

        await order.save();

        // Clear cart after successful order
        cart.items = [];
        await cart.save();

        // Update product totalSold
        for (const item of orderItems) {
            await Product.findByIdAndUpdate(item.productId, {
                $inc: { totalSold: item.quantity }
            });
        }

        await order.populate({
            path: 'items.productId',
            select: 'name price filepath'
        });

        return res.status(201).json({
            success: true,
            message: "Order created successfully",
            data: order
        });
    } catch (err) {
        console.error("Create Order Error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// Get user's orders
exports.getUserOrders = async (req, res) => {
    try {
        const userId = req.user._id;
        const { page = 1, limit = 10, status = "" } = req.query;
        const skip = (page - 1) * limit;

        let filter = { userId };
        if (status) {
            filter.orderStatus = status;
        }

        const orders = await Order.find(filter)
            .populate({
                path: 'items.productId',
                select: 'name price filepath'
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        const total = await Order.countDocuments(filter);

        return res.status(200).json({
            success: true,
            message: "Orders fetched successfully",
            data: orders,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        console.error("Get Orders Error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// Get single order
exports.getOrderById = async (req, res) => {
    try {
        const userId = req.user._id;
        const orderId = req.params.id;

        const order = await Order.findOne({ _id: orderId, userId })
            .populate({
                path: 'items.productId',
                select: 'name price filepath description'
            });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Order fetched successfully",
            data: order
        });
    } catch (err) {
        console.error("Get Order Error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
    try {
        const userId = req.user._id;
        const orderId = req.params.id;

        const order = await Order.findOne({ _id: orderId, userId });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Check if order can be cancelled
        if (order.orderStatus === "delivered" || order.orderStatus === "cancelled") {
            return res.status(400).json({
                success: false,
                message: "Order cannot be cancelled"
            });
        }

        order.orderStatus = "cancelled";
        await order.save();

        return res.status(200).json({
            success: true,
            message: "Order cancelled successfully",
            data: order
        });
    } catch (err) {
        console.error("Cancel Order Error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// Update payment status
exports.updatePaymentStatus = async (req, res) => {
    try {
        const orderId = req.params.id;
        const { paymentStatus } = req.body;

        if (!paymentStatus || !["pending", "paid", "failed"].includes(paymentStatus)) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment status"
            });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        order.paymentStatus = paymentStatus;
        await order.save();

        return res.status(200).json({
            success: true,
            message: "Payment status updated successfully",
            data: order
        });
    } catch (err) {
        console.error("Update Payment Status Error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}; 