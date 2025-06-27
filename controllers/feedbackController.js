const Feedback = require('../models/Feedback');

// POST /api/feedbacks
exports.createFeedback = async (req, res) => {
  try {
    const { product, rating, text } = req.body;
    
    // Validate required fields
    if (!product || !rating || !text) {
      return res.status(400).json({ 
        success: false, 
        message: 'Product, rating, and comment are required' 
      });
    }
    
    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        success: false, 
        message: 'Rating must be between 1 and 5' 
      });
    }
    
    const userId = req.user._id; // assuming auth middleware sets req.user
    
    const feedback = new Feedback({ 
      userId, 
      productId: product, 
      rating, 
      comment: text 
    });
    
    await feedback.save();
    res.status(201).json({ success: true, feedback });
  } catch (err) {
    console.error('Feedback creation error:', err);
    res.status(400).json({ success: false, message: err.message });
  }
};

// GET /api/feedbacks/product/:productId
exports.getFeedbacksByProduct = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ productId: req.params.productId }).populate('userId', 'username');
    res.json({ success: true, feedbacks });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// GET /api/feedbacks/user
exports.getUserFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ userId: req.user._id });
    res.json({ success: true, feedbacks });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}; 