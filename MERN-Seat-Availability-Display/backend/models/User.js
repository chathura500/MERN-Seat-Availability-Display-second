const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: String,
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: String,  // Optional for Google OAuth users
    role: {
        type: String,
        default: 'user'
    },
    googleId: {
        type: String,
        unique: true,  // Unique ID for Google OAuth users
        sparse: true   // Allows null values for non-Google users
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const UserModel = mongoose.model("users", UserSchema);
module.exports = UserModel;
