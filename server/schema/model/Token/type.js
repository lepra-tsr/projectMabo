"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tokenMongoSchema = require('./schema').tokenMongoSchema;
var createType = require('mongoose-schema-to-graphql');
var config = {
    name: 'token',
    description: 'description type token',
    class: 'GraphQLObjectType',
    schema: tokenMongoSchema,
};
exports.TokenType = createType(config);
