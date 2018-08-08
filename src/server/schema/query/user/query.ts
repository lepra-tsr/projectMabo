const {
  GraphQLList,
  GraphQLString,
} = require('graphql');

const { UserType } = require('../../model/User/type');
const { UserModel } = require('../../model/User/Model');

export const queryUser = {
  type: new GraphQLList(UserType),
  description: 'query connection description',
  args: {
    _id: {
      type: GraphQLString,
      description: 'id',
    },
  },
  /**
   * @return {Promise}
   */
  resolve: async (...args) => {
    const [, { _id }] = args;
    const { MongoWrapper: mw } = require('../../../util/MongoWrapper');

    await mw.open()
    const query = UserModel.find();
    if (_id) {
      query.where({ _id })
    }
    const result = await query.exec()

    return result.map((r) => {
      return {
        _id: r._id.toString(),
        roomId: r.roomid,
        socketId: r.socketId,
        tokenId: r.tokenId,
        hashId: r.hashId,
        name: r.name,
      }
    })
  }
};