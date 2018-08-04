"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var roomMongoSchema = require('./schema').roomMongoSchema;
var createType = require('mongoose-schema-to-graphql');
var config = {
    name: 'room',
    description: 'description type room',
    class: 'GraphQLObjectType',
    schema: roomMongoSchema,
};
exports.RoomType = createType(config);
