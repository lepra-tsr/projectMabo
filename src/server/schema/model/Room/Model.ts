const mongoose = require('mongoose');
const {roomMongoSchema} = require('./schema');

export const RoomModel = mongoose.model('Room', roomMongoSchema);