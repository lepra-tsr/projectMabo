const {
  GraphQLNonNull,
  GraphQLString,
} = require('graphql');

const { MongoWrapper: mw } = require('../../../util/MongoWrapper');
const { UserType } = require('../../model/User/type');
const { UserModel } = require('../../model/User/Model');
const { Validator } = require('../../../util/Validator');

export const updateUser = {
  type: UserType,
  description: 'mutation room description',
  args: {
    socketId: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'socket id such as DU0UIfDRabEF22TpAAAA',
    },
    name: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'new connection name',
    }
  },
  resolve: async (...args) => {
    const [, { socketId, name }] = args;
    Validator.test([
      ['user.socketId', socketId, { exist: true }],
      ['user.name', name, { exist: true }],
    ])
    await mw.open()

    const doc = await UserModel.findOneAndUpdate(
      { socketId: { $eq: socketId } },
      { $set: { name: name } },
      { new: true, maxTimeMs: 1000 }
    );

    const result = {
      _id: doc._id.toString(),
      roomId: doc.roomId,
      socketId: doc.socketId,
      tokenId: doc.tokenId,
      hashId: doc.hashId,
      name: doc.name,
    }
    return result;
  },
};