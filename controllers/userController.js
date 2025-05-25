const User = require("../models/User");
const bcrypt = require("bcrypt");

// Register User
exports.registerUser = async (req, res) => {
  const { username, password, confirmpassword, phone, address } = req.body;

  // Basic validation
  if (!username || !password || !confirmpassword) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  if (password !== confirmpassword) {
    return res.status(400).json({ success: false, message: "Passwords do not match" });
  }

  try {
    // Check for existing user
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      username,
      password: hashedPassword,
      phone,
      address,
    });

    await newUser.save();

    return res.status(201).json({ success: true, message: "User registered successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Login User
exports.loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid username or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid username or password" });
    }

    return res.json({ success: true, message: "Login successful" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update User
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, password, phone, address } = req.body;

  try {
    const updateData = { username, phone, address };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({ success: true, message: "User updated", user: updatedUser });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};





exports.loginUser=async(req, res) =>{
    const {username,password}=req.body
    //validation
    if(!username || !password){
        return res.status(400).json(
            {"success":false,"message":"Missing field"}
        )
    }
    try{
        const getUsers =await User.findOne(
            {username:username}
        )
        if(!getUsers){
            return res.status(403).json(
                {"success":false,"message":"User not found"}
            )
        }
        const passwordCHeck= await bcrypt.compare(password,getUsers.password) //pass,hash password
        if(!passwordCHeck){
            return res.status(403).json(
                {"success":false,"message":"Invalid credentials"}
            )
        }


        //
        const payload={
            "_id":getUsers._id,
           
            "username":getUsers.username
        }
        const token=jwt.sign(payload, process.env.SECRET,
            {expiresIn:"7d"}
        )
        return res.status(200).json(
            {
                "success":true,
                "message":"Login successful",
                "data":getUsers,
                "token":token // return toke in login...
            }
        )
    }catch (err){
        return res.status(500).json(
            {"success":false,"message":"Server error"}
        )
    }
}