const {
  GraphQLList,
  GraphQLString,
} = require('graphql');

const { RoomType } = require('../../model/Room/type');
const { RoomModel } = require('../../model/Room/Model');

export const roomUpdate = {
  type: new GraphQLList(RoomType),
  description: 'mutation room description',
  args: {

    title: {
      type: GraphQLString,
      description: 'room title',
    },
    description: {
      type: GraphQLString,
      description: 'room description',
    },
    password: {
      type: GraphQLString,
      description: 'room password',
    }
  },
  /**
   * @return {Promise}
   */
  resolve: () => {
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