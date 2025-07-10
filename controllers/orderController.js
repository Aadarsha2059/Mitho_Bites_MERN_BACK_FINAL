const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const User = require("../models/User");
const PaymentMethod = require("../models/paymentmethod");
const { transformProductData } = require("../utils/imageUtils");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");

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
        // Send bill confirmation email
        try {
            const user = await User.findById(userId);
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });
            const orderItemsHtml = order.items.map((item, idx) => `
                <tr>
                    <td style='padding:8px 12px;border:1px solid #ddd;text-align:center;'>${idx + 1}</td>
                    <td style='padding:8px 12px;border:1px solid #ddd;'>${item.productName || item.productId.name}</td>
                    <td style='padding:8px 12px;border:1px solid #ddd;text-align:center;'>${item.quantity}</td>
                    <td style='padding:8px 12px;border:1px solid #ddd;text-align:right;'>${item.price}</td>
                    <td style='padding:8px 12px;border:1px solid #ddd;'>${item.restaurantName || (item.productId.restaurantId?.name || '')}</td>
                </tr>
            `).join("");
            const restaurantName = order.items[0]?.restaurantName || order.items[0]?.productId?.restaurantId?.name || 'Unknown';
            const orderDate = order.orderDate ? new Date(order.orderDate) : new Date();
            const billHtml = `
                <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:32px auto;background:#fff;border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,0.08);overflow:hidden;">
                    <div style="background:#ff6600;color:#fff;padding:24px 32px 12px 32px;text-align:center;">
                        <h1 style="margin:0;font-size:2.2em;letter-spacing:1px;">Mitho Bites</h1>
                        <div style="font-size:1.1em;opacity:0.95;">Order Bill / Receipt</div>
                    </div>
                    <div style="padding:24px 32px 8px 32px;">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                            <div style="font-size:1.1em;"><b>Bill To:</b> ${user.fullname || user.username}</div>
                            <div style="font-size:1.1em;"><b>Order #</b> ${order._id}</div>
                        </div>
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                            <div><b>Date:</b> ${orderDate.toLocaleDateString()}<br/><b>Time:</b> ${orderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            <div><b>Delivery Address:</b> ${order.deliveryAddress?.street || ''}</div>
                        </div>
                        <table style="width:100%;border-collapse:collapse;margin-top:16px;font-size:1em;">
                            <thead>
                                <tr style="background:#f7f7f7;">
                                    <th style='padding:8px 12px;border:1px solid #ddd;'>#</th>
                                    <th style='padding:8px 12px;border:1px solid #ddd;'>Product</th>
                                    <th style='padding:8px 12px;border:1px solid #ddd;'>Qty</th>
                                    <th style='padding:8px 12px;border:1px solid #ddd;'>Price</th>
                                    <th style='padding:8px 12px;border:1px solid #ddd;'>Restaurant</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${orderItemsHtml}
                            </tbody>
                        </table>
                        <div style="display:flex;justify-content:flex-end;margin-top:18px;">
                            <table style="min-width:260px;font-size:1.05em;">
                                <tr>
                                    <td style="padding:6px 0 6px 0;">Subtotal:</td>
                                    <td style="padding:6px 0 6px 0;text-align:right;">NPR ${order.totalAmount}</td>
                                </tr>
                                <tr>
                                    <td style="padding:6px 0 6px 0;">Delivery Fee:</td>
                                    <td style="padding:6px 0 6px 0;text-align:right;">NPR 0</td>
                                </tr>
                                <tr style="font-weight:bold;border-top:2px solid #eee;">
                                    <td style="padding:8px 0 8px 0;">Total:</td>
                                    <td style="padding:8px 0 8px 0;text-align:right;">NPR ${order.totalAmount}</td>
                                </tr>
                            </table>
                        </div>
                        <div style="margin-top:24px;font-size:1.05em;">
                            <b>Payment Method:</b> ${order.paymentMethod ? order.paymentMethod.toUpperCase() : 'N/A'}
                        </div>
                        <div style="margin-top:8px;font-size:1.05em;">
                            <b>Order Status:</b> ${order.orderStatus ? order.orderStatus.toUpperCase() : 'N/A'}
                        </div>
                        <div style="margin-top:32px;display:flex;justify-content:space-between;align-items:flex-end;">
                            <div style='font-size:13px;color:#888;'>Checkout by: <b>system super admin Aadarsha Babu Dhakal</b></div>
                            <div style='font-size:13px;color:#888;'>Receiver name: <b>${restaurantName}</b></div>
                        </div>
                        <div style="margin-top:32px;text-align:center;color:#aaa;font-size:0.98em;">
                            Thank you for choosing Mitho Bites!<br/>
                            <span style="font-size:0.95em;">For support, contact <a href='mailto:${process.env.EMAIL_USER}' style='color:#ff6600;text-decoration:none;'>${process.env.EMAIL_USER}</a></span><br/>
                            <span style="font-size:0.95em;">&copy; ${new Date().getFullYear()} Mitho Bites Nepal</span>
                        </div>
                    </div>
                </div>
            `;
            const mailOptions = {
                from: `"Mitho Bites" <${process.env.EMAIL_USER}>`,
                to: user.email,
                subject: "Bill Confirmation - Mitho Bites",
                html: billHtml
            };
            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    console.error('Bill email error:', err);
                } else {
                    console.log('Bill confirmation email sent:', info.response);
                }
            });
        } catch (emailErr) {
            console.error('Bill confirmation email failed:', emailErr);
        }
        return res.status(200).json({ success: true, message: "Order marked as received", data: transformedOrder });
    } catch (err) {
        console.error("Mark Order Received Error:", err);
        return res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
}; 

// Get purchase trend for the last 7 days
exports.getPurchaseTrend = async (req, res) => {
    try {
        const userId = req.query.userId || req.user?._id;
        if (!userId) {
            return res.status(400).json({ success: false, message: 'User ID is required' });
        }
        // Calculate date 7 days ago
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - 6); // includes today
        startDate.setHours(0, 0, 0, 0);

        // Aggregate orders by day (only received orders)
        const trend = await Order.aggregate([
            { $match: {
                userId: new mongoose.Types.ObjectId(userId),
                orderDate: { $gte: startDate },
                orderStatus: 'received'
            }},
            { $unwind: "$items" },
            { $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$orderDate" } },
                orderCount: { $addToSet: "$_id" }, // unique order IDs per day
                totalAmount: { $sum: "$totalAmount" },
                itemsReceived: { $sum: "$items.quantity" }
            }},
            { $project: {
                _id: 1,
                orderCount: { $size: "$orderCount" },
                totalAmount: 1,
                itemsReceived: 1
            }},
            { $sort: { _id: 1 } }
        ]);

        // Fill missing days with zeroes
        const result = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            const dateStr = date.toISOString().slice(0, 10);
            const dayData = trend.find(t => t._id === dateStr);
            result.push({
                date: dateStr,
                orderCount: dayData ? dayData.orderCount : 0,
                totalAmount: dayData ? dayData.totalAmount : 0,
                itemsReceived: dayData ? dayData.itemsReceived : 0
            });
        }
        // Ensure present day is at the end (oldest to newest)
        // (Already constructed in order: 6 days ago ... today)
        // But if not, sort just in case
        result.sort((a, b) => a.date.localeCompare(b.date));
        return res.json({ success: true, data: result });
    } catch (err) {
        console.error('Error in getPurchaseTrend:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
}; 