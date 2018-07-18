"use strict";
exports.__esModule = true;
var _a = require('graphql'), 
// buildSchema,
GraphQLSchema = _a.GraphQLSchema, GraphQLObjectType = _a.GraphQLObjectType, GraphQLInt = _a.GraphQLInt, GraphQLString = _a.GraphQLString, getNullableType = _a.getNullableType;
var RoomType = new GraphQLObjectType({
    name: 'Room',
    description: 'Room Type',
    fields: {
        id: { type: GraphQLInt },
        title: { type: GraphQLString },
        description: { type: GraphQLString },
        password: { type: getNullableType(GraphQLString) }
    }
});
exports.schema = new GraphQLSchema({
    query: room
});
exports.resolver = {
    author: function (_a) {
        var firstName = _a.firstName, lastName = _a.lastName;
        return "hello world!" + firstName + lastName;
    },
    getFortuneCookie: function (_a) {
        var number = _a.number;
        return "cookie: " + number;
    }
};
