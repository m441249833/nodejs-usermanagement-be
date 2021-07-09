const express = require('express')
const app = express();
const userRouter = require('./routes/userRouter')
const authRouter = require('./routes/authRouter')
const mongoose = require('mongoose');
const cors = require('cors')
require('dotenv').config()

mongoose.connect(process.env.DB_URL,{useNewUrlParser: true,useUnifiedTopology: true,})
.then(()=>{
    console.log("database connected...")
    app.listen(8080,()=>{
        console.log("server started...")
    })
}).catch(err=>{
    console.log(err)
})

app.use(express.json())
app.use(cors())
app.use("/user",userRouter)
app.use(authRouter)


