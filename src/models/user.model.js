import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: [true, "username already taken"],
        required: true
    },
    email: {
        type: String,
        unique: [true, "Account already exsists with this email"],
        required: true
    },
    password: {
        type: String,
        required: true  
    },
    age:{
        type: Number,
        default: null
    }
    })

const userModel = mongoose.model("users", userSchema)
export default userModel