const {
  GraphQLNonNull,
  GraphQLString,
} = require('graphql');
const { Validator } = require('../../../util/Validator');
const dotenv = require('dotenv');
const env = dotenv.config().parsed;
const S3_ACCESS_KEY = env['S3_ACCESS_KEY'];
const AWS_SECRET_KEY = env['AWS_SECRET_KEY'];
const AMAZON_S3_REGION = env['AMAZON_S3_REGION'];
const S3_IMAGE_BUCKET = env['S3_IMAGE_BUCKET'];
const S3_URI_EXPIRES_PUT = parseInt(env['S3_URI_EXPIRES_PUT'], 10);

export const signedUrlForPut = {
  type: GraphQLString,
  description: 'generate AWS S3 PUT signed URL string',
  args: {
    key: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'specify unique id on S3 storage',
    },
    contentType: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'mime type of image files. like image/png,jpeg, ...',
    },
  },
  /**
   * @return {Promise}
   * @param args
   */
  resolve: async (...args) => {
    const [/* source */, { key, contentType }, /* context */] = args;
    Validator.test([
    ]);

    const AWS = require('aws-sdk');
    const s3Options = {
      accessKeyId: S3_ACCESS_KEY,
      secretAccessKey: AWS_SECRET_KEY,
      region: AMAZON_S3_REGION,
    }
    AWS.config.update(s3Options);
    const s3 = new AWS.S3();

    const params = {
      Bucket: S3_IMAGE_BUCKET,
      Key: key,
      Expires: S3_URI_EXPIRES_PUT,
      ContentType: contentType,
    }

    return new Promise((resolve) => {
      s3.getSignedUrl('putObject', params, (error, url) => {
        if (error) { throw error }
        resolve(url);
      })
    })
  }
};
