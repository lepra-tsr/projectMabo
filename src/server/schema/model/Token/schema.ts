const mongoose = require('mongoose');

export const tokenMongoSchema = mongoose.Schema({
  roomId: String,
  hash: String,
  timestamp: String,
  expireDate: String,
}, {collection: 'token'});