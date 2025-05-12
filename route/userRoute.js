const express=require("express")
const router = express.Router();

const {creatUser}=require("../controller/userController")
router.post("/create",creatUser)

module.exports=router;