const mysql = require("mysql2/promise");

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

module.exports = { pool };
