"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose = require('mongoose');
exports.tokenMongoSchema = mongoose.Schema({
    roomId: String,
    hash: String,
    timestamp: String,
    expireDate: String,
}, { collection: 'token' });
