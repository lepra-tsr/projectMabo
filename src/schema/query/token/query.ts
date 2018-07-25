const {
  GraphQLNonNull,
  GraphQLInt,
} = require('graphql');
const {Token} = require('../../model/Token/type');

export const tokenQuery = {
  type: Token,
  description: 'query token description',
  args: {
    id: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'token id',
    }
  },
  resolve: (...args) => {
    const [/* source */, {id}, /* context */] = args;
    return {id: id, hash: 'aaa'}
  },
};