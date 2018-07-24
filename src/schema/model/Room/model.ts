const {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString,
} = require('graphql');

export const Room = new GraphQLObjectType({
  name: 'Room',
  description: 'schema room description',
  fields: () => ({
    id: {
      type: GraphQLInt,
      resolve: (room) => room.id || 999,
      description: 'id \'s description'
    },
    title: {
      type: GraphQLString,
      resolve: (room) => room.title || '999',
      description: 'title \'s description'
    },
    description: {
      type: GraphQLString,
      resolve: (room) => room.description || 'description sample',
      description: 'description \'s description'
    },
    password: {
      type: GraphQLString,
      resolve: (room) => room.password || '999',
      description: 'password \'s description'
    },
  })
});