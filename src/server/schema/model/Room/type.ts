const {roomMongoSchema} = require('./schema');
const createType = require('mongoose-schema-to-graphql');
const config = {
  name: 'room',
  description: 'description type room',
  class: 'GraphQLObjectType',
  schema: roomMongoSchema,
};

export const RoomType = createType(config);
