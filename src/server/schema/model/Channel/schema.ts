const mongoose = require('mongoose');

export const channelMongoSchema = mongoose.Schema({
  roomId: String,
  name: String,
}, { collection: 'channel' });