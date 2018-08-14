const {
  GraphQLList,
  GraphQLString,
  GraphQLNonNull,
} = require('graphql');

const { BoardType } = require('../../model/Board/type');
const { BoardModel } = require('../../model/Board/Model');

export const queryBoard = {
  type: new GraphQLList(BoardType),
  description: 'query board description',
  args: {
    roomId: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'board\'s room id',
    },
  },
  /**
   * @return {Promise}
   */
  resolve: async (...args) => {
    const [, { roomId }] = args;
    const { MongoWrapper: mw } = require('../../../util/MongoWrapper');

    await mw.open()
    const query = BoardModel.find();
    if (roomId) {
      query.where({ roomId })
    }
    const result = await query.exec()

    return result.map((r) => {
      return {
        _id: r._id.toString(),
        roomId: r.roomid,
        height: r.height || 80,
        width: r.width || 80,
      }
    })
  }
};