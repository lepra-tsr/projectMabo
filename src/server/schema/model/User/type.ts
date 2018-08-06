const { userMongoSchema } = require('./schema');
const createType = require('mongoose-schema-to-graphql');
const config = {
  name: 'user',
  description: 'description type user',
  class: 'GraphQLObjectType',
  schema: userMongoSchema,
};

export const UserType = createType(config);
