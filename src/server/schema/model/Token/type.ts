const { GraphQLObjectType, GraphQLString } = require('graphql');

export const TokenType = new GraphQLObjectType({
  name: 'token',
  description:'type token',
  fields: {
    _id: { type: GraphQLString },
    roomId: { type: GraphQLString },
    hash: { type: GraphQLString },
    timestamp: { type: GraphQLString },
    expireDate: { type: GraphQLString },
  }
})
