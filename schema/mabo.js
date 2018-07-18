"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _a = require('graphql'), 
// buildSchema,
GraphQLSchema = _a.GraphQLSchema, GraphQLObjectType = _a.GraphQLObjectType, GraphQLInt = _a.GraphQLInt, GraphQLString = _a.GraphQLString, getNullableType = _a.getNullableType;
var RoomType = new GraphQLObjectType({
    name: 'Room',
    fields: {
        id: {
            type: GraphQLInt,
            resolve: function () {
                return 0;
            }
        },
        title: {
            type: GraphQLString,
            resolve: function () {
                return 'it works. title!';
            }
        },
        description: {
            type: GraphQLString,
            resolve: function () {
                return 'it works. description!';
            }
        },
        password: {
            type: getNullableType(GraphQLString),
            resolve: function () {
                return 'it works. pwd!';
            }
        },
    }
});
var MaboType = new GraphQLObjectType({
    name: 'mabo',
    description: 'mabo type',
    fields: {
        rooms: {
            type: RoomType,
            resolve: function () {
                return {
                    id: 0,
                    title: 'heyaya',
                    description: 'heyaya',
                    password: 'heyaya',
                };
            }
        },
    }
});
exports.schema = new GraphQLSchema({
    query: MaboType
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
