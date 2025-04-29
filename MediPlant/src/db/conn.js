const mongoose=require("mongoose");
require("dotenv").config();


mongoose.connect(process.env.MONGO_URI,{
}).then(() =>{
    console.log("connection successful");
}).catch((e)=>{
    console.log("No connection");
})


