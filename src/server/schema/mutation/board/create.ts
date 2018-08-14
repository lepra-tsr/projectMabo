const {
  GraphQLString,
  GraphQLNonNull,
  GraphQLInt,
} = require('graphql');
const { MongoWrapper: mw } = require('../../../util/MongoWrapper');
const { Validator } = require('../../../util/Validator');
const { BoardType } = require('../../model/Board/type');
const { BoardModel } = require('../../model/Board/Model');
const Io = require('../../../socketeer/Io');

export const createBoard = {
  type: BoardType,
  description: 'mutation(create) board description',
  args: {
    roomId: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'new board\'s roomId',
    },
    name: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'new board\'s name',
    },
    height: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'new board\'s height',
    },
    width: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'new board\'s width',
    },
  },
  /**
   * @return {Promise}
   */
  resolve: async (...args) => {
    const [, {
      roomId,
      name,
      height,
      width,
    }] = args;
    Validator.test([
      ['board.roomId', roomId, { exist: true }],
      ['board.name', name, { exist: true }],
      ['board.height', height, { exist: true }],
      ['board.width', width, { exist: true }],
    ])
    await mw.open();

    const newBoard = new BoardModel({
      roomId,
      name: name || 'name',
      height: height || 80,
      width: width || 80,
    });

    const createdBoard = await newBoard.save();

    const board = {
      id: createdBoard._id,
      name: createdBoard.name,
      roomId: createdBoard.roomId,
      height: createdBoard.height,
      width: createdBoard.width,
    }
    Io.roomEmit(roomId, 'boardInfo', board);

    return createdBoard;
  }
};