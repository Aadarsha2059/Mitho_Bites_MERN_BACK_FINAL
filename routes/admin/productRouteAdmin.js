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
router.get('/:id', productController.getOneProduct);
router.put('/:id', upload.single('image'), productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports=router