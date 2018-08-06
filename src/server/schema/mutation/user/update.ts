const {
  // GraphQLNonNull,
  GraphQLString,
} = require('graphql');

const { UserType } = require('../../model/User/type');
const { UserModel } = require('../../model/User/Model');

export const updateConnection = {
  type: UserType,
  description: 'mutation room description',
  args: {
    socketId: {
      type: GraphQLString,
      description: 'socket id',
    },
    name: {
      type: GraphQLString,
      description: 'new connection name',
    }
  },
  resolve: (...args) => {
    const [, { socketId, name }] = args;
    const { MongoWrapper: mw } = require('../../../util/MongoWrapper');
    return new Promise((resolve, reject) => {
      return mw.open()
        .then(() => {
          UserModel
            .findOneAndUpdate({ socketId: { $eq: socketId } }, { $set: { name: name } })
            .then(() => {
              const result = {
                _id: '_id',
                roomId: 'roomId',
                socketId: 'socketId',
                tokenId: 'tokenId',
                hashId: 'hashId',
                name: 'name',
              };
              resolve(result);
            })
        })
        .catch((e) => {
          const result = {
            _id: '_id',
            roomId: 'roomId',
            socketId: 'socketId',
            tokenId: 'tokenId',
            hashId: 'hashId',
            name: 'name',
          };
          reject(result);
        })
    })

  },
};