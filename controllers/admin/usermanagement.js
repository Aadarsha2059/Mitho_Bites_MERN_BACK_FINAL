const User = require("../../models/User");
const bcrypt = require("bcrypt");

// Create User
exports.createUser = async (req, res) => {
    const { fullname, username, password, confirmpassword, phone, address } = req.body;

    // Validation
    if (!fullname || !username || !password || !confirmpassword) {
        return res.status(400).json({
            success: false,
            message: "Missing required fields",
        });
    }

    if (password !== confirmpassword) {
        return res.status(400).json({
            success: false,
            message: "Passwords do not match",
        });
    }

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists",
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
            fullname,
            username,
            password: hashedPassword,
            phone,
            address,
        });

        await newUser.save();

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: newUser,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: err.message,
        });
    }
};

// Get All Users
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find();
        return res.status(200).json({
            success: true,
            message: "All users fetched successfully",
            data: users,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: err.message,
        });
    }
};

// Get One User
exports.getOneUser = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "User fetched successfully",
            data: user,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: err.message,
        });
    }
};

// Update One User
exports.updateOne = async (req, res) => {
    const { id } = req.params;
    const { fullname, username, password, confirmpassword, phone, address } = req.body;

    // Validate password confirmation
    if (password && password !== confirmpassword) {
        return res.status(400).json({
            success: false,
            message: "Passwords do not match",
        });
    }

    try {
        const updateData = {
            fullname,
            username,
            phone,
            address,
        };

        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const updatedUser = await User.findByIdAndUpdate(id, updateData, {
            new: true,
        });

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: updatedUser,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: err.message,
        });
    }
};

// Delete One User
exports.deleteOne = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "User deleted successfully",
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: err.message,
        });
    }
};
