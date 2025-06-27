require("dotenv").config()

const express=require("express")
const connectDB=require("./config/db")
const userRoutes=require("./routes/userRoutes")
const adminUserRoutes=require("./routes/admin/userRouteAdmin")

const productRouteAdmin=require("./routes/admin/productRouteAdmin")
const restaurantRouteAdmin=require("./routes/admin/restaurantRouteAdmin")
const orderRouteAdmin=require("./routes/admin/orderRouteAdmin")

const paymentmethodRouteAdmin = require("./routes/admin/paymentmethodRouteAdmin")

const adminCategoryRoutes = require("./routes/admin/foodcategoryRouteAdmin")

// New user-facing routes
const foodRoutes = require("./routes/foodRoutes")
const cartRoutes = require("./routes/cartRoutes")
const orderRoutes = require("./routes/orderRoutes")

// Import models for public endpoints
const Category = require("./models/foodCategory")
const Restaurant = require("./models/Restaurant")
const Product = require("./models/Product")

// Import utility functions
const { transformProductData, transformCategoryData, transformRestaurantData } = require("./utils/imageUtils")

const path=require("path") 
const cors = require("cors")
const feedbackRoutes = require('./routes/feedbackRoutes')

const app=express() 
app.use(cors())
app.use(express.json()) //accept join in request
app.use("/uploads",express.static(path.join(__dirname,"uploads")))

//2 new implementations
connectDB()

// Auth routes
app.use("/api/auth",userRoutes)

// Admin routes
app.use("/api/admin/users",adminUserRoutes)
app.use("/api/admin/product", productRouteAdmin)
app.use("/api/admin/category", adminCategoryRoutes)
app.use("/api/admin/restaurant", restaurantRouteAdmin)
app.use("/api/admin/order", orderRouteAdmin)
app.use("/api/admin/paymentmethod", paymentmethodRouteAdmin)

// User-facing routes
app.use("/api/food", foodRoutes)
app.use("/api/cart", cartRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/feedbacks", feedbackRoutes)

// Public endpoints for Flutter app
app.get("/api/categories", async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        
        // Transform categories with full image URLs
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const transformedCategories = categories.map(category => transformCategoryData(category, baseUrl));
        
        return res.status(200).json({
            success: true,
            message: "Categories fetched successfully",
            data: transformedCategories
        });
    } catch (err) {
        console.error("Get Categories Error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

app.get("/api/categories/:id", async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        // Transform category with full image URL
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const transformedCategory = transformCategoryData(category, baseUrl);

        return res.status(200).json({
            success: true,
            message: "Category fetched successfully",
            data: transformedCategory
        });
    } catch (err) {
        console.error("Get Category Error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

app.get("/api/restaurants", async (req, res) => {
    try {
        const restaurants = await Restaurant.find().sort({ name: 1 });
        
        // Transform restaurants with full image URLs
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const transformedRestaurants = restaurants.map(restaurant => transformRestaurantData(restaurant, baseUrl));
        
        return res.status(200).json({
            success: true,
            message: "Restaurants fetched successfully",
            data: transformedRestaurants
        });
    } catch (err) {
        console.error("Get Restaurants Error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

app.get("/api/restaurants/:id", async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found"
            });
        }

        // Transform restaurant with full image URL
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const transformedRestaurant = transformRestaurantData(restaurant, baseUrl);

        return res.status(200).json({
            success: true,
            message: "Restaurant fetched successfully",
            data: transformedRestaurant
        });
    } catch (err) {
        console.error("Get Restaurant Error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

app.get("/api/products", async (req, res) => {
    try {
        const { category } = req.query;
        let filter = {};
        if (category) {
            filter.categoryId = category;
        }
        
        let products = await Product.find(filter)
            .populate("restaurantId", "name filepath location contact")
            .populate("categoryId", "name filepath");
        
        // Transform products with full image URLs using utility function
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const transformedProducts = products.map(product => transformProductData(product, baseUrl));
        
        return res.status(200).json({
            success: true,
            message: "Products fetched successfully",
            data: transformedProducts
        });
    } catch (err) {
        console.error("Get Products Error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

app.get("/api/products/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate("restaurantId", "name filepath location contact")
            .populate("categoryId", "name filepath");

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Transform product with full image URLs
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const transformedProduct = transformProductData(product, baseUrl);

        return res.status(200).json({
            success: true,
            message: "Product fetched successfully",
            data: transformedProduct
        });
    } catch (err) {
        console.error("Get Product Error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

app.get(
    "/", //root targeted
    (req,res,next ) =>{
        //req -> request -> response //next ->arko function..
        return res.status(200).send("Hello world") //return to client.

    }

)

// Health check endpoint for debugging
app.get(
    "/api/health",
    (req,res) =>{
        return res.status(200).json({
            success: true,
            message: "MERN Backend is running",
            timestamp: new Date().toISOString()
        })
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

const cartRouteAdmin = require("./routes/admin/cartRouteAdmin");
const feedbackRouteAdmin = require("./routes/admin/feedbackRouteAdmin");

app.use("/api/admin/cart", cartRouteAdmin);
app.use("/api/admin/feedback", feedbackRouteAdmin);

module.exports=app



