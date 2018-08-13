const mongoose = require('mongoose');
const { characterMongoSchema } = require('./schema');

export const CharacterModel = mongoose.model('Character', characterMongoSchema);