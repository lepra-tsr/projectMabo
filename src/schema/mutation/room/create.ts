const {
  GraphQLString,
  GraphQLNonNull,
} = require('graphql');

const { RoomType } = require('../../model/Room/type');
const { RoomModel } = require('../../model/Room/Model');

export const roomCreate = {
  type: RoomType,
  description: 'mutation room description',
  args: {
    title: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'room title',
    },
    description: {
      type: GraphQLString,
      description: 'room description',
    },
    password: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'room password',
    }
  },
  /**
   * @return {Promise}
   */
  resolve: (...args) => {
    const [, { title, description = '', password }] = args;
    const { MongoWrapper: mw } = require('../../util/MongoWrapper');
    return mw.open()
      .then(() => {
        const newRoom = new RoomModel({
          title,
          description,
          password,
        });
        return newRoom.save()
          .then((createdRoom) => createdRoom);
      });
  },
};