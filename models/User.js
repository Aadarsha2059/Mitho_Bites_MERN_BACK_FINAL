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