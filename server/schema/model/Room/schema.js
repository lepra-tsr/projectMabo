"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose = require('mongoose');
exports.roomMongoSchema = mongoose.Schema({
    title: String,
    description: String,
    password: String,
}, { collection: 'rooms' });
