const {
  GraphQLList,
  GraphQLString,
} = require('graphql');

const { CharacterType } = require('../../model/Character/type');
const { CharacterModel } = require('../../model/Character/Model');

export const queryCharacter = {
  type: new GraphQLList(CharacterType),
  description: 'query character description',
  args: {
    roomId: {
      type: GraphQLString,
      description: 'roomId',
    },
  },
  /**
   * @return {Promise}
   */
  resolve: async (...args) => {
    const [, { roomId }] = args;
    const { MongoWrapper: mw } = require('../../../util/MongoWrapper');

    await mw.open()
    const query = CharacterModel.find();
    if (roomId) {
      query.where({ roomId })
    }
    const result = await query.exec()

    return result.map((r) => ({
      _id: r._id.toString(),
      roomId: r.roomId,
      columnsJson: r.columnsJson,
      name: r.name,
      showOnResource: r.showOnResource,
      text: r.text,
    }))
  }
};