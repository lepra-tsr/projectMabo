const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
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
const {roomQuery} = require('./query/room/query');
const {roomCreate} = require('./mutation/room/create');
const {roomUpdate} = require('./mutation/room/update');
const {roomDelete} = require('./mutation/room/delete');
const {tokenQuery} = require('./query/token/query');

const Query = new GraphQLObjectType({
  name: 'maboQuery',
  description: 'root query',
  fields: {
    room: roomQuery,
    token: tokenQuery,
    connection: {
      type: GraphQLString,
      resolve: () => {
        return 'test connection';
      }
    }
  }
});

const Mutation = new GraphQLObjectType({
  name: 'maboMutation',
  description: 'root mutation',
  fields: {
    roomCreate,
    roomUpdate,
    roomDelete,
  }
})

export const schema = new GraphQLSchema({
  query: Query,
  mutation: Mutation,
});