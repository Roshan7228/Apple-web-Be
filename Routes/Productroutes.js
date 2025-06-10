let express=require("express");
const Auth = require("../Middleware/Auth");
const isAdmin = require("../Middleware/Admin");
const Productcontroller = require("../Controller/Product.Controller");
const  upload  = require("../Config/Multer.Config");

let Productroute=express.Router();

Productroute.post("/create/:userid",Auth,isAdmin,upload.array("image",5),Productcontroller.create);
Productroute.patch("/update/:userid/:pid",Auth,isAdmin,upload.array('image',5),Productcontroller.Update);
Productroute.delete("/deleta/:userid/:pid",Auth,isAdmin,Productcontroller.Delete);
Productroute.get("/allproduct",Productcontroller.AllProductget);
Productroute.get("/description/:pid",Productcontroller.GetSingleProduct);

module.exports=Productroute