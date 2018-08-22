const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
} = require('graphql');

export const PieceType = new GraphQLObjectType({
  name: 'piece',
  description: 'type piece',
  fields: {
    _id: { type: GraphQLString },
    characterId: { type: GraphQLString },
    roomId: { type: GraphQLString },
    type: { type: GraphQLString },
    height: { type: GraphQLInt },
    width: { type: GraphQLInt },
    x: { type: GraphQLInt },
    y: { type: GraphQLInt },
  }
})
