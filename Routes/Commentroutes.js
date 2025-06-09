let express= require("express");
const Auth = require("../Middleware/Auth");
const Commentcontroller = require("../Controller/Comment.Controller");


let Commentroute=express.Router();


Commentroute.post("/commentcreate/:pid",Auth,Commentcontroller.create);
Commentroute.delete("/deletecomment/:userid/:cid",Auth,Commentcontroller.Delete);
Commentroute.patch("/updatecomment/:userid/:cid",Auth,Commentcontroller.Update);

Commentroute.get("/getallcomment/:pid",Auth,Commentcontroller.getallcommetonproduct);
Commentroute.patch("/like-comment/:userid/:cid",Auth,Commentcontroller.CommentLikeaction);




module.exports=Commentroute;