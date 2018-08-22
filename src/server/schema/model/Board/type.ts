const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLList,
} = require('graphql');
const { PieceType } = require('../Piece/type');

export const BoardType = new GraphQLObjectType({
  name: 'board',
  description: 'type board',
  fields: {
    _id: { type: GraphQLString },
    roomId: { type: GraphQLString },
    height: { type: GraphQLInt },
    width: { type: GraphQLInt },
    pieces: { type: new GraphQLList(PieceType) }
  }
})
