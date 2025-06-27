const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { transformProductData } = require("../utils/imageUtils");

// Test endpoint to verify authentication
exports.testAuth = async (req, res) => {
    try {
        console.log('Test auth - User:', req.user);
        return res.status(200).json({
            success: true,
            message: "Authentication working",
            user: req.user
        });
    } catch (err) {
        console.error("Test Auth Error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// Get user's cart
exports.getCart = async (req, res) => {
    try {
        const userId = req.user._id;

        let cart = await Cart.findOne({ userId })
            .populate({
                path: 'items.productId',
                select: 'name price filepath isAvailable type',
                populate: [
                    { path: 'categoryId', select: 'name' },
                    { path: 'restaurantId', select: 'name location' }
                ]
            });

        if (!cart) {
            cart = new Cart({ userId, items: [] });
            await cart.save();
        }

        // Transform cart data with full image URLs
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const transformedCart = cart.toObject();
        
        // Transform product images in cart items
        if (transformedCart.items && Array.isArray(transformedCart.items)) {
            transformedCart.items = transformedCart.items.map(item => {
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

        return res.status(200).json({
            success: true,
            message: "Cart fetched successfully",
            data: transformedCart
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

        console.log('Add to cart request:', { userId, productId, quantity });

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required"
            });
        }

        // Check if product exists and is available
        const product = await Product.findById(productId);
        if (!product) {
            console.log('Product not found:', productId);
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        if (!product.isAvailable) {
            console.log('Product not available:', productId);
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
            console.log('Updated existing item quantity');
        } else {
            // Add new item
            cart.items.push({
                productId,
                quantity,
                price: product.price
            });
            console.log('Added new item to cart');
        }

        await cart.save();
        console.log('Cart saved successfully');

        // Populate product details
        await cart.populate({
            path: 'items.productId',
            select: 'name price filepath isAvailable type',
            populate: [
                { path: 'categoryId', select: 'name' },
                { path: 'restaurantId', select: 'name location' }
            ]
        });

        console.log('Cart populated successfully');

        // Transform cart data with full image URLs
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const transformedCart = cart.toObject();
        
        // Transform product images in cart items
        if (transformedCart.items && Array.isArray(transformedCart.items)) {
            transformedCart.items = transformedCart.items.map(item => {
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

        console.log('Cart transformation completed');

        return res.status(200).json({
            success: true,
            message: "Item added to cart successfully",
            data: transformedCart
        });
    } catch (err) {
        console.error("Add to Cart Error:", err);
        console.error("Error stack:", err.stack);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
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
            select: 'name price filepath isAvailable type',
            populate: [
                { path: 'categoryId', select: 'name' },
                { path: 'restaurantId', select: 'name location' }
            ]
        });

        // Transform cart data with full image URLs
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const transformedCart = cart.toObject();
        
        // Transform product images in cart items
        if (transformedCart.items && Array.isArray(transformedCart.items)) {
            transformedCart.items = transformedCart.items.map(item => {
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

        return res.status(200).json({
            success: true,
            message: "Cart updated successfully",
            data: transformedCart
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
            select: 'name price filepath isAvailable type',
            populate: [
                { path: 'categoryId', select: 'name' },
                { path: 'restaurantId', select: 'name location' }
            ]
        });

        // Transform cart data with full image URLs
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const transformedCart = cart.toObject();
        
        // Transform product images in cart items
        if (transformedCart.items && Array.isArray(transformedCart.items)) {
            transformedCart.items = transformedCart.items.map(item => {
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

        return res.status(200).json({
            success: true,
            message: "Item removed from cart successfully",
            data: transformedCart
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

exports.getUserCart = async (req, res) => {
    try {
        const userId = req.user._id;
        
        const cartItems = await Cart.find({ userId })
            .populate({
                path: "productId",
                populate: [
                    { path: "categoryId", select: "name filepath" },
                    { path: "restaurantId", select: "name location contact filepath" }
                ]
            });

        // Transform cart items with full image URLs
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const transformedCartItems = cartItems.map(item => {
            const transformedItem = item.toObject();
            if (transformedItem.productId) {
                transformedItem.product = transformProductData(transformedItem.productId, baseUrl);
            }
            return {
                _id: transformedItem._id,
                userId: transformedItem.userId,
                productId: transformedItem.productId?._id,
                product: transformedItem.product,
                quantity: transformedItem.quantity,
                price: transformedItem.price,
                createdAt: transformedItem.createdAt,
                updatedAt: transformedItem.updatedAt
            };
        });

        return res.status(200).json({
            success: true,
            message: "Cart items fetched successfully",
            data: transformedCartItems
        });
    } catch (err) {
        console.error("Get User Cart Error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}; 