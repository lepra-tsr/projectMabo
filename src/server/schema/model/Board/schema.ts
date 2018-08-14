const mongoose = require('mongoose');

export const boardMongoSchema = mongoose.Schema({
  roomId: String,
  height: Number,
  width: Number,
}, { collection: 'board' });