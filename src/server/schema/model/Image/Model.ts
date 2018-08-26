const mongoose = require('mongoose');
const {imageMongoSchema} = require('./schema');

export const ImageModel = mongoose.model('Image', imageMongoSchema);