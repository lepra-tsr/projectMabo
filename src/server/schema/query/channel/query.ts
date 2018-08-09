const {
  GraphQLList,
  GraphQLString,
  GraphQLNonNull,
} = require('graphql');

const { Validator } = require('../../../util/Validator');
const { ChannelType } = require('../../model/Channel/type');
const { ChannelModel } = require('../../model/Channel/Model');

export const queryChannel = {
  type: new GraphQLList(ChannelType),
  description: 'query Channel description',
  args: {
    roomId: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'room _id such as: \"5b5ae235fe438245f14e0041\"',
    }
  },
  /**
   * @return {Promise}
   */
  resolve: async (...args) => {
    const [, { roomId }] = args
    Validator.test([
      ['channel.roomId', roomId, { exist: true }],
    ]);;
    const { MongoWrapper: mw } = require('../../../util/MongoWrapper');
    await mw.open()
    const result = await ChannelModel.find().where({ roomId }).exec();
    return result.map(r => ({
      _id: r._id,
      roomId: r.roomId,
      name: r.name,
    }))
  },
};