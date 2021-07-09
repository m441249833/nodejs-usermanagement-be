const express = require('express')
const router = express.Router()
const userModel = require('../models/userModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config()


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

module.exports = router