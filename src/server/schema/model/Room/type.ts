const { GraphQLObjectType, GraphQLString } = require('graphql');

export const RoomType = new GraphQLObjectType({
  name: 'room',
  description: 'type room',
  fields: {
    _id: { type: GraphQLString },
    title: { type: GraphQLString },
    description: { type: GraphQLString },
    password: { type: GraphQLString },
  }
})
