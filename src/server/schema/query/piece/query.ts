const {
  GraphQLList,
  GraphQLString,
  GraphQLNonNull,
} = require('graphql');

const { PieceType } = require('../../model/Piece/type');
const { PieceModel } = require('../../model/Piece/Model');
const { Validator } = require('../../../util/Validator');
const { MongoWrapper: mw } = require('../../../util/MongoWrapper');

export const queryPiece = {
  type: new GraphQLList(PieceType),
  description: 'query piece description',
  args: {
    roomId: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'piece\'s room id',
    },
  },
  /**
   * @return {Promise}
   */
  resolve: async (...args) => {
    const [, { roomId }] = args;
    Validator.test([
      ['piece.roomId', roomId, { exist: true }],
    ]);

    await mw.open()
    const query = PieceModel.find();
    if (roomId) {
      query.where({ roomId })
    }
    const result = await query.exec()

    return result.map((r) => {
      return {
        _id: r._id.toString(),
        characterId: r.characterId || r.characterId,
        roomId: r.roomId || r.roomId,
        boardId: r.boardId || r.boardId,
        type: r.type || r.type,
        height: r.height || 5,
        width: r.width || 5,
        x: r.x,
        y: r.y,
      }
    })
  }
};