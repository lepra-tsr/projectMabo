const mongoose = require('mongoose');

export const pieceMongoSchema = mongoose.Schema({
  characterId: String,
  roomId: String,
  boardId: String,
  type: String,
  height: Number,
  width: Number,
  x: Number,
  y: Number,
}, { collection: 'piece' });