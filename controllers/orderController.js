const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const User = require("../models/User");
const PaymentMethod = require("../models/paymentmethod");
const { transformProductData } = require("../utils/imageUtils");
const nodemailer = require("nodemailer");

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

        // Log payment data
        let paymentmodeValue = order.paymentMethod;
        if (paymentmodeValue === 'cash') paymentmodeValue = 'cod';
        const payment = new PaymentMethod({
            food: order.items.map(i => i.productName).join(", "),
            quantity: order.items.reduce((sum, i) => sum + i.quantity, 0),
            totalprice: order.totalAmount,
            paymentmode: paymentmodeValue
        });
        await payment.save();

        // Clear cart after successful order
        console.log("Clearing cart...");
        cart.items = [];
        await cart.save();
        console.log("Cart cleared");

        await order.populate({
            path: 'items.productId',
            select: 'name price filepath'
        });

        // Send order confirmation email
        try {
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });
            const orderItemsHtml = orderItems.map(item => `
                <tr>
                    <td style='padding:8px;border:1px solid #eee;'>${item.productName}</td>
                    <td style='padding:8px;border:1px solid #eee;'>${item.quantity}</td>
                    <td style='padding:8px;border:1px solid #eee;'>${item.price}</td>
                    <td style='padding:8px;border:1px solid #eee;'>${item.restaurantName}</td>
                </tr>
            `).join("");
            const mailOptions = {
                from: `"Mitho Bites" <${process.env.EMAIL_USER}>`,
                to: user.email,
                subject: "Order Confirmation - Mitho Bites",
                html: `
                    <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                        <h2 style='color: #ff6600;'>Thank you for your order, ${user.fullname || user.username}!</h2>
                        <p>Your order <b>#${order._id}</b> has been placed successfully.</p>
                        <h3>Order Summary:</h3>
                        <table style='width:100%;border-collapse:collapse;'>
                            <thead>
                                <tr style='background:#f7f7f7;'>
                                    <th style='padding:8px;border:1px solid #eee;'>Product</th>
                                    <th style='padding:8px;border:1px solid #eee;'>Qty</th>
                                    <th style='padding:8px;border:1px solid #eee;'>Price</th>
                                    <th style='padding:8px;border:1px solid #eee;'>Restaurant</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${orderItemsHtml}
                            </tbody>
                        </table>
                        <p style='margin-top:16px;'><b>Total Amount:</b> NPR ${totalAmount}</p>
                        <p><b>Delivery Address:</b> ${deliveryAddress.street}</p>
                        <p><b>Estimated Delivery Time:</b> ${estimatedDeliveryTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        <p style='margin-top:24px;'>If you have any questions, contact us at <a href='mailto:${process.env.EMAIL_USER}'>${process.env.EMAIL_USER}</a>.</p>
                        <p style='color:#888;font-size:13px;'>Mitho Bites Nepal &copy; ${new Date().getFullYear()}</p>
                    </div>
                `
            };
            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    console.error('Order email error:', err);
                } else {
                    console.log('Order confirmation email sent:', info.response);
                }
            });
        } catch (emailErr) {
            console.error('Order confirmation email failed:', emailErr);
        }

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
                select: 'name price filepath description type',
                populate: [
                    { path: 'categoryId', select: 'name' },
                    { path: 'restaurantId', select: 'name location' }
                ]
            })
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip);

        console.log("Orders found:", orders.length);

        // Transform orders with full image URLs
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const transformedOrders = orders.map(order => {
            const transformedOrder = order.toObject();
            
            // Transform product images in order items
            if (transformedOrder.items && Array.isArray(transformedOrder.items)) {
                transformedOrder.items = transformedOrder.items.map(item => {
                    const transformedItem = { ...item };
                    if (item.productId && item.productId.filepath) {
                        const cleanFilename = item.productId.filepath.replace(/^uploads\//, '');
                        transformedItem.productId = {
                            ...item.productId,
                            image: `${baseUrl}/uploads/${cleanFilename}`
                        };
                    }
                    return transformedItem;
                });
            }
            
            return transformedOrder;
        });

        console.log("Transformed orders:", JSON.stringify(transformedOrders, null, 2));

        const total = await Order.countDocuments(filter);
        console.log("Total orders:", total);

        console.log("=== Get User Orders Completed ===");
        return res.status(200).json({
            success: true,
            message: "Orders fetched successfully",
            data: transformedOrders,
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
        console.log(`[CANCEL ORDER] User: ${req.user._id}, Order: ${req.params.id}, Body:`, req.body);
        // Ignore any request body
        const userId = req.user._id;
        const orderId = req.params.id;
        let order = await Order.findOne({ _id: orderId, userId });
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }
        // Only allow cancelling from pending
        if (order.orderStatus !== "pending") {
            return res.status(400).json({ success: false, message: "Order cannot be cancelled" });
        }
        order.orderStatus = "cancelled";
        await order.save();
        // Re-fetch with population and transform
        order = await Order.findOne({ _id: orderId, userId })
            .populate({
                path: 'items.productId',
                select: 'name price filepath description type',
                populate: [
                    { path: 'categoryId', select: 'name' },
                    { path: 'restaurantId', select: 'name location' }
                ]
            });
        // Transform product images in order items
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const transformedOrder = order.toObject();
        if (transformedOrder.items && Array.isArray(transformedOrder.items)) {
            transformedOrder.items = transformedOrder.items.map(item => {
                const transformedItem = { ...item };
                if (item.productId && item.productId.filepath) {
                    const cleanFilename = item.productId.filepath.replace(/^uploads\//, '');
                    transformedItem.productId = {
                        ...item.productId,
                        image: `${baseUrl}/uploads/${cleanFilename}`
                    };
                }
                return transformedItem;
            });
        }
        return res.status(200).json({ success: true, message: "Order cancelled successfully", data: transformedOrder });
    } catch (err) {
        console.error("Cancel Order Error:", err);
        return res.status(500).json({ success: false, message: "Server error", error: err.message });
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

// Mark order as received
exports.markOrderReceived = async (req, res) => {
    try {
        console.log(`[RECEIVE ORDER] User: ${req.user._id}, Order: ${req.params.id}, Body:`, req.body);
        // Ignore any request body
        const userId = req.user._id;
        const orderId = req.params.id;
        let order = await Order.findOne({ _id: orderId, userId });
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }
        if (order.orderStatus !== "pending") {
            return res.status(400).json({ success: false, message: "Order must be pending to be marked as received" });
        }
        order.orderStatus = "received";
        await order.save();
        // Re-fetch with population and transform
        order = await Order.findOne({ _id: orderId, userId })
            .populate({
                path: 'items.productId',
                select: 'name price filepath description type',
                populate: [
                    { path: 'categoryId', select: 'name' },
                    { path: 'restaurantId', select: 'name location' }
                ]
            });
        // Transform product images in order items
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const transformedOrder = order.toObject();
        if (transformedOrder.items && Array.isArray(transformedOrder.items)) {
            transformedOrder.items = transformedOrder.items.map(item => {
                const transformedItem = { ...item };
                if (item.productId && item.productId.filepath) {
                    const cleanFilename = item.productId.filepath.replace(/^uploads\//, '');
                    transformedItem.productId = {
                        ...item.productId,
                        image: `${baseUrl}/uploads/${cleanFilename}`
                    };
                }
                return transformedItem;
            });
        }
        return res.status(200).json({ success: true, message: "Order marked as received", data: transformedOrder });
    } catch (err) {
        console.error("Mark Order Received Error:", err);
        return res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
}; 