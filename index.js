const express = require("express");
const cors = require("cors");

const app = express();
const port = 8000;

app.use(cors());
app.use(express.json());

const userRoute = require("./routers/Users");

app.use("/api/register", userRoute);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
