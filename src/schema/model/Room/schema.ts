const mongoose = require('mongoose');

export const roomMongoSchema = mongoose.Schema({
  id: Number,
  title: String,
  description: String,
  password: String,
}, {collection: 'rooms'});