const Feedback = require('../models/Feedback');

// POST /api/feedbacks
exports.createFeedback = async (req, res) => {
  try {
    const { order, product, rating, text } = req.body;
    const user = req.user._id; // assuming auth middleware sets req.user
    const feedback = new Feedback({ user, order, product, rating, text });
    await feedback.save();
    res.status(201).json({ success: true, feedback });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// GET /api/feedbacks/product/:productId
exports.getFeedbacksByProduct = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ product: req.params.productId }).populate('user', 'username');
    res.json({ success: true, feedbacks });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// GET /api/feedbacks/user
exports.getUserFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ user: req.user._id });
    res.json({ success: true, feedbacks });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}; 