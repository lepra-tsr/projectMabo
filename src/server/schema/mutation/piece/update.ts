const {
  GraphQLNonNull,
  GraphQLString,
  GraphQLInt,
} = require('graphql');

const { MongoWrapper: mw } = require('../../../util/MongoWrapper');
const { slg, lg } = require("../../../util/MaboLogger");
const { PieceType } = require('../../model/Piece/type');
const { PieceModel } = require('../../model/Piece/Model');
const { Validator } = require('../../../util/Validator');
const Io = require('../../../socketeer/Io');

export const updatePiece = {
  type: PieceType,
  description: 'mutation piece description',
  args: {
    pieceId: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'specify piece _id',
    },
    x: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'new piece x',
    },
    y: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'new piece y',
    },
  },
  resolve: async (...args) => {
    try {
      const [, { pieceId, x, y }] = args;
      Validator.test([
      ])
      await mw.open()

      const doc = await PieceModel.findOneAndUpdate(
        { $and: [{ _id: pieceId }] },
        { $set: { x, y } },
        { new: true, maxTimeMs: 1000 }
      );
      if (!doc) {
        throw new Error('コマ情報の更新に失敗');
      }

      const { roomId } = doc;
      slg.debug(`${roomId} -> user name update: ${doc.name}`);

      const result = {
        _id: doc._id.toString(),
        characterId: doc.characterId,
        roomId: doc.roomId,
        boardId: doc.boardId,
        type: doc.type,
        height: doc.height,
        width: doc.width,
        x: doc.x,
        y: doc.y,
      };

      const piecesResult = await PieceModel.find()
        .where({ roomId: roomId }).exec();
      const piecesInfo = piecesResult
        .map((u) => ({
          id: u._id,
          characterId: u.characterId,
          roomId: u.roomId,
          boardId: u.boardId,
          type: u.type,
          height: u.height,
          width: u.width,
          x: u.x,
          y: u.y,
        }));

      Io.roomEmit(doc.roomId, 'piecesInfo', piecesInfo)

      return result;
    }
    catch (e) {
      lg.error(e);
      throw e;
    }
  },
};