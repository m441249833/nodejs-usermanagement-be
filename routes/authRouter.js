const express = require('express')
const router = express.Router()
const userModel = require('../models/userModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config()

//login auth
router.post('/login',async (req,res)=>{
    const userAuth = {
        username: req.body.username,
        password: req.body.password
    }
    try{
        const user = await userModel.findOne({username:userAuth.username})
        if (user != null){
            const valid = await bcrypt.compare(userAuth.password, user.password);
            if (valid){
                const accessToken = jwt.sign({username:user.username},process.env.JWT_SECRET,{expiresIn: process.env.JWT_EXPIRE});
                res.json({message:"login successd.",TOKEN:"Bearer "+accessToken, ROLE:user.role.id})
            }else{
                res.status(400).json({message:"username/password not match."})
            }
        }else {
            res.status(400).json({message:"username not found"})
        }
    }catch (err){
        res.status(500).json({message:err.message})
    }
})
// user register
router.post("/signup",async (req,res)=>{
    const exist = await userModel.findOne({username:req.body.username})
    if (exist != null) {
        res.status(400).json({message:"username already exist."});
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

module.exports = router