import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const placeOrder = async(req,res)=>{
    const frontendUrl = 'https://hangerhop-frontend.onrender.com';
    try{
        const newOrder = new orderModel({
              userId:req.userId,
              items:req.body.items,
              amount:req.body.amount,
              address:req.body.address,
        })
        await newOrder.save();
        await userModel.findByIdAndUpdate(req.userId,{cartData:{}});

        const line_items = req.body.items.map((item)=>({
            price_data:{
                currency:'aud',
                product_data:{
                    name:item.name
                },
                unit_amount:item.price*100
            },
            quantity:item.quantity
        }))
        line_items.push({
            price_data:{
                currency:'aud',
                product_data:{
                    name:"Delivery Charges"
                },
                unit_amount:2*100
            },
            quantity:1
        })

        const session = await stripe.checkout.sessions.create({
            line_items:line_items,
            mode:'payment',
            success_url:`${frontendUrl}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url:`${frontendUrl}/verify?success=false&orderId=${newOrder._id}`,
        })

        res.json({success:true,session_url:session.url})
    }catch(err){
        console.log(err);
        res.json({success:false,message:"Error"});
    }
}

const verifyOrder = async(req,res)=>{
    const {orderId,success} = req.body;
    try{
        if(success=='true'){
            await orderModel.findByIdAndUpdate(orderId,{payment:true});
            res.json({success:true,message:"Paid"});
        }else{
            await orderModel.findByIdAndDelete(orderId);
            res.json({success:false,message:"Not Paid"});
        }
    }catch(err){
        console.log(err);
        res.json({success:false,message:"Error"});
    }
}

const userOrders = async(req,res)=>{
    try{
        const orders = await orderModel.find({userId:req.userId});
        res.json({success:true,data:orders});
    }catch(err){
        console.log("ERROR");
        res.json({success:false,message:'Error'});
    }
}

const listOrders = async(req,res)=>{
    try{
        const orders = await orderModel.find();
        res.json({success:true,data:orders});
    }catch(err){
        console.log("Error");
        res.json({success:false,message:"Error"});
    }
}

const updateOrderStatus = async(req,res)=>{
    try{
        await orderModel.findByIdAndUpdate(req.body.orderId,{status:req.body.status});
        res.json({success:true,message:"Status Updated"});
    }catch(err){
        res.json({success:false,message:"Error"});
    }
}

export {placeOrder,verifyOrder,userOrders,listOrders,updateOrderStatus};
