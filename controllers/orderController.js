const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const User = require("../models/User");

// Create order from cart
exports.createOrder = async (req, res) => {
    try {
        console.log("=== Order Creation Started ===");
        const userId = req.user._id;
        console.log("User ID:", userId);
        
        const {
            deliveryInstructions = "",
            paymentMethod = "cash"
        } = req.body;
        console.log("Request body:", req.body);

        // Get user's profile to use their address
        const user = await User.findById(userId);
        if (!user) {
            console.log("User not found");
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        console.log("User found:", user.fullname);

        // Use user's address from profile
        const deliveryAddress = {
            street: user.address || "User's address",
            city: "User's city",
            state: "User's state",
            zipCode: "User's zip",
            country: "Nepal"
        };
        console.log("Delivery address:", deliveryAddress);

        // Get user's cart with proper population
        console.log("Fetching cart for user:", userId);
        const cart = await Cart.findOne({ userId })
            .populate({
                path: 'items.productId',
                select: 'name price isAvailable type',
                populate: [
                    { path: 'categoryId', select: 'name' },
                    { path: 'restaurantId', select: 'name location' }
                ]
            });

        console.log("Cart found:", cart ? "Yes" : "No");
        if (cart) {
            console.log("Cart items count:", cart.items.length);
            console.log("Cart items:", JSON.stringify(cart.items, null, 2));
            
            // Check each item structure
            cart.items.forEach((item, index) => {
                console.log(`Item ${index}:`, {
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.price,
                    hasProductId: !!item.productId,
                    productIdType: typeof item.productId,
                    isProductIdObject: item.productId && typeof item.productId === 'object'
                });
            });
        }

        if (!cart || cart.items.length === 0) {
            console.log("Cart is empty");
            return res.status(400).json({
                success: false,
                message: "Cart is empty"
            });
        }

        // Validate all products are available
        console.log("Validating products...");
        for (const item of cart.items) {
            console.log("Checking item:", item.productId?.name, "Available:", item.productId?.isAvailable);
            if (!item.productId || !item.productId.isAvailable) {
                console.log("Product not available:", item.productId?.name);
                return res.status(400).json({
                    success: false,
                    message: `${item.productId?.name || 'Product'} is not available`
                });
            }
        }

        // Create order items with safe data extraction
        console.log("Creating order items...");
        const orderItems = cart.items.map(item => {
            // Safety check for item structure
            if (!item || !item.productId) {
                console.error("Invalid cart item:", item);
                throw new Error("Invalid cart item structure");
            }
            
            return {
                productId: item.productId._id || item.productId,
                quantity: item.quantity || 1,
                price: item.price || item.productId.price || 0,
                productName: item.productId.name || 'Unknown Product',
                categoryName: item.productId.categoryId?.name || 'Unknown Category',
                restaurantName: item.productId.restaurantId?.name || 'Unknown Restaurant',
                restaurantLocation: item.productId.restaurantId?.location || 'Location not available',
                foodType: item.productId.type || 'Unknown Type'
            };
        });

        // Calculate total amount
        const totalAmount = orderItems.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
        console.log("Total amount calculated:", totalAmount);

        // Calculate estimated delivery time (30-45 minutes from now)
        const estimatedDeliveryTime = new Date();
        estimatedDeliveryTime.setMinutes(estimatedDeliveryTime.getMinutes() + 45);

        // Create order
        console.log("Creating order object...");
        const order = new Order({
            userId,
            items: orderItems,
            totalAmount,
            deliveryAddress,
            deliveryInstructions,
            paymentMethod,
            estimatedDeliveryTime
        });

        console.log("Saving order...");
        await order.save();
        console.log("Order saved successfully, ID:", order._id);

        // Clear cart after successful order
        console.log("Clearing cart...");
        cart.items = [];
        await cart.save();
        console.log("Cart cleared");

        await order.populate({
            path: 'items.productId',
            select: 'name price filepath'
        });

        console.log("=== Order Creation Completed Successfully ===");
        return res.status(201).json({
            success: true,
            message: "Order created successfully",
            data: order
        });
    } catch (err) {
        console.error("=== Create Order Error ===");
        console.error("Error details:", err);
        console.error("Error stack:", err.stack);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// Get user's orders
exports.getUserOrders = async (req, res) => {
    try {
        console.log("=== Get User Orders Started ===");
        const userId = req.user._id;
        console.log("User ID:", userId);
        
        const { page = 1, limit = 10, status = "" } = req.query;
        const skip = (page - 1) * limit;
        console.log("Query params:", { page, limit, status, skip });

        let filter = { userId };
        if (status) {
            filter.orderStatus = status;
        }
        console.log("Filter:", filter);

        const orders = await Order.find(filter)
            .populate({
                path: 'items.productId',
                select: 'name price filepath'
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        console.log("Orders found:", orders.length);
        console.log("Orders:", JSON.stringify(orders, null, 2));

        const total = await Order.countDocuments(filter);
        console.log("Total orders:", total);

        console.log("=== Get User Orders Completed ===");
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
        console.error("=== Get Orders Error ===");
        console.error("Error details:", err);
        console.error("Error stack:", err.stack);
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