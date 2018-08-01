const {
  GraphQLString,
  GraphQLNonNull,
} = require('graphql');
const { MongoWrapper: mw } = require('../../util/MongoWrapper');
const { Validator, RoomValidator } = require('../../util/Validator');
const { Encrypt } = require("../../util/Encrypt");
const { TokenType } = require('../../model/Token/type');
const { TokenModel } = require('../../model/Token/Model');

export const createToken = {
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
    Validator.test([
      ['room.id', roomId, { exist: true }],
      ['room.password', password, { exist: true }],
    ]);

    return new Promise((resolve, reject) => {
      return mw.open()
        .then(() => {
          const pExist = RoomValidator.validateRoomExists(roomId);
          const pAuth = RoomValidator.validateRoomAuth(roomId, password);
          return Promise.all([pExist, pAuth])
            .then(() => {
            const timestamp = Date.now();
            const hash = Encrypt.sha256(password + timestamp);

            const milliSecondsOfDay = 60 * 60 * 24 * 1000;
            const expireDate = timestamp + milliSecondsOfDay;

            const newToken = new TokenModel({
              roomId,
              hash,
              timestamp,
              expireDate,
            });

            return newToken.save()
              .then((createdToken) => {
                resolve(createdToken)
              });
            });
        }).catch((e) => {
          reject(e);
        })
    })
  },
};