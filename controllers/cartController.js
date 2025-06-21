const Cart = require("../models/Cart");
const Product = require("../models/Product");

// Get user's cart
exports.getCart = async (req, res) => {
    try {
        const userId = req.user._id;

        let cart = await Cart.findOne({ userId })
            .populate({
                path: 'items.productId',
                select: 'name price filepath isAvailable'
            });

        if (!cart) {
            cart = new Cart({ userId, items: [] });
            await cart.save();
        }

        return res.status(200).json({
            success: true,
            message: "Cart fetched successfully",
            data: cart
        });
    } catch (err) {
        console.error("Get Cart Error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// Add item to cart
exports.addToCart = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId, quantity = 1 } = req.body;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required"
            });
        }

        // Check if product exists and is available
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        if (!product.isAvailable) {
            return res.status(400).json({
                success: false,
                message: "Product is not available"
            });
        }

        let cart = await Cart.findOne({ userId });

        if (!cart) {
            cart = new Cart({ userId, items: [] });
        }

        // Check if product already exists in cart
        const existingItemIndex = cart.items.findIndex(
            item => item.productId.toString() === productId
        );

        if (existingItemIndex > -1) {
            // Update quantity
            cart.items[existingItemIndex].quantity += quantity;
        } else {
            // Add new item
            cart.items.push({
                productId,
                quantity,
                price: product.price
            });
        }

        await cart.save();

        // Populate product details
        await cart.populate({
            path: 'items.productId',
            select: 'name price filepath isAvailable'
        });

        return res.status(200).json({
            success: true,
            message: "Item added to cart successfully",
            data: cart
        });
    } catch (err) {
        console.error("Add to Cart Error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId, quantity } = req.body;

        if (!productId || quantity === undefined) {
            return res.status(400).json({
                success: false,
                message: "Product ID and quantity are required"
            });
        }

        if (quantity < 1) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be at least 1"
            });
        }

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        const itemIndex = cart.items.findIndex(
            item => item.productId.toString() === productId
        );

        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Item not found in cart"
            });
        }

        cart.items[itemIndex].quantity = quantity;
        await cart.save();

        await cart.populate({
            path: 'items.productId',
            select: 'name price filepath isAvailable'
        });

        return res.status(200).json({
            success: true,
            message: "Cart updated successfully",
            data: cart
        });
    } catch (err) {
        console.error("Update Cart Error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId } = req.params;

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        cart.items = cart.items.filter(
            item => item.productId.toString() !== productId
        );

        await cart.save();

        await cart.populate({
            path: 'items.productId',
            select: 'name price filepath isAvailable'
        });

        return res.status(200).json({
            success: true,
            message: "Item removed from cart successfully",
            data: cart
        });
    } catch (err) {
        console.error("Remove from Cart Error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// Clear cart
exports.clearCart = async (req, res) => {
    try {
        const userId = req.user._id;

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        cart.items = [];
        await cart.save();

        return res.status(200).json({
            success: true,
            message: "Cart cleared successfully",
            data: cart
        });
    } catch (err) {
        console.error("Clear Cart Error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}; 