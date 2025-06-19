require("dotenv").config()
import { listen } from "./index"

const PORT= process.env.PORT
listen(
    PORT,
    () =>{
        console.log("Server running")
    }
)