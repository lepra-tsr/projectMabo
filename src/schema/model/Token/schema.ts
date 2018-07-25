const mongoose = require('mongoose');

export const tokenMongoSchema = mongoose.Schema({
  id: Number,
  roomId: Number,
  hash: String,
  timestamp: String,
  expireDate: String,
});