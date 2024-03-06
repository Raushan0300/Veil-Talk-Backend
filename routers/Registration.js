const express=require("express");
const { pool } = require("../config/config");
const router=express.Router();

router.patch("/", async(req, res)=>{
    const {email, name, age, gender}=req.body;
    try{
        const connection=await pool.getConnection();
        await connection.query("UPDATE users SET name=?, age=?, gender=? WHERE email=?", [name, age, gender, email]);
        res.json({success:true, message: "User Registered Successfully"});
        connection.release();
    } catch(error){
        console.log("error: ", error);
    }
})

module.exports=router;