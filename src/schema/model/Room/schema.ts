const mongoose = require('mongoose');

export const roomMongoSchema = mongoose.Schema({
  id: String,
  title: String,
  description: String,
  password: String,
}, {collection: 'rooms'});