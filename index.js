let express=require("express");
const connection = require("./Config/db");
const Userroutes = require("./Routes/userroutes");
require("dotenv").config();
const cookieParser = require('cookie-parser');
const Productroute = require("./Routes/Productroutes");
const Commentroute = require("./Routes/Commentroutes");
const OrderRoutes = require("./Routes/Orderroutes");
const cors=require("cors");



let app=express();
app.set("view engine","ejs");

app.use(express.json());
app.use(cookieParser())
app.use(cors({
    origin:["http://localhost:5173","http://localhost:5174"],
    credentials:true
}))
app.use(express.static("./UploadImage"));

app.use("/api/users",Userroutes);
app.use("/api/product",Productroute);
app.use("/api/comment",Commentroute);
app.use("/api/order",OrderRoutes);


app.get("/",(req,res)=>{
    res.send("<h1>Api is Working......</h1>")
})
app.listen(process.env.PORT,async()=>{
    try {
          await connection;
          console.log(`Server Running On Port ${process.env.PORT}`);
         
    } catch (error) {
         console.log(error);
    }
})