"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose = require('mongoose');
var tokenMongoSchema = require('./schema').tokenMongoSchema;
exports.TokenModel = mongoose.model('Token', tokenMongoSchema);
