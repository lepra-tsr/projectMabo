const {
  GraphQLSchema,
  GraphQLObjectType,
} = require('graphql');
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
const { queryRoom } = require('./query/room/query');
const { createRoom } = require('./mutation/room/create');
const { updateRoom } = require('./mutation/room/update');
const { deleteRoom } = require('./mutation/room/delete');

const { queryToken } = require('./query/token/query');
const { validateToken } = require('./query/token/validate');
const { createToken } = require('./mutation/token/create');

const { queryUser } = require('./query/user/query');
const { updateUser } = require('./mutation/user/update');


const Query = new GraphQLObjectType({
  name: 'maboQuery',
  description: 'root query',
  fields: {
    room: queryRoom,
    token: queryToken,
    validateToken: validateToken,
    user: queryUser,
  }
});

const Mutation = new GraphQLObjectType({
  name: 'maboMutation',
  description: 'root mutation',
  fields: {
    createRoom,
    updateRoom,
    deleteRoom,
    createToken,
    updateUser,
  }
});

export const schema = new GraphQLSchema({
  query: Query,
  mutation: Mutation,
});