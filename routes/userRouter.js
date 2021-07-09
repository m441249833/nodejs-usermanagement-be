const express = require('express')
const router = express.Router()
const userModel = require('../models/userModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config()


router.get('/all',userAuth,async (req,res)=>{
    try{
        const users = await userModel.find()
        res.json(users);
    }catch (err){
        res.status(500).json({message:err.message}) 
    }
})

router.get("/currentUser",userAuth,async (req,res)=>{
    const username = req.user.username
    const currentUser = await userModel.findOne({username:username}).select("-password");
    if (currentUser) {
        res.json(currentUser)
    }
})

router.get("/:id", userAuth,async (req,res)=>{
    try{
        const user = await userModel.findById(req.params.id);
        if (user === null) 
        res.json(user);
    }catch (err){
        res.json({message:err.message})
    }
})

router.post("/",async (req,res)=>{
    const exist = await userModel.findOne({username:req.body.username})
    if (exist != null) {
        res.json({message:"username already exist."});
        return;
    }
    try{
        req.body.password = await bcrypt.hash(req.body.password,10)
        const user = new userModel(req.body)
        const newUser = await user.save()
        res.json(newUser);
    }catch(err){
        res.json({message:err.message});
    }
})

router.patch("/:id",userAuth, async (req,res)=>{

    try{
        const user = await userModel.findById(req.params.id);
        console.log(user)
        if (user !== null) {
            if (req.body.email != null){
                user.email = req.body.email;
            }
            //TODO more update fields
            const updatedUser = await user.save()
            res.json(updatedUser)
        }else{
            res.status(404).json({message:"user not found"})
        }
    }catch(err){
        res.status(500).json({message:err.message});
    }
})

router.delete("/:id",userAuth ,async (req,res)=>{
    try{
        const user = await userModel.findById(req.params.id);
        if (user !== null) {
            await user.remove()
            res.json({message:`user ${user.username} has been removed.`})
        }else{
            res.status(404).json({message:"user not found"})
        }
    }catch(err){
        res.status(500).json({message:err.message});
    }
})

router.post("/validateToken",(req,res)=>{
    const accessToken = req.headers.authorization;
    const token = accessToken && accessToken.split(" ")[1];
    if (token == null) return res.status(403).json({message:"access denied."})
    jwt.verify(token,process.env.JWT_SECRET,(err,user)=>{
        if (err) {
            return res.status(403).json({message:"Token invalid"})
        }
        return res.json(user)
    })

})

function userAuth(req,res,next){
    const headerToken = req.headers.authorization;
    if (headerToken) {
        const token = headerToken.split(" ")[1];
        if (token){
            jwt.verify(token,process.env.JWT_SECRET,(err,data)=>{
                if (err) res.status(403).json({message:err.message})
                req.user = data
                next()
            })
        }
    }else{
        res.json({message:"Authentication failed."})
    }
}


module.exports = router;