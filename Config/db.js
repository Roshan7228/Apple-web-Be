let mongoose=require("mongoose");
require("dotenv").config();
let connection=mongoose.connect(process.env.BASE_URL);

module.exports=connection;