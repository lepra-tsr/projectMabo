const {
  GraphQLList,
  GraphQLString,
} = require('graphql');

const { RoomType } = require('../../model/Room/type');
const { RoomModel } = require('../../model/Room/Model');

export const queryRoom = {
  type: new GraphQLList(RoomType),
  description: 'query room description',
  args: {
    _id: {
      type: GraphQLString,
      description: 'room _id such as: \"5b585a5a1e2119206c5eebed\"',
    }
  },
  /**
   * @return {Promise}
   */
  resolve: async (...args) => {
    const [, { _id }] = args;
    const { MongoWrapper: mw } = require('../../../util/MongoWrapper');
    await mw.open()
    const query = RoomModel.find();
    if (_id) {
      query.where({ _id })
    }

    const result = await query.exec()
    return result.map(r => ({
      _id: r._id,
      title: r.title,
      description: r.description,
      password: '*secret*' /*r.password*/,
    }))
  },
};