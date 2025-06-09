const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    UserName: {
        type: String,
        required: true
    },
    Email: {
        type: String,
        required: true,
        unique: true
    },
    Password: {
        type: String,
        required: true
    },
    Phonenumber: {
        type: Number,
        required: true
    },
    Birthdate: {
        type: Date
    },
    Country: {
        type: String,
        required: true
    },
    Address: {
        street: { type: String, default: "" },
        city: { type: String, default: "" },
        state: { type: String, default: "" },
        postalCode: { type: String, default: "" },
        country: { type: String, default: "" }
    },
    role: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const UserModel = mongoose.model("user", UserSchema);
module.exports = UserModel;
