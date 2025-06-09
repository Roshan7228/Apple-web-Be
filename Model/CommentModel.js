let mongoose=require("mongoose");

let CommentSchema=new mongoose.Schema({
    userid:{
        type:String,
        required:true
    },
    Productid:{
        type:String,
        required:true
    },
    Comment:{
        type:String
    },
    CommentDetails:{
        type:Array,
        default:[]
    },
    Commentlike:{
        type:Number,
        default:0
    }
},{
    timestamps:true
})

let Commentmodel=mongoose.model("Comment",CommentSchema);

module.exports=Commentmodel
