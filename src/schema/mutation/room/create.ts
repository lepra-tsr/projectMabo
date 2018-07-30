const {
  GraphQLString,
  GraphQLNonNull,
} = require('graphql');
const {MongoWrapper: mw} = require('../../util/MongoWrapper');
const {RoomType} = require('../../model/Room/type');
const {RoomModel} = require('../../model/Room/Model');
const {Validator} = require('../../util/Validator');

export const roomCreate = {
  type: RoomType,
  description: 'mutation(create) room description',
  args: {
    title: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'new room\'s title',
    },
    description: {
      type: GraphQLString,
      description: 'new room\'s description',
    },
    password: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'new room\'s password',
    }
  },
  /**
   * @return {Promise}
   */
  resolve: (...args) => {
    let [, {title, description = '', password}] = args;
    Validator.test([
      ['room.title', title, {exist: true}],
      ['room.description', description, {}],
      ['room.password', password, {exist: true}],
    ]);

    return mw.open()
      .then(() => {
        const newRoom = new RoomModel({
          title,
          description,
          password,
        });
        return newRoom.save()
          .then((createdRoom) => {
            return createdRoom;
          });
      })
      .catch((e) => {
        console.error('error: ', e);
      });
  },
};