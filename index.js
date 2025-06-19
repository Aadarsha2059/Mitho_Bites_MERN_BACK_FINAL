require("dotenv").config()

const express=require("express")
const connectDB=require("./config/db")
const userRoutes=require("./routes/userRoutes")
const adminUserRoutes=require("./routes/admin/userRouteAdmin")

const productRouteAdmin=require("./routes/admin/productRouteAdmin")
const restaurantRouteAdmin=require("./routes/admin/restaurantRouteAdmin")
const orderRouteAdmin=require("./routes/admin/orderRouteAdmin")


const adminCategoryRoutes = require("./routes/admin/foodcategoryRouteAdmin")

const path=require("path") 
const cors = require("cors")

const app=express() 
app.use(cors())
app.use(express.json()) //accept join in request
app.use("/uploads",express.static(path.join(__dirname,"uploads")))

//2 new implementations
connectDB()
app.use("/api/auth",userRoutes)
app.use("/api/admin/users",adminUserRoutes)
app.use("/api/admin/product", productRouteAdmin)
app.use("/api/admin/category", adminCategoryRoutes)
app.use("/api/admin/restaurant", restaurantRouteAdmin)
app.use("/api/admin/order", orderRouteAdmin)




app.get(
    "/", //root targeted
    (req,res,next ) =>{
        //req -> request -> response //next ->arko function..
        return res.status(200).send("Hello world") //return to client.

    }

)

app.get(
    "/post/:postid", //if second path is dynamic 
    (req,res) =>{
        //get dynamic id with request
        let postid=req.params.postid // this is postid
        console.log(postid)
        let name= req.query.name //?name="abc"
        let age=req.query.age //age=28
        console.log(name,age)

        return res.status(200).send("success")
    }
)

const users=[
    {id:1,name:"aadarsha",email:"aadarsha@gmail.com"},
    {id:2,name:"bishbu",email:"bishnu@gmail.com"},
]

app.get(
    "/users/:userid",
    (req,res) => {
        let userid=req.params.userid // this is postid
        let found
        for(user of users){
            if(user.id==userId){
                found=user
                break
            }
        }
        if(!found){
            return res.status(400).send("Failure")
        }
        let name =req.query.name
        if(name &&  name ==found.name){
            return res.status(400).send("success")

        }else{
            return res.status(400).send("server error")
        }

      

    }
)

app.get(
    "/users/:userid/:name",
    (req,res) =>{
        //find if  userid and name is found in users.
        let userid=parseInt(req.params.userid);
        let name=req.params.name;

        //find if any user matches both id and name
        const userFound= users.find(user=>user.id ===userid && user.name===name);
        if(userFound){
            return res.status(200).send("success");
        }else{
            return res.status(404).send("User not found");
        }

    }
)
//CRUD application
//5 common api
let blogs=[
    {id:1, name:"Saugat",title:"Holiday",desc:"Lorem ipsum"},
    {id:2, name:"Arya",title:"Holiday",desc:"Lorem ipsum"},
    {id:3, name:"Chirayu",title:"Holiday",desc:"Lorem ipsum"}
]
//GET all
app.get(
    "/blogs/", //root of schema/table
    (req,res) =>{
        //fetch data from database
        return res.status(200).json(
            {
                "success":true,
                "blogs":blogs,
                "message":"Data fetched"

            }
        )
    }
)
//get one
app.get(
    "/blogs/:blogId", // schema with one blog identifier
    (req,res) =>{
        let blogId =req.params.blogId
        //query to find one blog with id
        let found
        for(blog of blogs){
            if(blog.id==blogId){
                found =blog
                 break
            }
        }
        if(found){
            return res.status(200).json(
                {
                    "success":true,
                    "blog":found,
                    "message":"One blog found"
                }
            )
        }else{
            return res.status(404).json(
                {
                    "success":false,
                    "message":"Blog not found"
                }
            )
        }
    }
)
// add
app.post(
    "/blogs/", // can be same route with difference in type
    (req,res) => {
        //client send data in json format
        console.log("Client send",req.body)
        //{id:1,name:"sangit",title:"asdf",desc:123}
        //const id =req.body.id
        const{id,name,title,desc}=req.body

        //validation
        if(!id || !name|| !title || !desc){
            return res.status(400).json(
                {
                    "success":false,
                    "message":"Not enough data"
                }
            )
        }
        blogs.push(
            {
                id, //id:id
                name, //name:name
                title, //title:title
                desc // desc:desc
            }
        )
        return res.status(200).json(
            {
                "success":true,
                "message":"data  added"
            }
        )

    }
)

//update
//put/patch
app.put(
    "/blogs/:blogId",
    (req,res) =>{
        let blogId=req.params.blogId
        let foundIdx
        for(blogIdx in blogs){
            if(blogs[blogIdx].id==blogId){
                foundIdx=blogIdx
                break
            }
        }
        const{name,title,desc}=req.body
        blogs[foundIdx].name=name
        blogs[foundIdx].title=title
        blogs[foundIdx].desc=desc
        return res.status(200).json(
            {
                "success":true,"message":"data updated"
            }
        )
    }
)
//delete 
app.delete(
    "/blogs/:blogId",
    (req,res) =>{
        let blogId= req.params.blogId
        blogs= blogs.filter((blog) => blog.id !=blogId)
        //removes blog containing blogid
        return res.status(200).json(
            {
                "success":true, "message":"Data deleted"
            }
        )
    }
)

module.exports=app



