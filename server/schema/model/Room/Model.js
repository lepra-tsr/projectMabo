"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose = require('mongoose');
var roomMongoSchema = require('./schema').roomMongoSchema;
exports.RoomModel = mongoose.model('Room', roomMongoSchema);
