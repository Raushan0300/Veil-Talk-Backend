const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2/promise");
const cors = require("cors");

const app = express();
// const port = 8000;

// const pool = mysql.createPool({
//   host: "localhost",
//   user: "root",
//   password: "R@ushan2504",
//   database: "vieltalk",
// });

const pool = mysql.createPool({
  host: "mysql-17717cd0-veiltalk.a.aivencloud.com",
  user: "avnadmin",
  password: "AVNS_qV5WU1yoI_3VPhVKAwu",
  database: "defaultdb",
  port:28143,
});

app.use(cors());
app.use(bodyParser.json());

app.post("/api/register", async (req, res) => {
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
      await connection.query(
        "INSERT INTO users (email, pass) VALUES (?,?)",
        [email, pass]
      );
      res.json({ message: "Account created successfully." });
    }
    connection.release();
  } catch (error) {
    console.error("Error during registration: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(() => {
  console.log(`Server is running on port ${port}`);
});
