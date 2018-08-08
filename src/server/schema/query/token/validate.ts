const {
  GraphQLBoolean,
  GraphQLNonNull,
  GraphQLString,
} = require('graphql');
const { Validator } = require('../../../util/Validator');
const { TokenModel } = require('../../model/Token/Model');
const { MongoWrapper: mw } = require("../../../util/MongoWrapper");
export const validateToken = {
  type: GraphQLBoolean,
  description: 'verify token',
  args: {
    roomId: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'room id',
    },
    hash: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'token hash',
    },
  },
  /**
   * @return {Promise}
   * @param args
   */
  resolve: async (...args) => {
    const [/* source */, { roomId, hash }, /* context */] = args;
    Validator.test([
      ['token.roomId', roomId, { exist: true }],
      ['token.hash', hash, { exist: true }],
    ]);

    await mw.open();
    const query = TokenModel.find();
    query.where({ roomId, hash });
    const records = await query.exec();

    return (records.length === 1);
  }
};
