const mongoose = require('mongoose');

export const connectionMongoSchema = mongoose.Schema({
  roomId: String,
  socketId: String,
  tokenId: String,
  name: String,
}, {collection: 'connection'});