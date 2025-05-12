const creatUser = (req,res) =>{
    res.send("user create");
}

const getUser=(req,res)=>{
    res.send("Get user")
}
module.exports={
    creatUser,
    getUser
}