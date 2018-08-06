const {
  GraphQLList,
  GraphQLString,
} = require('graphql');

const { UserType } = require('../../model/User/type');
const { UserModel } = require('../../model/User/Model');

export const queryUser = {
  type: new GraphQLList(UserType),
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
    const [, { _id }] = args;
    const { MongoWrapper: mw } = require('../../../util/MongoWrapper');
    return mw.open()
      .then(() => {
        const query = UserModel.find();
        query.collection(UserModel.collection);
        if (_id) {
          query.where({ _id })
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