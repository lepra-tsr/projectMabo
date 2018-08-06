const mongoose = require('mongoose');
const { userMongoSchema } = require('./schema');

export const UserModel = mongoose.model('Connection', userMongoSchema);