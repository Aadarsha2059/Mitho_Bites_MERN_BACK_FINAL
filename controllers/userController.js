const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Register User
exports.registerUser = async (req, res) => {
  const { fullname, username, password, confirmpassword, phone, address } = req.body;

  // Only username and password are required
  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Username and password are required" });
  }

  if (confirmpassword && password !== confirmpassword) {
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
      fullname,
      username,
      password: hashedPassword,
      phone,
      address,
      confirmpassword, 
    });

    await newUser.save();

    return res.status(201).json({ success: true, data: newUser });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Login User (simple version)
exports.loginUser = async (req, res) => {
  const { username, password } = req.body;

  // Validation
  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Missing field" });
  }

  try {
    const getUsers = await User.findOne({ username: username });
    if (!getUsers) {
      return res.status(403).json({ success: false, message: "User not found" });
    }

    const passwordCHeck = await bcrypt.compare(password, getUsers.password);
    if (!passwordCHeck) {
      return res.status(403).json({ success: false, message: "Invalid credentials" });
    }

    const payload = {
      _id: getUsers._id,
      username: getUsers.username,
    };

    const token = jwt.sign(payload, process.env.SECRET, { expiresIn: "7d" });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: getUsers,
      token: token,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update User (no change needed unless you want to add fullname later)
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





// const transpoter= nodemailer.createTransport(
//     {
//         service:"gmail",
//         auth:{
//             user: process.env.EMAIL_USER,
//             pass:process.env.EMAIL_PASS
//         }
//     }
// )

// exports.sendResentLink=async (req, res) =>{
//     const {email}= req.body
//     try{
//         const user= await User.findOne({email})
//         if(!user) return res.status(404).json({success: false, message:"User not found"})
//             const token= jwt.sign({id: user._id}, process.env.SECRET, {expiresIn: "20m"})
//             const resetUrl=process.env.CLIENT_URL +"/reset-password/"+token
//             const mailOptions={
//                 from: `"Your app"<${process.env.EMAIL_USER}`, //backtick
//                 to:email,
//                 subject:"Reset your password",
//                 html:`<p>CLick on the link to reset...${resetUrl}</p>`
//             }
//             transpoter.sendMail(mailOptions,(err,info)=>{
//                 if(err) return res.status(403).json({success:false,message:"email failed"})
//                     console.log(info)
//                 return res.status(200).json({success:true, message:"email failed"})
//             })



//     }catch(err){
//         console.log(err)
//         return res.status(500).json({success:false,message:"Server err"})
//     }
// }

// exports.resetPassword= async (req,res) =>{
//     const {token}=req.params;
//     const{password}=req.body
//     try{
//         const decoded= jwt.verify(token, process.env.SECRET)
//         const hashed= await bcrypt.hash(password, 10)
//         await User.findByIdAndUpdate(decoded.id,{password:hashed})
//         return res.status(200).json({success:true, message:"Password updated"})

//     }catch (err){
//         return res.status(500).json({success:false,message:"server err/invalid token"})

//     }
// }