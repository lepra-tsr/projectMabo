const mongoose = require('mongoose');
const {connectionMongoSchema} = require('./schema');

export const ConnectionModel = mongoose.model('Connection', connectionMongoSchema);