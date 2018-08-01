const mongoose = require('mongoose');

export const roomMongoSchema = mongoose.Schema({
  title: String,
  description: String,
  password: String,
}, {collection: 'rooms'});