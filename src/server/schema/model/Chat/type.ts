const { GraphQLObjectType, GraphQLString } = require('graphql');

export const ChatType = new GraphQLObjectType({
  name: 'chat',
  description: 'type chat',
  fields: {
    _id: { type: GraphQLString },
    roomId: { type: GraphQLString },
    socketId: { type: GraphQLString },
    userName: { type: GraphQLString },
    channelId: { type: GraphQLString },
    avatarId: { type: GraphQLString },
    content: { type: GraphQLString },
    faceId: { type: GraphQLString },
    characterId: { type: GraphQLString },
    characterName: { type: GraphQLString },
  }
})
