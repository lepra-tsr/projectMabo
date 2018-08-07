const mongoose = require('mongoose');

export const userMongoSchema = mongoose.Schema({
  roomId: String,
  socketId: String,
  tokenId: String,
  name: String,
}, { collection: 'user' });