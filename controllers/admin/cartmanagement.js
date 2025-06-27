const Cart = require("../../models/Cart");

exports.createCart = async (req, res) => {
    const { userId, productId, quantity, price } = req.body;

    if (!userId || !productId || !quantity || !price) {
        return res.status(403).json({
            success: false,
            message: "Missing required fields",
        });
    }

    try {
        const cart = new Cart({
            userId,
            productId,
            quantity,
            price,
        });

        await cart.save();

        return res.status(200).json({
            success: true,
            data: cart,
            message: "Cart item added successfully",
        });
    } catch (err) {
        console.error("Create Cart Error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

exports.getCarts = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = "" } = req.query;
        const skip = (page - 1) * limit;

        let filter = {};
        let searchFilter = {};

        if (search) {
            // Search in populated fields using aggregation
            searchFilter = {
                $or: [
                    { "userId.username": { $regex: search, $options: "i" } },
                    { "userId.email": { $regex: search, $options: "i" } },
                    { "productId.name": { $regex: search, $options: "i" } }
                ]
            };
        }

        const carts = await Cart.find(filter)
            .populate("userId", "username email")
            .populate("productId", "name price")
            .skip(skip)
            .limit(Number(limit));

        // Apply search filter after population
        let filteredCarts = carts;
        if (search && searchFilter.$or) {
            filteredCarts = carts.filter(cart => {
                return searchFilter.$or.some(condition => {
                    const field = Object.keys(condition)[0];
                    const value = condition[field];
                    const cartValue = field.split('.').reduce((obj, key) => obj?.[key], cart);
                    return cartValue && cartValue.match(new RegExp(value.$regex, value.$options));
                });
            });
        }

        const total = await Cart.countDocuments(filter);

        return res.status(200).json({
            success: true,
            message: "Cart items fetched successfully",
            data: filteredCarts,
            pagination: {
                total: search ? filteredCarts.length : total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil((search ? filteredCarts.length : total) / limit),
            },
        });
    } catch (err) {
        console.error("Get Carts Error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

// Get One Cart
exports.getOneCart = async (req, res) => {
    const { id } = req.params;

    try {
        const cart = await Cart.findById(id)
            .populate("userId", "username email")
            .populate("productId", "name price");
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart item not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Cart item fetched successfully",
            data: cart,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: err.message,
        });
    }
};

// Update Cart
exports.updateCart = async (req, res) => {
    const { id } = req.params;
    const { quantity, price } = req.body;

    try {
        const updateData = {
            quantity,
            price,
        };

        const updatedCart = await Cart.findByIdAndUpdate(id, updateData, {
            new: true,
        }).populate("userId", "username email")
          .populate("productId", "name price");

        if (!updatedCart) {
            return res.status(404).json({
                success: false,
                message: "Cart item not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Cart item updated successfully",
            data: updatedCart,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: err.message,
        });
    }
};

// Delete Cart
exports.deleteCart = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedCart = await Cart.findByIdAndDelete(id);
        if (!deletedCart) {
            return res.status(404).json({
                success: false,
                message: "Cart item not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Cart item deleted successfully",
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: err.message,
        });
    }
}; 