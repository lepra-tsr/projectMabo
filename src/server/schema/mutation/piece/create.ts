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
    boardId: {
      type: GraphQLString,
      description: 'new piece s boardId'
    },
    type: {
      type: GraphQLString,
      description: 'new piece s type'
    },
    height: {
      type: GraphQLInt,
      description: 'new piece s height'
    },
    width: {
      type: GraphQLInt,
      description: 'new piece s width'
    },
    x: {
      type: GraphQLInt,
      description: 'new piece s x'
    },
    y: {
      type: GraphQLInt,
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
      boardId,
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
      boardId: boardId,
      type: type || 'pawn',
      height: height,
      width: width,
      x: x,
      y: y,
    });

    const createdPiece = await newPiece.save();

    const piece = {
      id: createdPiece._id,
      name: createdPiece.name,
      roomId: createdPiece.roomId,
      height: createdPiece.height,
      width: createdPiece.width,
    }
    Io.roomEmit(roomId, 'pieceInfo', piece);

    return createdPiece;
  }
};