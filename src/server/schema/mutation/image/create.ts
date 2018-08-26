const {
  GraphQLString,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLList,
} = require('graphql');
const { MongoWrapper: mw } = require('../../../util/MongoWrapper');
const { Validator } = require('../../../util/Validator');
const { ImageType } = require('../../model/Image/type');
const { ImageModel } = require('../../model/Image/Model');
const { signedUrlForGet } = require('./signedUrlForGet');

export const createImage = {
  type: ImageType,
  description: 'mutation(create) image description',
  args: {
    roomId: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'new image s roomId'
    },
    fileName: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'new image s fileName'
    },
    key: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'new image s key'
    },
    mimeType: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'new image s mimeType'
    },
    height: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'new image s height'
    },
    width: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'new image s width'
    },
    byteSize: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'new image s byteSize'
    },
    tags: {
      type: new GraphQLList(GraphQLString),
      description: 'new image s tags'
    },
  },
  /**
   * @return {Promise}
   */
  resolve: async (...args) => {
    const [, {
      roomId,
      fileName,
      key,
      mimeType,
      height,
      width,
      byteSize,
      // tags,
    }] = args;
    Validator.test([
    ]);

    await mw.open()
    const newImage = new ImageModel({
      roomId,
      fileName,
      key,
      mimeType,
      height,
      width,
      byteSize,
      tags: [],
    });
    const image = await newImage.save();
    const { resolve: imageResultResolver } = signedUrlForGet;
    const url = await imageResultResolver(...[, { key }]);
    image.url = url;
  }
};