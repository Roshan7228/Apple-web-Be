const mongoose = require("mongoose");
const { array } = require("../Config/Multer.Config");

const ProductSchema = new mongoose.Schema({
    Userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ["iPhone", "Mac", "iPad", "Watch", "Vision", "AirPods", "Accessories"],
        required: true
    },
    model: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    Price: {
        type: Number,
        required: true
    },
    image: {
        type: Array,
        required: true
    },
    Camera: {
        type: String,
    },
    FrontCamera:{
        type:String
    },
    space: {
        display: {
            type: String,
            required: true
        },
        Processor: {
            type: String,
            required: true
        },
        storage: {
            type: String,
            required: true
        },
        bettery: {
            type: String,
            required: true
        },
        sortdescription:{
            type:String
        },
        otherfeature: {
            type: Array,
            default: []
        }
    },
    releasedate: {
        type: Date,
        required: true
    },
    inStock: {
        type: Boolean,
        default: true
    },
    color: {
        type: Array,
        required: true,
    }
}, {
    timestamps: true
});

let ProductModel = mongoose.model("Product", ProductSchema);
module.exports = ProductModel;
