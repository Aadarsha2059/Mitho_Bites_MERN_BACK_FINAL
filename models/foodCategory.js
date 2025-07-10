const mongoose=require("mongoose")

const CategorySchema= new mongoose.Schema({
    name:{type:String, required:true,unique:true},
    filepath:{type:String}
},{ timestamps: true });

module.exports =mongoose.model('foodCategory',CategorySchema);