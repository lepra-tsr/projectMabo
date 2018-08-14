const mongoose = require('mongoose');
const { boardMongoSchema } = require('./schema');

export const BoardModel = mongoose.model('Board', boardMongoSchema);