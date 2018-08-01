const {
  GraphQLBoolean,
  GraphQLNonNull,
  GraphQLObjectType,
} = require('graphql');

export const resultType = new GraphQLObjectType({
  name: 'result',
  description: 'answer with boolean',
  fields: () => ({
    result: {
      type: GraphQLNonNull(GraphQLBoolean),
      description: 'answer is ...',
    }
  })
});
