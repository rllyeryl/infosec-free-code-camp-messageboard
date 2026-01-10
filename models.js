const mongoose = require('mongoose');
const { Schema } = mongoose;

// 1. Define what a single Reply looks like
const ReplySchema = new Schema({
  text: { type: String, required: true },
  delete_password: { type: String, required: true },
  created_on: { type: Date, default: Date.now },
  reported: { type: Boolean, default: false }
});

// 2. Define the Thread (which contains an array of Replies)
const ThreadSchema = new Schema({
  board: { type: String, required: true },
  text: { type: String, required: true },
  created_on: { type: Date, default: Date.now },
  bumped_on: { type: Date, default: Date.now },
  reported: { type: Boolean, default: false },
  delete_password: { type: String, required: true },
  replies: { type: [ReplySchema], default: [] }
});

// 3. Export the model
const Thread = mongoose.model('Thread', ThreadSchema);
module.exports = { Thread };