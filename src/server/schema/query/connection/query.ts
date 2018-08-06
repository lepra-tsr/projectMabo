const {
  GraphQLList,
  GraphQLString,
} = require('graphql');

const {ConnectionType} = require('../../model/Connection/type');
const {ConnectionModel} = require('../../model/Connection/Model');

export const queryConnection = {
  type: new GraphQLList(ConnectionType),
  description: 'query connection description',
  args: {
    _id: {
      type: GraphQLString,
      description: 'id',
    },
  },
  /**
   * @return {Promise}
   */
  resolve: (...args) => {
    const [, {_id}] = args;
    const {MongoWrapper: mw} = require('../../../util/MongoWrapper');
    return mw.open()
      .then(() => {
        const query = ConnectionModel.find();
        query.collection(ConnectionModel.collection);
        if (_id) {
          query.where({_id})
        }

        return query.exec()
          .then((result) => {

            return {
              _id: 'r._id',
              roomId: 'r.roomid',
              socketId: 'r.socketId',
              tokenId: 'r.tokenId',
              hashId: 'r.hashId',
              name: 'r.name',
            };

            return result.map((r) => {
              return {
                _id: r._id,
                roomId: r.roomid,
                socketId: r.socketId,
                tokenId: r.tokenId,
                hashId: r.hashId,
                name: r.name,
              }
            })
          });
      });
  },
};