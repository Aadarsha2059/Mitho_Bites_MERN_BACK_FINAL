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

// Get One Payment Method
exports.getOnePaymentMethod = async (req, res) => {
    const { id } = req.params;

    try {
        const payment = await PaymentMethod.findById(id);
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Payment method not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Payment method fetched successfully",
            data: payment,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: err.message,
        });
    }
};

// Update Payment Method
exports.updatePaymentMethod = async (req, res) => {
    const { id } = req.params;
    const { food, quantity, totalprice, paymentmode } = req.body;

    try {
        const updateData = {
            food,
            quantity,
            totalprice,
            paymentmode,
        };

        const updatedPayment = await PaymentMethod.findByIdAndUpdate(id, updateData, {
            new: true,
        });

        if (!updatedPayment) {
            return res.status(404).json({
                success: false,
                message: "Payment method not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Payment method updated successfully",
            data: updatedPayment,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: err.message,
        });
    }
};

// Delete Payment Method
exports.deletePaymentMethod = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedPayment = await PaymentMethod.findByIdAndDelete(id);
        if (!deletedPayment) {
            return res.status(404).json({
                success: false,
                message: "Payment method not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Payment method deleted successfully",
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: err.message,
        });
    }
}; 