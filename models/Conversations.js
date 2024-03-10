const mongoose = require("mongoose");

const conversationSchema = mongoose.Schema({
  members: {
    type: Array,
    required: true,
  },
});

const Conversation = mongoose.model("Converstion", conversationSchema);

module.exports = Conversation;
