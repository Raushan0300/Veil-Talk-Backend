const express = require("express");
const cors = require("cors");

const app = express();
const port = 8000;

app.use(cors());
app.use(express.json());

const userRoute = require("./routers/Users");
const loginRoute=require("./routers/Login");
const registrationRoute=require("./routers/Registration");

app.use("/api/register", userRoute);
app.use("/api/login", loginRoute);
app.use("/api/registration", registrationRoute);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
