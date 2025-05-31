const mongoose=require("mongoose")

const productSchema=new mongoose.Schema(
    {
        name:{
            type:String,
            required:true
        },
        filepath:{type:String},
        price:{
            type:Number,
            required:true
        },
        categoryId:{
            type:mongoose.Schema.ObjectId,
            ref:'foodCategory',
            required:true
        },
        type:{
            type:String,
            required:true
        },
        restaurant:{
            type:String,
            required:true
        },
        sellerId:{
            type:mongoose.Schema.ObjectId,
            ref:'User',
            required:true
        }

    }
)
module.exports=mongoose.model(
    'Product',productSchema
)