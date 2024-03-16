const express = require("express");
const bcrypt = require("bcryptjs");
const jsonwebtoken = require("jsonwebtoken");
const cors = require("cors");

const app = express();
const server=require('http').createServer(app);
const io = require('socket.io')(server, {
  cors:{
    origin:"https://veiltalk.netlify.app/",
  }
})

//http://localhost:8000
//https://veiltalk.netlify.app

// Connect to the database
require("./connection");

// Import Files
const Users = require("./models/Users");
const Conversations = require("./models/Conversations");
const Messages = require("./models/Messages");

// Middlewares
// const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// Port
const port = process.env.PORT || 8000;

//Socket.io
let users = [];
io.on('connection', socket=>{
  console.log('user connected', socket.id);
  socket.on('addUser', userId=>{
    const isUserExist=users.find(user=>user.userId===userId);
    if(!isUserExist){
      const user={userId, socketId:socket.id};
    users.push(user);
    io.emit('getUsers', users);
    }
  });

  socket.on("sendMessage", async({senderId, receiverId, message, conversationId})=>{
    const receiver=users.find(user=>user.userId===receiverId);
    const sender=users.find(user=>user.userId===senderId);
    const user=await Users.findById(senderId);
    if(receiver){
      io.to(receiver.socketId).to(sender.socketId).emit('getMessage',{
        senderId,
        message,
        conversationId,
        receiverId,
        user:{id:user._id, email:user.email, name:user.name, age:user.age, gender:user.gender}
      });
    } else{
      io.to(sender.socketId).emit('getMessage',{
        senderId,
        message,
        conversationId,
        receiverId,
        user:{id:user._id, email:user.email, name:user.name, age:user.age, gender:user.gender}
      });
    }
  });


  socket.on("disconnect",()=>{
    users=users.filter(user=>user.socketId!==socket.id);
    io.emit("getUsers", users);
  })
  // io.emit('getUsers', socket.userId);
});

// Routes
app.get("/", (req, res) => {
  res.send("Hello World");
});

app.post("/api/register", async (req, res, next) => {
  try {
    const { name, age, gender, email, password } = req.body;

    if (!name || !age || !gender || !email || !password) {
      return res.status(400).send("Please fill all the fields");
    } else {
      const isAlreadyExist = await Users.findOne({ email });
      if (isAlreadyExist) {
        res.status(400).send("User already exist");
      } else {
        const newUser = new Users({ name, age, gender, email });
        bcrypt.hash(password, 10, (err, hashedPassword) => {
          newUser.set("password", hashedPassword);
          newUser.save();
          next();
        });
        res.status(200).send("User registered successfully");
      }
    }
  } catch (error) {
    console.log(error);
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send("Please fill all the fields");
    } else {
      const user = await Users.findOne({ email });
      if (!user) {
        return res.status(400).send("User not found");
      } else {
        const validateUser = await bcrypt.compare(password, user.password);
        if (!validateUser) {
          return res.status(400).send("Invalid password");
        } else {
          const payload = {
            userId: user._id,
            email: user.email,
          };
          const JWT_SECRET_KEY =
            process.env.JWT_SECRET_KEY || "THIS_IS_MY_SECRET_KEY";

          jsonwebtoken.sign(
            payload,
            JWT_SECRET_KEY,
            { expiresIn: 84600 },
            async (err, token) => {
              await Users.updateOne(
                { _id: user._id },
                {
                  $set: { token },
                }
              );
              user.save();
              res.status(200).json({
                data: {
                  user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    age: user.age,
                    gender: user.gender,
                  },
                  token: token,
                },
              });
            }
          );
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
});

app.post("/api/conversation", async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;
    const newConversation = new Conversations({
      members: [senderId, receiverId],
    });
    const savedConversation = await newConversation.save();
    const user = await Users.findById(receiverId);
    res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        age: user.age,
        gender: user.gender,
      },
      conversationId: savedConversation._id,
    });
  } catch (error) {
    console.log(error);
  }
});

app.get("/api/conversation/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const conversations = await Conversations.find({
      members: { $in: [userId] },
    });
    const conversationUserData = Promise.all(
      conversations.map(async (conversation) => {
        const receiverId = conversation.members.find(
          (member) => member !== userId
        );
        const user = await Users.findById(receiverId);
        return {
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            age: user.age,
            gender: user.gender,
          },
          conversationId: conversation._id,
        };
      })
    );
    res.status(200).json(await conversationUserData);
  } catch (error) {
    console.log(error);
  }
});

app.post("/api/message", async (req, res) => {
  try {
    const { conversationId, senderId, message } = req.body;
    const newMessage = new Messages({ conversationId, senderId, message });
    await newMessage.save();
    res.status(200).send("Message sent successfully");
  } catch (error) {
    console.log(error);
  }
});

app.get("/api/message/:conversationId", async (req, res) => {
  try {
    const conversationId = req.params.conversationId;
    const messages = await Messages.find({ conversationId });
    const messageUserData = Promise.all(
      messages.map(async (message) => {
        const user = await Users.findById(message.senderId);
        return {
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            age: user.age,
            gender: user.gender,
          },
          message: { message: message.message },
        };
      })
    );
    res.status(200).json(await messageUserData);
  } catch (error) {
    console.log(error);
  }
});

app.get("/api/users", async (req, res) => {
  try {
    const users = await Users.find();
    const userData = Promise.all(
      users.map(async (user) => {
        return {
          users: {
            email: user.email,
            name: user.name,
            age: user.age,
            gender: user.gender,
          },
          userId: user._id,
        };
      })
    );
    res.status(200).json(await userData);
  } catch (error) {
    console.log(error);
  }
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
