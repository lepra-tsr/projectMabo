const {
  GraphQLString,
  GraphQLNonNull,
} = require('graphql');
const { MongoWrapper: mw } = require('../../util/MongoWrapper');
const crypto = require('crypto');
const dotenv = require('dotenv');
const env = dotenv.config().parsed;
const salt = env['SHA256_SALT'];

const { TokenType } = require('../../model/Token/type');
const { TokenModel } = require('../../model/Token/Model');

export const tokenCreate = {
  type: TokenType,
  description: 'mutation(create) token description',
  args: {
    roomId: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'new token\'s title',
    },
    password: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'new token\'s description',
    },
  },
  /**
   * @return {Promise}
   */
  resolve: (...args) => {
    const [, { roomId, password, }] = args;

    /* roomIdは妥当か？ room の存在チェック */
    /* 有効なroomId - passwordの組み合わせか？ */
    return mw.open()
      .then(() => {
        const hmac = crypto.createHmac('sha256', salt);
        hmac.update(password);
        const hash = hmac.digest('hex');

        const timestamp = Date.now();
        const miliSecondsOfDay = 60 * 60 * 24 * 1000;
        const expireDate = timestamp + miliSecondsOfDay;

        const newToken = new TokenModel({
          roomId,
          hash,
          timestamp,
          expireDate,
        });

        return newToken.save()
          .then((createdToken) => createdToken);
      });
  },
};