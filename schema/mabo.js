"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _a = require('graphql'), 
// buildSchema,
GraphQLSchema = _a.GraphQLSchema, GraphQLObjectType = _a.GraphQLObjectType, 
// GraphQLList,
GraphQLInt = _a.GraphQLInt, GraphQLString = _a.GraphQLString, getNullableType = _a.getNullableType;
var RoomType = new GraphQLObjectType({
    name: 'Room',
    fields: function () {
        return {
            id: {
                type: GraphQLInt,
                resolve: function (_a) {
                    var id = _a.id, title = _a.title, description = _a.description, password = _a.password;
                    console.log('args:', id, title, description, password); // @DELETEME
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
        };
    }
});
var roomQuery = {
    type: RoomType,
    args: {
        id: {
            name: 'id',
            type: GraphQLInt,
        },
        title: {
            name: 'title',
            type: GraphQLString,
        }
    },
    resolve: function (room, _a) {
        var id = _a.id, title = _a.title;
        console.log(room, id, title); // @DELETEME
        /* get rooms which id equals to ${id} */
        return {
            id: 0,
            title: 'title',
            description: 'desc',
            pwd: 'pwd',
        };
    }
};
var rootQuery = new GraphQLObjectType({
    name: 'rootQuery',
    description: 'This is rootQuery',
    fields: function () { return ({ room: roomQuery }); }
});
// https://github.com/aichbauer/express-graphql-boilerplate
exports.schema = new GraphQLSchema({
    query: rootQuery
});
