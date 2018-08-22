import { getBoardEntity } from "./entity";

const {
  GraphQLList,
  GraphQLString,
  GraphQLNonNull,
} = require('graphql');

const { BoardType } = require('../../model/Board/type');

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
    const result =  await getBoardEntity(roomId);
    return result;
  }
};