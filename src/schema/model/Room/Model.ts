const mongoose = require('mongoose');
const roomSchema = require('./schema');

export const RoomModel = mongoose.model('Room', roomSchema);