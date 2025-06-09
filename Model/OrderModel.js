let mongoose = require("mongoose");

let OrderSchema = new mongoose.Schema({
    userid: {
        type: String,
        required: true
    },
    Products: [
        {
            productId: {
                type: String,
                required: true
            },
            name: {
                type: String,
                required: true
            },
            productimage: {
                type: String
            },
            model: {
                type: String,
                required: true
            },
            category: {
                type: String,
                enum: ["iPhone", "Mac", "iPad", "Watch", "Vision", "AirPods","Accessories"]
            },
            quantity: {
                type: Number,
                default: 1
            },
            selectedColor: {
                type: String,
                required:false
            },
            selectedStorage: {
                type: String,
                default: null
            },
            selectedPrice: {
                type: Number,
                required: true
            },
            isCancelled: {
                type: Boolean,
                default: false
            }
            ,
            cancelledAt: {
                type: Date
            },
            cancelRequest: {
                isRequested: {
                    type: Boolean,
                    default: false
                },
                reason: {
                    type: String,
                    default: ""
                },
                requestedAt: {
                    type: Date
                }
            }
        }
    ],
    Totalamount: {
        type: Number,
        required: true
    },
    orderStatus: {
        type: String,
        enum: ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"],
        default: "Pending"
    },
    paymentStatus: {
        type: String,
        enum: ["Pending", "Paid", "Failed"],
        default: "Pending"
    },
    paymentMethod: {
        type: String,
        enum: ["UPI", "Credit Card", "Debit Card", "Net Banking", "Cash on Delivery"],
        default: "Cash on Delivery"
    },
    ShippingAddress: {
        fullName: {
            type: String,
            required: false
        },
        phone: {
            type: String,
            required: false
        },
        street: {
            type: String,
            required: false
        },
        city: {
            type: String,
            required: false
        },
        state: {
            type: String,
            required: false
        },
        postalCode: {
            type: String,
            required: false
        },
        country: {
            type: String,
            default: "India"
        }
    },
    razorpayOrderId: {
        type: String
    }
}, {
    timestamps: true
});

let Ordermodel = mongoose.model("Order", OrderSchema);
module.exports = Ordermodel;
