const Product = require("../../models/Product");

exports.createProduct = async (req, res) => {
    const { name, price, categoryId, type, restaurant, filepath, userId } = req.body;

    if (!name || !price || !categoryId || !type || !restaurant || !userId) {
        return res.status(403).json({
            success: false,
            message: "Missing required fields",
        });
    }

    try {
        const filename=req.file?.path
        const product = new Product({
            name,
            price,
            categoryId,
            type,
            restaurant,
            filepath, // optional
            sellerId: userId,
        });

        await product.save();

        return res.status(200).json({
            success: true,
            data: product,
            message: "Product saved",
        });
    } catch (err) {
        console.error("Create Product Error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error",
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
            .limit(Number(limit));

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
