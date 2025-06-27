const Order = require("../../models/Order");

exports.createOrder = async (req, res) => {
    const { productId, userId, quantity, price } = req.body;

    if (!productId || !userId || !quantity || !price) {
        return res.status(403).json({
            success: false,
            message: "Missing required fields",
        });
    }

    try {
        const order = new Order({
            userId,
            items: [{
                productId,
                quantity,
                price,
                productName: "Test Product",
                categoryName: "Test Category",
                restaurantName: "Test Restaurant",
                restaurantLocation: "Test Location",
                foodType: "food"
            }],
            totalAmount: price * quantity
        });

        await order.save();

        return res.status(200).json({
            success: true,
            data: order,
            message: "Order placed successfully",
        });
    } catch (err) {
        console.error("Create Order Error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

exports.getOrders = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = "" } = req.query;
        const skip = (page - 1) * limit;

        let filter = {};
        if (search) {
            filter.orderStatus = { $regex: search, $options: "i" };
        }

        const orders = await Order.find(filter)
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
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (err) {
        console.error("Get Orders Error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
