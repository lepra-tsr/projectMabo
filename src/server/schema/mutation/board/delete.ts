const {
  GraphQLList,
  GraphQLString,
  GraphQLNonNull,
} = require('graphql');
const { MongoWrapper: mw } = require('../../../util/MongoWrapper');
const { ObjectId } = require('mongodb');
const { Validator } = require('../../../util/Validator');
const { BoardType } = require('../../model/Board/type');
const { BoardModel } = require('../../model/Board/Model');
const Io = require('../../../socketeer/Io');

export const deleteBoard = {
  type: new GraphQLList(BoardType),
  description: 'mutation(delete) board description',
  args: {
    id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'board\'s boardId to be removed',
    },
  },
  /**
   * @return {Promise}
   */
  resolve: async (...args) => {
    const [, {
      id,
    }] = args;
    Validator.test([
      ['board.id', id, { exist: true }],
    ])
    await mw.open();

    /* board existence check */
    const boardsExist: { roomId: string }[] = await BoardModel.find({
      _id: new ObjectId(id)
    })
    if (boardsExist.length ===0) {
      throw new Error('対象となるボードが存在しません');
    }

    const roomId = boardsExist[0].roomId;
    await BoardModel.deleteOne({
      _id: new ObjectId(id)
    })

    const boards: {
      _id,
      roomId: string,
      height: number,
      width: number,
    }[] = await BoardModel.find({
      _id: new ObjectId(id)
    })

    const boardInfo: {
      id,
      roomId: string,
      height: number,
      width: number,
    }[] = [];
    for (let i = 0; i < boards.length; i++) {
      const b = boards[i];
      const board = {
        id: b._id.toString(),
        roomId: b.roomId,
        height: b.height,
        width: b.width,
      }
      boardInfo.push(board);
    }
    Io.roomEmit(roomId, 'boardInfo', boardInfo);

    return boards;
  }
};