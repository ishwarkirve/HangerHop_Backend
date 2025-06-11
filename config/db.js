import mongoose from "mongoose";

export const connectDb = async()=>{
    await mongoose.connect("mongodb+srv://ishwarkirve3:7038791246@cluster0.yqcbopp.mongodb.net/hangergop").then(()=>{
        console.log("Database connected");
    })
}