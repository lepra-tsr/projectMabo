const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
} = require('graphql');

export const BoardType = new GraphQLObjectType({
  name: 'board',
  description: 'type board',
  fields: {
    _id: { type: GraphQLString },
    roomId: { type: GraphQLString },
    height: { type: GraphQLInt },
    width: { type: GraphQLInt },
  }
})
