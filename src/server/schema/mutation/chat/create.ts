const {
  GraphQLString,
  GraphQLNonNull,
} = require('graphql');
const { MongoWrapper: mw } = require('../../../util/MongoWrapper');
const { Validator } = require('../../../util/Validator');
const { ChatType } = require('../../model/Chat/type');
const { ChatModel } = require('../../model/Chat/Model');
const Io = require('../../../socketeer/Io');

export const createChat = {
  type: ChatType,
  description: 'mutation(create) chat description',
  args: {
    roomId: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'new chat\'s roomId',
    },
    socketId: {
      type: GraphQLString,
      description: 'new chat\'s socketId',
    },
    userName: {
      type: GraphQLString,
      description: 'new chat\'s userName',
    },
    channelId: {
      type: GraphQLString,
      description: 'new chat\'s channelId',
    },
    avatarId: {
      type: GraphQLString,
      description: 'new chat\'s avatarId',
    },
    content: {
      type: GraphQLString,
      description: 'new chat\'s content',
    },
    faceId: {
      type: GraphQLString,
      description: 'new chat\'s faceId',
    },
    characterId: {
      // type: new GraphQLNonNull(GraphQLString),
      type: GraphQLString,
      description: 'new chat\'s characterId',
    },
    characterName: {
      type: GraphQLString,
      description: 'new chat\'s characterName',
    },
  },
  /**
   * @return {Promise}
   */
  resolve: async (...args) => {
    const [, {
      roomId,
      socketId,
      userName,
      channelId,
      avatarId,
      content,
      faceId,
      characterId,
      characterName,
    }] = args;
    Validator.test([
      ['chat.roomId', roomId, { exist: true }],
      ['chat.socketId', socketId, {}],
      ['chat.userName', userName, {}],
      ['chat.channelId', channelId, {}],
      ['chat.avatarId', avatarId, {}],
      ['chat.content', content, {}],
      ['chat.faceId', faceId, {}],
      ['chat.characterId', characterId, { /* exist: true */ }],
      ['chat.characterName', characterName, {}],
    ]);
    await mw.open();

    const newChat = new ChatModel({
      roomId,
      socketId: socketId || 'socketId',
      userName: userName || 'userName',
      channelId: channelId || 'channelId',
      avatarId: avatarId || 'avatarId',
      content: content || 'content',
      faceId: faceId || 'faceId',
      characterId: characterId || 'characterId',
      characterName: characterName || 'characterName',
    });

    const createdChat = await newChat.save();

    const chat = {
      id: createdChat._id,
      roomId: createdChat.roomId,
      socketId: createdChat.socketId,
      userName: createdChat.userName,
      channelId: createdChat.channelId,
      avatarId: createdChat.avatarId,
      content: createdChat.content,
      faceId: createdChat.faceId,
      characterId: createdChat.characterId,
      characterName: createdChat.characterName,
    }

    Io.roomEmit(roomId, 'chatText', chat);
  }
};