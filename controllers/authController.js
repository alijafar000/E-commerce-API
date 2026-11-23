import User from "../models/User.js";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export const registerUser = async (req, res)=>{
    try {
        const {name, email, password} = req.body;
        if(!name || !email || !password){
            return res.status(400).json({
                message: "All fields are required",
                success: false
            })
        }

        const existingUser = await User.findOne({email})
        if(existingUser){
            return res.status(409).json({
                message: "User already exists.",
                success: false
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await User.create({
            name,
            email,
            password: hashedPassword
        })
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user:{
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        })
    } catch (error) {
        console.error("Register error", error)
        res.status(500).json({
            message: "Server error",
            success: false
        })
    }
}

export const loginUser = async (req, res)=>{
    try {
        const {email, password} = req.body;
        if(!email || !password){
            return res.status(400).json({
                message: "Email and password are required.",
                success: false
            })
        }
        const user = await User.findOne({email})
        if(!user){
            return res.status(401).json({
                message: "Invalid email or password.",
                success: false
            })
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password)
        if(!isPasswordCorrect){
            return res.status(401).json({
                message: "Invalid email or password",
                success: false
            })
        }

        const token = jwt.sign({userId: user._id, role: user.role}, process.env.JWT_SECRET, {expiresIn: "1d"})

        res.status(200).json({
            success: true,
            message: "Login successfull",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        })


    } catch (error) {
        console.log("Login error", error)
        res.status(500).json({
            message: "Server error"
        })
    }
}

export const getMe = async (req, res)=>{
    try {
        const user = await User.findById(req.user.userId).select("-password")

        if(!user){
            return res.status(404).json({
                message: "User not found",
                success: false
            })
        }

        res.status(200).json({
            user,
            success: true
        })
    } catch (error) {
        console.log("Get user error:", error)
        res.status(500).json({
            message: "Server error",
            success: false
        })
    }
}