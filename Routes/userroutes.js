let express=require("express");
const UserController = require("../Controller/User.Controller");
const Auth = require("../Middleware/Auth");
const isAdmin = require("../Middleware/Admin");

let Userroutes=express.Router();



Userroutes.post("/signup",UserController.Signup);
Userroutes.post("/verify",UserController.Verify);
Userroutes.post("/signin",UserController.Signin);
Userroutes.post("/emailverify",UserController.ForgetPasswordEmailVerify);
Userroutes.post("/otpverify",UserController.VerifyOTP);
Userroutes.post("/passwordreset",UserController.ResetPassword);
Userroutes.patch("/updateuserinfo/:id",Auth,UserController.UpdateUserinfo);
Userroutes.get("/userinfo/:id",UserController.Userinfo);
Userroutes.get("/logout",UserController.Logout);
Userroutes.get("/alluser",Auth,isAdmin,UserController.Getalluserinfo);


module.exports=Userroutes;