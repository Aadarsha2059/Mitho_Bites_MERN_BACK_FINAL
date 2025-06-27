const Feedback = require("../../models/Feedback");

exports.createFeedback = async (req, res) => {
    const { userId, productId, rating, comment } = req.body;

    if (!userId || !productId || !rating || !comment) {
        return res.status(403).json({
            success: false,
            message: "Missing required fields",
        });
    }

    try {
        const feedback = new Feedback({
            userId,
            productId,
            rating,
            comment,
        });

        await feedback.save();

        return res.status(200).json({
            success: true,
            data: feedback,
            message: "Feedback submitted successfully",
        });
    } catch (err) {
        console.error("Create Feedback Error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

exports.getFeedbacks = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = "" } = req.query;
        const skip = (page - 1) * limit;

        let filter = {};
        let searchFilter = {};

        if (search) {
            // Search in populated fields and comment field
            searchFilter = {
                $or: [
                    { "userId.username": { $regex: search, $options: "i" } },
                    { "userId.email": { $regex: search, $options: "i" } },
                    { "productId.name": { $regex: search, $options: "i" } },
                    { comment: { $regex: search, $options: "i" } }
                ]
            };
        }

        const feedbacks = await Feedback.find(filter)
            .populate("userId", "username email")
            .populate("productId", "name price")
            .skip(skip)
            .limit(Number(limit));

        // Apply search filter after population
        let filteredFeedbacks = feedbacks;
        if (search && searchFilter.$or) {
            filteredFeedbacks = feedbacks.filter(feedback => {
                return searchFilter.$or.some(condition => {
                    const field = Object.keys(condition)[0];
                    const value = condition[field];
                    
                    if (field === 'comment') {
                        return feedback.comment && feedback.comment.match(new RegExp(value.$regex, value.$options));
                    }
                    
                    const feedbackValue = field.split('.').reduce((obj, key) => obj?.[key], feedback);
                    return feedbackValue && feedbackValue.match(new RegExp(value.$regex, value.$options));
                });
            });
        }

        const total = await Feedback.countDocuments(filter);

        return res.status(200).json({
            success: true,
            message: "Feedbacks fetched successfully",
            data: filteredFeedbacks,
            pagination: {
                total: search ? filteredFeedbacks.length : total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil((search ? filteredFeedbacks.length : total) / limit),
            },
        });
    } catch (err) {
        console.error("Get Feedbacks Error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

// Get One Feedback
exports.getOneFeedback = async (req, res) => {
    const { id } = req.params;

    try {
        const feedback = await Feedback.findById(id)
            .populate("userId", "username email")
            .populate("productId", "name price");
        if (!feedback) {
            return res.status(404).json({
                success: false,
                message: "Feedback not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Feedback fetched successfully",
            data: feedback,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: err.message,
        });
    }
};

// Update Feedback
exports.updateFeedback = async (req, res) => {
    const { id } = req.params;
    const { rating, comment } = req.body;

    try {
        const updateData = {
            rating,
            comment,
        };

        const updatedFeedback = await Feedback.findByIdAndUpdate(id, updateData, {
            new: true,
        }).populate("userId", "username email")
          .populate("productId", "name price");

        if (!updatedFeedback) {
            return res.status(404).json({
                success: false,
                message: "Feedback not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Feedback updated successfully",
            data: updatedFeedback,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: err.message,
        });
    }
};

// Delete Feedback
exports.deleteFeedback = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedFeedback = await Feedback.findByIdAndDelete(id);
        if (!deletedFeedback) {
            return res.status(404).json({
                success: false,
                message: "Feedback not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Feedback deleted successfully",
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: err.message,
        });
    }
}; 