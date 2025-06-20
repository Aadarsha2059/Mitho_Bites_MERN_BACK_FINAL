const PaymentMethod = require("../../models/paymentmethod");

exports.createPaymentMethod = async (req, res) => {
    const { food, quantity, totalprice, paymentmode } = req.body;

    if (!food || !quantity || !totalprice || !paymentmode) {
        return res.status(403).json({
            success: false,
            message: "Missing required fields",
        });
    }

    try {
        const payment = new PaymentMethod({
            food,
            quantity,
            totalprice,
            paymentmode,
        });

        await payment.save();

        return res.status(200).json({
            success: true,
            data: payment,
            message: "Payment method created successfully",
        });
    } catch (err) {
        console.error("Create PaymentMethod Error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

exports.getPaymentMethods = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = "" } = req.query;
        const skip = (page - 1) * limit;

        let filter = {};
        if (search) {
            filter.food = { $regex: search, $options: "i" };
        }

        const payments = await PaymentMethod.find(filter)
            .skip(skip)
            .limit(Number(limit));

        const total = await PaymentMethod.countDocuments(filter);

        return res.status(200).json({
            success: true,
            message: "Payment methods fetched successfully",
            data: payments,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (err) {
        console.error("Get PaymentMethods Error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
}; 