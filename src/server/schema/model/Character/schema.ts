const mongoose = require('mongoose');

export const characterMongoSchema = mongoose.Schema({
  roomId: String,
  columnsJson: String,
  name: String,
  showOnResource: Boolean,
  text: String,
}, { collection: 'character' });