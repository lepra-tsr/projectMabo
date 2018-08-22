const {
  GraphQLList,
  GraphQLString,
  GraphQLNonNull,
} = require('graphql');
const { MongoWrapper: mw } = require('../../../util/MongoWrapper');
const { ObjectId } = require('mongodb');
const { Validator } = require('../../../util/Validator');
const { PieceType } = require('../../model/Piece/type');
const { PieceModel } = require('../../model/Piece/Model');
const Io = require('../../../socketeer/Io');

export const deletePiece = {
  type: new GraphQLList(PieceType),
  description: 'mutation(delete) piece description',
  args: {
    id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'piece\'s pieceId to be removed',
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
      ['piece.id', id, { exist: true }],
    ])
    await mw.open();

    /* existence check */
    const piecesExist: { roomId: string }[] = await PieceModel.find({
      _id: new ObjectId(id)
    });
    if (piecesExist.length === 0) {
      throw new Error('対象となるコマが存在しません');
    }

    const roomId = piecesExist[0].roomId;
    await PieceModel.deleteOne({
      _id: new ObjectId(id)
    })
    
    /* @WIP under development. vvv */
    const pieceResult = await PieceModel.find().where({ roomId }).exec();
    const pieces = pieceResult.map((b) => ({
      id: b._id,
      roomId: b.roomId,
      height: b.height,
      width: b.width,
    }));



    const socketBoards = await getBoardEntity(roomId, true);
    Io.roomEmit(roomId, 'boardInfoSync', socketBoards);

    return pieces;
  }
};