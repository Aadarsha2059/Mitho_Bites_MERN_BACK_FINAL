const express=require("express")
const router=express.Router()
const productController=require("../../controllers/admin/productmanagement")
const upload=require("../../middlewares/fileupload")

router.post(
    '/',
    upload.single("image"),
    productController.createProduct
);
router.get(
    "/",
    productController.getProducts
)
module.exports=router