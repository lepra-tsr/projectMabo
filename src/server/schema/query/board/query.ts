const {
  GraphQLList,
  GraphQLString,
  GraphQLNonNull,
} = require('graphql');

const { MongoWrapper: mw } = require('../../../util/MongoWrapper');
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
    await mw.open()

    const condition = roomId ? { roomId } : {};
    const boardResult = await BoardModel.find().where(condition).exec();

    const result: any[] = [];
    for (let i_b = 0; i_b < boardResult.length; i_b++) {
      const b = boardResult[i_b];
      const board = {
        _id: b._id.toString(),
        roomId: b.roomId,
        height: b.height || 80,
        width: b.width || 80,
      }
      result.push(board);
    }
    return result;
  }
};