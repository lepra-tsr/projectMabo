const {
  GraphQLList,
  GraphQLInt,
} = require('graphql');

/* Room > RoomType */
const { Room } = require('../../model/Room/type');
const { RoomModel } = require('../../model/Room/Model');

export const roomQuery = {
  type: new GraphQLList(Room),
  description: 'query room description',
  args: {
    id: {
      type: GraphQLInt,
      description: 'room id',
    }
  },
  /**
   * @return {Promise}
   */
  resolve: (/*...args*/) => {

    const { MongoWrapper: mw } = require('../../util/MongoWrapper');
    return mw.open()
      .then(() => {
        const query = RoomModel.find();
        query.collection(RoomModel.collection);
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