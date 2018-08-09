const { GraphQLObjectType, GraphQLString } = require('graphql');

export const ChannelType = new GraphQLObjectType({
  name: 'channel',
  description: 'type channel',
  fields: {
    _id: { type: GraphQLString },
    roomId: { type: GraphQLString },
    name: { type: GraphQLString },
  }
})
