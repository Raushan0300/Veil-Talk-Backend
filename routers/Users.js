const express = require("express");
const { pool } = require("../config/config");
const router = express.Router();

router.post("/", async (req, res) => {
  const { email, pass } = req.body;

  try {
    const connection = await pool.getConnection();

    const [existingUser] = await connection.query(
      "SELECT * FROM users WHERE email=?",
      [email]
    );

    if (existingUser.length > 0) {
      res.json({ success: true, message: "Email already registered." });
    } else {
      await connection.query("INSERT INTO users (email, pass) VALUES (?,?)", [
        email,
        pass,
      ]);
      res.json({ message: "Account created successfully." });
    }
    connection.release();
  } catch (error) {
    console.error("Error during registration: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
