import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    userID : {
        type: String,
        required: true,
        unique: true
    },
    userName : {
        type: String,
        required: true,
    },
    userMobile : {
        type: Number,
        required: true,
        unqiue: true
    },
    userEmail: {
        type: String,
        unqiue: true
    }
},{timestamps: true});

const User = mongoose.model('User', userSchema);

export default User;