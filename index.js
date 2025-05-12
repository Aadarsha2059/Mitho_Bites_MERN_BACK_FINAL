//importing express
const express =require("express");
const dotenv=require("dotenv");

const connectDB=require("../Backend/database/db")
const userRoutes = require("../Backend/route/userRoute")

//instance of express applications
const app=express();
dotenv.config();
app.use(express.json())


//Define the port and listen to the app.
const PORT=8080;
app.listen(8080, () => 
    console.log(`Server running on ${PORT}`)
);
app.get('/',(req,res)=>
    res.send('Server running on the file')

)


app.use("/api/user/", userRoutes)
connectDB();