import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    admin: {
        type: Boolean,
        default: false
    }
})


const User = new mongoose.model("User", userSchema);
export default User;