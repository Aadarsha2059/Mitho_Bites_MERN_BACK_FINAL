const mongoose = require("mongoose")

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            trim: true,
            default: ""
        },
        filepath: { 
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true,
            min: 0
        },
        categoryId: {
            type: mongoose.Schema.ObjectId,
            ref: 'foodCategory',
            required: true
        },
        type: {
            type: String,
            required: true,
            enum: ['Indian', 'Nepali', 'indian', 'nepali']
        },
        restaurant: {
            type: String,
            required: true
        },
        sellerId: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: false
        },
        isAvailable: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
)

// Add text index for search functionality
productSchema.index({ name: 'text', description: 'text', restaurant: 'text' })

module.exports = mongoose.model('Product', productSchema)