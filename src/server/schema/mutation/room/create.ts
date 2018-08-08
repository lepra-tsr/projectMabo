const {
  GraphQLString,
  GraphQLNonNull,
} = require('graphql');
const { MongoWrapper: mw } = require('../../../util/MongoWrapper');
const { RoomType } = require('../../model/Room/type');
const { RoomModel } = require('../../model/Room/Model');
const { Validator } = require('../../../util/Validator');

export const createRoom = {
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
    return new Promise(async (resolve, reject) => {
      let [, { title, description = '', password }] = args;
      Validator.test([
        ['room.title', title, { exist: true }],
        ['room.description', description, {}],
        ['room.password', password, { exist: true }],
      ]);
      try {
        await mw.open()
        const newRoom = new RoomModel({
          title,
          description,
          password,
        });
        const createdRoom = await newRoom.save()
        resolve(createdRoom);
      } catch (e) {
        console.error('error: ', e);
        reject(e);
      }
    })
  },
};