const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLList, } = require('graphql');

export const ImageType = new GraphQLObjectType({
  name: 'image',
  description: 'type image',
  fields: {
    _id: { type: GraphQLString },
    roomId: { type: GraphQLString },
    fileName: { type: GraphQLString },
    key: { type: GraphQLString },
    url: { type: GraphQLString },
    mimeType: { type: GraphQLString },
    height: { type: GraphQLInt },
    width: { type: GraphQLInt },
    byteSize: { type: GraphQLInt },
    tags: { type: new GraphQLList(GraphQLString) },
  }
})
