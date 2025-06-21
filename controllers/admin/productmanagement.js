const Product = require("../../models/Product");

exports.createProduct = async (req, res) => {
    console.log("Create Product Request Body:", req.body);
    console.log("Create Product File:", req.file);
    
    const { name, price, categoryId, type, restaurant } = req.body;

    if (!name || !price || !categoryId || !type || !restaurant) {
        console.log("Missing required fields:", { name, price, categoryId, type, restaurant });
        return res.status(400).json({
            success: false,
            message: "Missing required fields: name, price, categoryId, type, restaurant",
        });
    }

    if (!req.file) {
        console.log("No file uploaded");
        return res.status(400).json({
            success: false,
            message: "Product image is required",
        });
    }

    try {
        const filepath = req.file.filename; // Get the uploaded file name
        console.log("File path:", filepath);
        
        // Validate price
        const numericPrice = Number(price);
        if (isNaN(numericPrice) || numericPrice <= 0) {
            return res.status(400).json({
                success: false,
                message: "Price must be a positive number",
            });
        }

        // Normalize type to lowercase for consistency
        const normalizedType = type.toLowerCase();
        if (!['veg', 'non-veg', 'vegan'].includes(normalizedType)) {
            return res.status(400).json({
                success: false,
                message: "Type must be one of: veg, non-veg, vegan",
            });
        }

        console.log("Creating product with data:", {
            name: name.trim(),
            price: numericPrice,
            categoryId,
            type: normalizedType,
            restaurant: restaurant.trim(),
            filepath,
            description: `${name} - Delicious ${type} food from ${restaurant}`,
            isVegetarian: normalizedType === 'veg' || normalizedType === 'vegan',
        });

        const product = new Product({
            name: name.trim(),
            price: numericPrice,
            categoryId,
            type: normalizedType,
            restaurant: restaurant.trim(),
            filepath,
            description: `${name} - Delicious ${type} food from ${restaurant}`
        });

        console.log("Product object created, saving to database...");
        await product.save();
        console.log("Product saved successfully");

        // Populate category details for response
        await product.populate("categoryId", "name");
        console.log("Product populated with category");

        return res.status(201).json({
            success: true,
            data: product,
            message: "Product created successfully",
        });
    } catch (err) {
        console.error("Create Product Error:", err);
        console.error("Error stack:", err.stack);
        
        // Handle specific MongoDB errors
        if (err.name === 'ValidationError') {
            const errors = Object.values(err.errors).map(e => e.message);
            console.log("Validation errors:", errors);
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: errors
            });
        }
        
        if (err.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Product with this name already exists",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Server error",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

exports.getProducts = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = "" } = req.query;
        const skip = (page - 1) * limit;

        let filter = {};
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { type: { $regex: search, $options: 'i' } },
                { restaurant: { $regex: search, $options: 'i' } }
            ];
        }

        const products = await Product.find(filter)
            .populate("categoryId", "name")
            .populate("sellerId", "firstName email")
            .skip(skip)
            .limit(Number(limit))
            .sort({ createdAt: -1 });

        const total = await Product.countDocuments(filter);

        return res.status(200).json({
            success: true,
            message: "Products fetched",
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
