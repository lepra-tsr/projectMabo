const mongoose = require('mongoose');

export const chatMongoSchema = mongoose.Schema({
  roomId: String,
  socketId: String,
  userName: String,
  channelId: String,
  avatarId: String,
  content: String,
  faceId: String,
  characterId: String,
  characterName: String,
}, { collection: 'chat' });