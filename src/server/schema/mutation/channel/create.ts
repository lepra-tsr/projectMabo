const {
  GraphQLString,
  GraphQLNonNull,
} = require('graphql');
const { MongoWrapper: mw } = require('../../../util/MongoWrapper');
const { Validator } = require('../../../util/Validator');
const { ChannelType } = require('../../model/Channel/type');
const { ChannelModel } = require('../../model/Channel/Model');
const Io = require('../../../socketeer/Io');

export const createChannel = {
  type: ChannelType,
  description: 'mutation(create) channel description',
  args: {
    roomId: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'new channel\'s roomId',
    },
    name: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'new channel\'s name',
    },
  },
  /**
   * @return {Promise}
   */
  resolve: async (...args) => {
    const [, {
      roomId,
      name,
    }] = args;
    Validator.test([
      ['channel.roomId', roomId, { exist: true }],
      ['channel.name', name, { exist: true }],
    ]);
    await mw.open();

    const newChannel = new ChannelModel({
      roomId,
      name: name || 'name',
    });

    const createdChannel = await newChannel.save();

    const channel = {
      id: createdChannel._id,
      name: createdChannel.name,
      roomId: createdChannel.roomId,
    }
    Io.roomEmit(roomId, 'channelInfo', channel);

    return createdChannel;
  }
};