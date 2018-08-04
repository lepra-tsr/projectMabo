const mongoose = require('mongoose');
const {tokenMongoSchema} = require('./schema');

export const TokenModel = mongoose.model('Token', tokenMongoSchema);