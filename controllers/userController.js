import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import validator from "validator";

//login user
const loginUser = async(req,res)=>{
    const {email,password} =req.body;
    try{
        const user = await userModel.findOne({email});
        if(!user){
            res.json({success:false,message:"User does not exists"});
        }

        const isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch){
            res.json({success:false,message:"Invalid credentials"})
        }
        const token = createToken(user._id);
        res.json({success:true,token});
    }catch(err){
        res.json({success:false,message:"Error"});
    }
}

const createToken = (id)=>{
    return jwt.sign({id},process.env.JWT_SECRET)
}

//register user
const registeruser = async(req,res)=>{
    const {name,email,password} = req.body;
    try{
        //checking user exists or not
        const exits = await userModel.findOne({email});
        if(exits){
            return res.json({success:false,message:"User already exists"});
        }

        //validating email format and strong password
        if(!validator.isEmail(email)){
            return res.json({success:false,message:"Please enter valid email"});
        }
        if(password.length <8){
            return res.json({success:false,message:"Please enter strong password"});
        }

        //hashing user password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        const newUser = new userModel({
            name:name,
            email:email,
            password:hashedPassword
        });

        const user = await newUser.save();
        const token = createToken(user._id);
        res.json({success:true,token});
    }
    catch(err){
        console.log(err);
        res.json({success:false,message:"Error"});
    }
}

export {loginUser,registeruser};