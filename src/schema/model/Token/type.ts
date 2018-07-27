const {tokenMongoSchema} = require('./schema');
const createType = require('mongoose-schema-to-graphql');
const config = {
  name: 'token',
  description: 'description type token',
  class: 'GraphQLObjectType',
  schema: tokenMongoSchema,
};

export const TokenType = createType(config);
