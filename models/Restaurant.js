const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    contact: {
        type: String,
        required: true
    },
    filepath: {
        type: String 
    }
});

module.exports = mongoose.model('Restaurant', restaurantSchema);
