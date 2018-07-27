const {
  GraphQLList,
  GraphQLString,
} = require('graphql');

const { RoomType } = require('../../model/Room/type');
const { RoomModel } = require('../../model/Room/Model');

export const roomQuery = {
  type: new GraphQLList(RoomType),
  description: 'query room description',
  args: {
    id: {
      type: GraphQLString,
      description: 'room id such as: \"5b585a5a1e2119206c5eebed\"',
    }
  },
  /**
   * @return {Promise}
   */
  resolve: (...args) => {
    const [, { id }] = args;
    const { MongoWrapper: mw } = require('../../util/MongoWrapper');
    return mw.open()
      .then(() => {
        const query = RoomModel.find();
        query.collection(RoomModel.collection);
        if (id) {
          query.where({ _id: id })
        }

        return query.exec()
          .then((result) => {
            return result.map((r) => {
              return {
                id: r._id,
                title: r.title,
                description: r.description,
                password: r.password,
              }
            })
          });
      });
  },
};