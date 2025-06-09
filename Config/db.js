let mongoose=require("mongoose");
require("dotenv").config();

let connection=mongoose.connect(process.env.Base_URL);


module.exports=connection;