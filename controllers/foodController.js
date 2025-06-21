const Product = require("../models/Product");
const Category = require("../models/foodCategory");
const User = require("../models/User");

// Get all products with filtering, sorting, and pagination
exports.getAllProducts = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 12,
            search = "",
            category = "",
            sortBy = "name",
            sortOrder = "asc",
            minPrice = "",
            maxPrice = "",
            isVegetarian = "",
            isSpicy = "",
            isAvailable = ""
        } = req.query;

        const skip = (page - 1) * limit;
        let filter = {};

        // Search filter
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { restaurant: { $regex: search, $options: 'i' } }
            ];
        }

        // Category filter
        if (category) {
            filter.categoryId = category;
        }

        // Price range filter
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        // Boolean filters
        if (isVegetarian !== "") filter.isVegetarian = isVegetarian === "true";
        if (isSpicy !== "") filter.isSpicy = isSpicy === "true";
        if (isAvailable !== "") filter.isAvailable = isAvailable === "true";

        // Sort options
        let sortOptions = {};
        switch (sortBy) {
            case "price":
                sortOptions.price = sortOrder === "desc" ? -1 : 1;
                break;
            case "rating":
                sortOptions.rating = sortOrder === "desc" ? -1 : 1;
                break;
            case "createdAt":
                sortOptions.createdAt = sortOrder === "desc" ? -1 : 1;
                break;
            case "name":
            default:
                sortOptions.name = sortOrder === "desc" ? -1 : 1;
                break;
        }

        const products = await Product.find(filter)
            .populate("categoryId", "name")
            .populate("restaurantId", "name location contact")
            .populate("sellerId", "firstName lastName email")
            .sort(sortOptions)
            .skip(skip)
            .limit(Number(limit));

        const total = await Product.countDocuments(filter);

        return res.status(200).json({
            success: true,
            message: "Products fetched successfully",
            data: products,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        console.error("Get Products Error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// Get single product by ID
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate("categoryId", "name")
            .populate("restaurantId", "name location contact")
            .populate("sellerId", "firstName lastName email");

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Product fetched successfully",
            data: product
        });
    } catch (err) {
        console.error("Get Product Error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// Get all categories
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });

        return res.status(200).json({
            success: true,
            message: "Categories fetched successfully",
            data: categories
        });
    } catch (err) {
        console.error("Get Categories Error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// Get single category by ID
exports.getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Category fetched successfully",
            data: category
        });
    } catch (err) {
        console.error("Get Category Error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// Add product review (protected route)
exports.addProductReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const productId = req.params.id;
        const userId = req.user._id;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: "Rating must be between 1 and 5"
            });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Update product rating and review count
        const newReviewCount = product.reviewCount + 1;
        const newRating = ((product.rating * product.reviewCount) + rating) / newReviewCount;

        await Product.findByIdAndUpdate(productId, {
            rating: newRating,
            reviewCount: newReviewCount
        });

        return res.status(200).json({
            success: true,
            message: "Review added successfully"
        });
    } catch (err) {
        console.error("Add Review Error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// Toggle favorite (protected route)
exports.toggleFavorite = async (req, res) => {
    try {
        const productId = req.params.id;
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Initialize favorites array if it doesn't exist
        if (!user.favorites) {
            user.favorites = [];
        }

        const isFavorite = user.favorites.includes(productId);

        if (isFavorite) {
            // Remove from favorites
            user.favorites = user.favorites.filter(id => id.toString() !== productId);
        } else {
            // Add to favorites
            user.favorites.push(productId);
        }

        await user.save();

        return res.status(200).json({
            success: true,
            message: isFavorite ? "Removed from favorites" : "Added to favorites",
            isFavorite: !isFavorite
        });
    } catch (err) {
        console.error("Toggle Favorite Error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// Get user favorites (protected route)
exports.getUserFavorites = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId).populate({
            path: 'favorites',
            populate: {
                path: 'categoryId',
                select: 'name'
            }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Favorites fetched successfully",
            data: user.favorites || []
        });
    } catch (err) {
        console.error("Get Favorites Error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}; 