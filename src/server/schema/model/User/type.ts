const { GraphQLObjectType, GraphQLString } = require('graphql');

export const UserType = new GraphQLObjectType({
  name: 'user',
  description: 'type user',
  fields: {
    _id: { type: GraphQLString },
    roomId: { type: GraphQLString },
    socketId: { type: GraphQLString },
    tokenId: { type: GraphQLString },
    hashId: { type: GraphQLString },
    name: { type: GraphQLString },
  }
})
