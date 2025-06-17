const Restaurant = require("../../models/Restaurant");

exports.createRestaurant = async (req, res) => {
    const { name, location, contact, } = req.body;
    const filename = req.file?.path
    if (!name || !location || !contact) {
        return res.status(403).json({
            success: false,
            message: "Missing required fields",
        });
    }

    try {
        const filepath = req.file?.path || null;

        const restaurant = new Restaurant({
            name,
            location,
            contact,
            filepath: filename,
        });

        await restaurant.save();

        return res.status(200).json({
            success: true,
            data: restaurant,
            message: "Restaurant created successfully",
        });
    } catch (err) {
        console.error("Create Restaurant Error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

exports.getRestaurants = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = "" } = req.query;
        const skip = (page - 1) * limit;

        let filter = {};
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { location: { $regex: search, $options: 'i' } },
                { contact: { $regex: search, $options: 'i' } },
            ];
        }

        const restaurants = await Restaurant.find(filter)
            .skip(skip)
            .limit(Number(limit));

        const total = await Restaurant.countDocuments(filter);

        return res.status(200).json({
            success: true,
            message: "Restaurants fetched successfully",
            data: restaurants,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (err) {
        console.error("Get Restaurants Error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
