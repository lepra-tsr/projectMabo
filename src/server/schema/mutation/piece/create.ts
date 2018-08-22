const {
  GraphQLString,
  GraphQLNonNull,
  GraphQLInt,
} = require('graphql');
const { MongoWrapper: mw } = require('../../../util/MongoWrapper');
const { Validator } = require('../../../util/Validator');
const { PieceType } = require('../../model/Piece/type');
const { PieceModel } = require('../../model/Piece/Model');
const Io = require('../../../socketeer/Io');

export const createPiece = {
  type: PieceType,
  description: 'mutation(create) piece description',
  args: {
    characterId: {
      type: GraphQLString,
      description: 'new piece s characterId'
    },
    roomId: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'new piece s roomId'
    },
    type: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'new piece s type'
    },
    height: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'new piece s height'
    },
    width: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'new piece s width'
    },
    x: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'new piece s x'
    },
    y: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'new piece s y'
    },
  },
  /**
   * @return {Promise}
   */
  resolve: async (...args) => {
    const [, {
      characterId,
      roomId,
      type,
      height,
      width,
      x,
      y,
    }] = args;
    Validator.test([
    ])
    await mw.open();

    const newPiece = new PieceModel({
      characterId: characterId,
      roomId: roomId,
      type: type || 'pawn',
      height: height,
      width: width,
      x: x,
      y: y,
    });

    const createdPiece = await newPiece.save();

    const pieceResult = await PieceModel.find().where({ roomId }).exec();
    const pieces = pieceResult.map((p) => ({
      id: p._id.toString(),
      characterId: p.characterId,
      roomId: p.roomId,
      type: p.type,
      height: p.height,
      width: p.width,
      x: p.x,
      y: p.y,
    }))

    Io.roomEmit(roomId, 'pieceInfoSync', pieces);

    return createdPiece;
  }
};