require("dotenv").config();
let jwt = require('jsonwebtoken');

let createOTPandTOken=(Userdata,PrivateKey,ExprieTime)=>{
    let OTP=Math.floor(100000+Math.random()*900000);
    
    let token = jwt.sign({Userdata,OTP}, PrivateKey, { expiresIn: ExprieTime });
    console.log(token);
    return {OTP,token};
}


module.exports=createOTPandTOken;