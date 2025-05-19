const validateUser = (req, res, next) => {
  const { username, password, confirmPassword, phone, address } = req.body;

  // Check required fields
  if (!username || !password || !confirmPassword || !phone || !address) {
    return res.status(400).json({ 
      success: false, 
      message: "All fields (username, password, confirmPassword, phone, address) are required." 
    });
  }

  // Validate username (example: min 3 chars)
  if (typeof username !== "string" || username.trim().length < 3) {
    return res.status(400).json({ 
      success: false, 
      message: "Username must be at least 3 characters long." 
    });
  }

  // Validate password length (example: min 6 chars)
  if (password.length < 6) {
    return res.status(400).json({ 
      success: false, 
      message: "Password must be at least 6 characters long." 
    });
  }

  // Confirm password check
  if (password !== confirmPassword) {
    return res.status(400).json({ 
      success: false, 
      message: "Password and Confirm Password do not match." 
    });
  }

  // Validate phone number (basic example: must be digits and length 10)
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
