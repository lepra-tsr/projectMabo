const {
  GraphQLNonNull,
  GraphQLInt,
  GraphQLString,
} = require('graphql');
const { Token } = require('../../model/Token/type');
const crypto = require('crypto');
const dotenv = require('dotenv');
const env = dotenv.config().parsed;
const salt = env['SHA256_SALT'];

export const tokenQuery = {
  type: Token,
  description: 'query token description',
  args: {
    id: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'token id',
    },
    roomId: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'room id',
    },
    password: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'password',
    }
  },
  resolve: (...args) => {
    const [/* source */, { id, roomId, password }, /* context */] = args;

    const hash = crypto.createHmac('sha256', salt);
    hash.update(password);
    const sha256 = hash.digest('hex');

    return { id, roomId, hash: sha256 }
  },
};