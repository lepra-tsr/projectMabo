const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
} = require('graphql');

const { roomQuery } = require('./query/room/query');

/* 問い合わせ時のroomに対応 */
const Query = new GraphQLObjectType({
  name: 'mabo',
  description: 'root query',
  fields: {
    room: roomQuery,
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