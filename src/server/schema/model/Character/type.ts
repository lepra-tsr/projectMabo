const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLBoolean,
} = require('graphql');

export const CharacterType = new GraphQLObjectType({
  name: 'character',
  description: 'type character',
  fields: {
    _id: { type: GraphQLString },
    roomId: { type: GraphQLString },
    columnsJson: { type: GraphQLString },
    name: { type: GraphQLString },
    showOnResource: { type: GraphQLBoolean },
    text: { type: GraphQLString },
  }
})
