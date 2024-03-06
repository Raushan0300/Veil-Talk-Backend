const express = require("express");
const { pool } = require("../config/config");
const router = express.Router();

router.post("/", async (req, res) => {
  const { email, pass } = req.body;
  try {
    const connection = await pool.getConnection();

    const [existingUser] = await connection.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    if (existingUser.length > 0) {
      const [loginUser] = await connection.query(
        "SELECT * FROM users WHERE email = ? AND pass = ?",
        [email, pass]
      );
      if (loginUser.length>0) {
        res.json({ success: true, message: "Password Matched", data:loginUser[0] });
      } else{
        res.json({success: false, message:"Incorrect Password", data:loginUser});
      }
    } else{
        await connection.query("INSERT INTO users (email, pass) VALUES (?, ?)", [email, pass]);
        res.json({success:true, message:"User Registered Successfully", data:{reg:true}});
    }
    connection.release();
  } catch (error) {
    console.error("Error while login", error);
  }
});

module.exports=router