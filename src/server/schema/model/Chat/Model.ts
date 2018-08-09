const mongoose = require('mongoose');
const {chatMongoSchema} = require('./schema');

export const ChatModel = mongoose.model('Chat', chatMongoSchema);