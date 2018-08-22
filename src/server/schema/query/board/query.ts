const {
  GraphQLList,
  GraphQLString,
  GraphQLNonNull,
} = require('graphql');

const { BoardType } = require('../../model/Board/type');
const { BoardModel } = require('../../model/Board/Model');
const { PieceModel } = require('../../model/Piece/Model');

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
    const condition = roomId ? { roomId } : {};
    const boardResult = await BoardModel.find().where(condition).exec();

    const boardIds = boardResult.map((r) => r._id.toString());
    const pieceResult = await PieceModel.find().where({ boardId: { $in: boardIds } }).exec();

    const result: any[] = [];
    for (let i_b = 0; i_b < boardResult.length; i_b++) {
      const b = boardResult[i_b];
      const pieces: any[] = [];
      for (let i_p = 0; i_p < pieceResult.length; i_p++) {
        const p = pieceResult[i_p];
        if (p.boardId !== b._id.toString()) { continue; }
        const piece = {
          _id: p._id.toString(),
          characterId: p.characterId,
          roomId: p.roomId,
          boardId: p.boardId,
          type: p.type,
          height: p.height,
          width: p.width,
          x: p.x,
          y: p.y,
        };
        pieces.push(piece);
      }
      const board = {
        _id: b._id.toString(),
        roomId: b.roomId,
        height: b.height || 80,
        width: b.width || 80,
        pieces,
      }
      result.push(board);
    }
    return result;
  }
};