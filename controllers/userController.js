const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// Register User
exports.registerUser = async (req, res) => {
  const { fullname, username, email, password, confirmpassword, phone, address } = req.body;

  // Only username, email and password are required
  if (!username || !email || !password) {
    return res.status(400).json({ success: false, message: "Username, email and password are required" });
  }

  if (confirmpassword && password !== confirmpassword) {
    return res.status(400).json({ success: false, message: "Passwords do not match" });
  }

  try {
    // Check for existing user by username
    const existingUserByUsername = await User.findOne({ username });
    if (existingUserByUsername) {
      return res.status(400).json({ success: false, message: "Username already exists" });
    }

    // Check for existing user by email
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      fullname,
      username,
      email,
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
      user: getUsers,
      token: token,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update User (no change needed unless you want to add fullname later)
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, email, password, phone, address } = req.body;

  try {
    const updateData = { username, phone, address };

    // Handle email update with validation
    if (email) {
      // Check if email already exists for another user
      const existingUserByEmail = await User.findOne({ email, _id: { $ne: id } });
      if (existingUserByEmail) {
        return res.status(400).json({ success: false, message: "Email already exists" });
      }
      updateData.email = email;
    }

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

// Forgot Password - Send Reset Link
exports.sendResetLink = async (req, res) => {
  const { email } = req.body;
  
  try {
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.status(200).json({ 
        success: true, 
        message: "If an account with this email exists, you will receive a password reset link." 
      });
    }

    // Create reset token
    const token = jwt.sign({ id: user._id }, process.env.SECRET, { expiresIn: "20m" });
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${token}`;

    // For testing purposes, log the reset URL instead of sending email
    console.log('Password reset URL:', resetUrl);
    console.log('Reset token:', token);

    // TODO: Uncomment this section when email is properly configured
    /*
    // Configure email transporter
    const transporter = nodemailer.createTransporter({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: `"Mitho Bites" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset Your Password - Mitho Bites",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ff6600;">Mitho Bites - Password Reset</h2>
          <p>Hello ${user.fullname},</p>
          <p>You requested a password reset for your Mitho Bites account.</p>
          <p>Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: linear-gradient(135deg, #ff6600, #ff9900); 
                      color: white; 
                      padding: 12px 30px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p>This link will expire in 20 minutes.</p>
          <p>If you didn't request this password reset, please ignore this email.</p>
          <p>Best regards,<br>Mitho Bites Team</p>
        </div>
      `
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('Email error:', err);
        return res.status(500).json({ 
          success: false, 
          message: "Failed to send reset email. Please try again." 
        });
      }
      console.log('Email sent:', info.response);
      return res.status(200).json({ 
        success: true, 
        message: "If an account with this email exists, you will receive a password reset link." 
      });
    });
    */

    // For now, return success with the reset URL in the response (for testing)
    return res.status(200).json({ 
      success: true, 
      message: "Password reset link generated successfully. Check console for the reset URL.",
      resetUrl: resetUrl // Remove this in production
    });

  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ 
      success: false, 
      message: "Server error. Please try again." 
    });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ 
      success: false, 
      message: "Password is required" 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET);
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await User.findByIdAndUpdate(decoded.id, { password: hashedPassword });
    
    return res.status(200).json({ 
      success: true, 
      message: "Password updated successfully" 
    });

  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(400).json({ 
      success: false, 
      message: "Invalid or expired token" 
    });
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