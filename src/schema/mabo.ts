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
const {tokenQuery} = require('./query/token/query');

const Query = new GraphQLObjectType({
  name: 'mabo',
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

export const schema = new GraphQLSchema({
  query: Query,
});