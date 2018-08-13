const {
  GraphQLList,
  GraphQLString,
  GraphQLNonNull,
} = require('graphql');

const { ChatType } = require('../../model/Chat/type');
const { ChatModel } = require('../../model/Chat/Model');

export const queryChat = {
  type: new GraphQLList(ChatType),
  description: 'query chat description',
  args: {
    roomId: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'room _id such as: \"5b585a5a1e2119206c5eebed\"',
    }
  },
  /**
   * @return {Promise}
   */
  resolve: async (...args) => {
    const [, { roomId }] = args;
    const { MongoWrapper: mw } = require('../../../util/MongoWrapper');
    await mw.open()
    const result = await ChatModel.find().where({ roomId }).exec();
    return result.map(r => ({
      _id: r._id,
      socketId: r.socketId,
      userName: r.userName,
      channelId: r.channelId,
      avatarId: r.avatarId,
      content: r.content,
      faceId: r.faceId,
      characterId: r.characterId,
      characterName: r.characterName,
    }))
  },
};