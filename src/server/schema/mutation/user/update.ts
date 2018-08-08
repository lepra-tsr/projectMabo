
const {
  GraphQLNonNull,
  GraphQLString,
} = require('graphql');

const { MongoWrapper: mw } = require('../../../util/MongoWrapper');
const { slg } = require("../../../util/MaboLogger");
const { UserType } = require('../../model/User/type');
const { UserModel } = require('../../model/User/Model');
const { Validator } = require('../../../util/Validator');
const Io = require('../../../socketeer/Io');

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
    slg.debug(`${socketId} -> user name update: ${doc.name}`);

    const result = {
      _id: doc._id.toString(),
      roomId: doc.roomId,
      socketId: doc.socketId,
      tokenId: doc.tokenId,
      hashId: doc.hashId,
      name: doc.name,
    }

    const usersResult = await UserModel.find()
      .where({ roomId: doc.roomId }).exec();
    const usersInfo = usersResult
    .map((u) => ({ id: u._id, name, socketId }));

    Io.roomEmit(doc.roomId, 'roomUserInfo', usersInfo)

    return result;
  },
};