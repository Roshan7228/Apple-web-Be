const jwt = require('jsonwebtoken');
require("dotenv").config();

let Auth=(request,response,next)=>{
   
   try {
     let token=request.cookies.Access_Token;
    if(!token){
        return response.status(400).json({
            message:"Access Denied: No Token Provided"
        })
    }

    let decoded = jwt.verify(token, process.env.SigninPrivateKey);
       if(!decoded){
        return response.status(403).json({
            message:"Not Authorized"
        })
       }
       let {Userdata}=decoded;
      request.User=Userdata
      next();
    
   } catch (error) {
     return response.status(500).json({
        message:error.message
     })
   }
}

module.exports=Auth;