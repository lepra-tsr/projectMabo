const mongoose = require('mongoose');

export const imageMongoSchema = mongoose.Schema({
roomId: String,
fileName: String,
key: String,
mimeType: String,
height: Number,
width: Number,
byteSize: Number,
tags: Array,
}, {collection: 'image'});