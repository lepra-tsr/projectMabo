const {connectionMongoSchema} = require('./schema');
const createType = require('mongoose-schema-to-graphql');
const config = {
  name: 'connection',
  description: 'description type connection',
  class: 'GraphQLObjectType',
  schema: connectionMongoSchema,
};

export const ConnectionType = createType(config);
