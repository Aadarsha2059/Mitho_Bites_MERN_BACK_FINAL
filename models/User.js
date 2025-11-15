const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
     fullname: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    favorites: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }],
    googleId: {
      type: String,
      default: null
    },
    facebookId: {
      type: String,
      default: null
    },
    provider: {
      type: String,
      enum: ['local', 'google', 'facebook'],
      default: 'local'
    },
    // 2FA OTP fields
    otp: {
      type: String,
      default: null
    },
    otpExpiry: {
      type: Date,
      default: null
    },
    otpVerified: {
      type: Boolean,
      default: false
    },
    // confirmpassword:{
    //     type:String,
    //     required:true,
    // }
    // role:{
    //   type:String,
    //   default:"normal"
    // }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", UserSchema);