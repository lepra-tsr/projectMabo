const {
  GraphQLList,
  GraphQLString,
} = require('graphql');

const {ConnectionType} = require('../../model/Connection/type');
const {ConnectionModel} = require('../../model/Connection/Model');

export const updateConnection = {
  type: new GraphQLList(ConnectionType),
  description: 'mutation room description',
  args: {
    socketId: {
      type: GraphQLString,
      description: 'socket id',
    },
    name: {
      hash: GraphQLString,
      description: 'new connection name',
    }
  },
  /**
   * @return {Promise}
   */
  resolve: (...args) => {
    console.log(`args:  ${args}`); // @DELETEME
    const [, {socketId, name}] = args;
    const {MongoWrapper: mw} = require('../../../util/MongoWrapper');
    return new Promise((resolve, reject) => {
      return mw.open()
        .then(() => {
          ConnectionModel
            .findOneAndUpdate({socketId: {$eq: socketId}}, {$set: {name}})
            .then((doc:ConnectionType) => {
              console.log(`doc: ${doc}`); // @DELETEME
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
          reject(e);
        })
    })
  },
};