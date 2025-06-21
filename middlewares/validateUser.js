const validateUser = (req, res, next) => {
  const { fullname, username, email, password, confirmpassword, phone, address } = req.body;

  // Check required fields
  if (!fullname || !username || !email || !password || !confirmpassword || !phone || !address) {
    return res.status(400).json({ 
      success: false, 
      message: "All fields (fullname, username, email, password, confirmPassword, phone, address) are required." 
    });
  }

  // Validate fullname (example: min 3 characters)
  if (typeof fullname !== "string" || fullname.trim().length < 3) {
    return res.status(400).json({ 
      success: false, 
      message: "Full name must be at least 3 characters long." 
    });
  }

  // Validate username (example: min 3 characters)
  if (typeof username !== "string" || username.trim().length < 3) {
    return res.status(400).json({ 
      success: false, 
      message: "Username must be at least 3 characters long." 
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      success: false, 
      message: "Please provide a valid email address." 
    });
  }

  // Validate password length (example: min 6 characters)
  if (password.length < 6) {
    return res.status(400).json({ 
      success: false, 
      message: "Password must be at least 6 characters long." 
    });
  }

  // Confirm password check
  if (password !== confirmpassword) {
    return res.status(400).json({ 
      success: false, 
      message: "Password and Confirm Password do not match." 
    });
  }

  // Validate phone number (must be 10 digits)
  const phoneRegex = /^\d{10}$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({ 
      success: false, 
      message: "Phone number must be 10 digits." 
    });
  }

  // Validate address (non-empty string)
  if (typeof address !== "string" || address.trim().length === 0) {
    return res.status(400).json({ 
      success: false, 
      message: "Address must be provided." 
    });
  }

  // All validations passed
  next();
};

module.exports = validateUser;
