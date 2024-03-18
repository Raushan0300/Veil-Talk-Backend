const mongoose = require("mongoose");

const url = `mongodb+srv://veiltalk_admin:Raushan2504@cluster0.2o5teen.mongodb.net/veiltalk?retryWrites=true&w=majority&appName=Cluster0`;

mongoose
  .connect(url)
  .then(() => {
    console.log("Database connected");
  })
  .catch((err) => {
    console.log(err);
  });
