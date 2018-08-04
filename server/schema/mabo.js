"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _a = require('graphql'), GraphQLSchema = _a.GraphQLSchema, GraphQLObjectType = _a.GraphQLObjectType;
/*
 * schema
 * |- query
 * |    `- room
 * |- mutation
 * |    `- room
 * `- model
 *      |- Room
 *      |    |- schema.ts // mongoose schema
 *      |    `- type.ts   // graphql type (include schema.ts to generate type definition)
 *      `- Connection
 *           |- schema.ts // mongoose schema
 *           `- type.ts   // graphql type (include schema.ts to generate type definition)
 */
var queryRoom = require('./query/room/query').queryRoom;
var createRoom = require('./mutation/room/create').createRoom;
var updateRoom = require('./mutation/room/update').updateRoom;
var deleteRoom = require('./mutation/room/delete').deleteRoom;
var queryToken = require('./query/token/query').queryToken;
var validateToken = require('./query/token/validate').validateToken;
var createToken = require('./mutation/token/create').createToken;
var Query = new GraphQLObjectType({
    name: 'maboQuery',
    description: 'root query',
    fields: {
        room: queryRoom,
        token: queryToken,
        validateToken: validateToken,
    }
});
var Mutation = new GraphQLObjectType({
    name: 'maboMutation',
    description: 'root mutation',
    fields: {
        createRoom: createRoom,
        updateRoom: updateRoom,
        deleteRoom: deleteRoom,
        createToken: createToken,
    }
});
exports.schema = new GraphQLSchema({
    query: Query,
    mutation: Mutation,
});
