const {
  GraphQLList,
} = require('graphql');
const { ImageType } = require('../../model/Image/type');
const { ImageModel } = require('../../model/Image/Model');
const { MongoWrapper: mw } = require("../../../util/MongoWrapper");
const { Validator } = require('../../../util/Validator');
const { signedUrlForGet } = require('./signedUrlForGet');

export const queryImage = {
  type: new GraphQLList(ImageType),
  description: 'S3へアップロードした画像データの検索',
  args: {
  },
  /**
   * @return {Promise}
   * @param args
   */
  resolve: async (...args) => {
    const [/* source */, { }, /* context */] = args;

    Validator.test([
    ]);
    await mw.open()
    const query = ImageModel.find();
    query.collection(ImageModel.collection);
    const imageResult = await query.exec();
    const { resolve: imageResultResolver } = signedUrlForGet;

    for (let i = 0; i < imageResult.length; i++) {
      const image = imageResult[i];
      const { key } = image;
      const args = [, { key }];
      const url = await imageResultResolver(...args);
      image.url = url;
    }
    return imageResult;
  },
};