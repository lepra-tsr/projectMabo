"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _a = require('graphql'), 
// buildSchema,
GraphQLSchema = _a.GraphQLSchema, GraphQLObjectType = _a.GraphQLObjectType, 
// GraphQLList,
GraphQLInt = _a.GraphQLInt, GraphQLString = _a.GraphQLString;
// const RoomType = new GraphQLObjectType({
//   name: 'Room',
//   fields: {
//     id: {
//       type: GraphQLInt,
//       resolve: () => {
//         return 0;
//       }
//     },
//     title: {
//       type: GraphQLString,
//       resolve: () => {
//         return 'it works. title!';
//       }
//     },
//     description: {
//       type: GraphQLString,
//       resolve: () => {
//         return 'it works. description!';
//       }
//     },
//     password: {
//       type: getNullableType(GraphQLString),
//       resolve: () => {
//         return 'it works. pwd!';
//       }
//     },
//   }
// });
var roomQuery = {
    type: GraphQLString,
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
        /* get rooms which id equals to ${id} */
        console.log(id, title); // @DELETEME
        return "room which has id:" + id + ", title:" + title;
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
