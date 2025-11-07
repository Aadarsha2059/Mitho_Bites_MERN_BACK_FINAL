const Cart = require("../../models/Cart");

// Create Cart Item
exports.createCart = async (req, res) => {
    const { userId, productId, quantity, price } = req.body;

    if (!userId || !productId || !quantity || !price) {
        return res.status(403).json({
            success: false,
            message: "Missing required fields",
        });
    }

    try {
        // Check if cart exists for user
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({
                userId,
                items: [{ productId, quantity, price }],
            });
        } else {
            cart.items.push({ productId, quantity, price });
        }
        await cart.save();
        // Return the last added item for test compatibility
        const item = cart.items[cart.items.length - 1];
        return res.status(200).json({
            success: true,
            data: {
                _id: item._id,
                userId: cart.userId,
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
            },
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

// Get All Cart Items
exports.getCarts = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = "" } = req.query;
        const skip = (page - 1) * limit;
        let filter = {};
        let searchFilter = {};
        // Find all cart items (flattened)
        const carts = await Cart.find(filter)
            .populate("items.productId", "name price")
            .populate("userId", "username email");
        // Flatten all items
        let allItems = [];
        carts.forEach(cart => {
            cart.items.forEach(item => {
                allItems.push({
                    _id: item._id,
                    userId: cart.userId,
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.price,
                });
            });
        });
        // Apply search filter if needed
        if (search) {
            allItems = allItems.filter(item => {
                const productName = item.productId?.name || "";
                const userName = item.userId?.username || "";
                const userEmail = item.userId?.email || "";
                return (
                    productName.match(new RegExp(search, "i")) ||
                    userName.match(new RegExp(search, "i")) ||
                    userEmail.match(new RegExp(search, "i"))
                );
            });
        }
        const total = allItems.length;
        const paginated = allItems.slice(skip, skip + Number(limit));
        return res.status(200).json({
            success: true,
            message: "Cart items fetched successfully",
            data: paginated,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / limit),
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

// Get One Cart Item
exports.getOneCart = async (req, res) => {
    const { id } = req.params;
    try {
        // Find the cart item by item _id
        const cart = await Cart.findOne({ "items._id": id })
            .populate("items.productId", "name price")
            .populate("userId", "username email");
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart item not found",
            });
        }
        const item = cart.items.id(id);
        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Cart item not found",
            });
        }
        return res.status(200).json({
            success: true,
            message: "Cart item fetched successfully",
            data: {
                _id: item._id,
                userId: cart.userId,
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
            },
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: err.message,
        });
    }
};

// Update Cart Item
exports.updateCart = async (req, res) => {
    const { id } = req.params;
    const { quantity, price } = req.body;
    try {
        // Find the cart containing the item
        const cart = await Cart.findOne({ "items._id": id });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart item not found",
            });
        }
        const item = cart.items.id(id);
        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Cart item not found",
            });
        }
        if (quantity !== undefined) item.quantity = quantity;
        if (price !== undefined) item.price = price;
        await cart.save();
        return res.status(200).json({
            success: true,
            message: "Cart item updated successfully",
            data: {
                _id: item._id,
                userId: cart.userId,
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
            },
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: err.message,
        });
    }
};

// Delete Cart Item
exports.deleteCart = async (req, res) => {
    const { id } = req.params;
    try {
        const cart = await Cart.findOne({ "items._id": id });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart item not found",
            });
        }
        const item = cart.items.id(id);
        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Cart item not found",
            });
        }
        item.remove();
        await cart.save();
        return res.status(200).json({
            success: true,
            message: "Cart item deleted successfully",
        });
    } catch (err) {
        console.error("Delete Cart Error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: err.message,
        });
    }
}; 