const {
  GraphQLString,
  GraphQLNonNull,
  GraphQLBoolean,
} = require('graphql');
const { MongoWrapper: mw } = require('../../../util/MongoWrapper');
const { Validator } = require('../../../util/Validator');
const { CharacterType } = require('../../model/Character/type');
const { CharacterModel } = require('../../model/Character/Model');
const Io = require('../../../socketeer/Io');

export const createCharacter = {
  type: CharacterType,
  description: 'mutation(create) character description',
  args: {
    roomId: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'new character\'s roomId',
    },
    columnsJson: {
      type: GraphQLString,
      description: 'new character\'s columnsJson',
    },
    name: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'new character\'s name',
    },
    showOnResource: {
      type: GraphQLBoolean,
      description: 'new character\'s showOnResource',
    },
    text: {
      type: GraphQLString,
      description: 'new character\'s text',
    },
  },
  /**
   * @return {Promise}
   */
  resolve: async (...args) => {
    const [, {
      roomId,
      columnsJson,
      name,
      showOnResource,
      text,
    }] = args;
    Validator.test([
      ['character.roomId', roomId, { exist: true }],
//      ['character.columnsJson', columnsJson, {}],
      ['character.name', name, { exist: true }],
      // ['character.showOnResource', showOnResource, {}],
      // ['character.text', text, {}],
    ]);
    await mw.open();

    const newCharacter = new CharacterModel({
      roomId,
      columnsJson: columnsJson || '{text:columnsJson}',
      name,
      showOnResource: showOnResource || true,
      text: text || 'text',
    });

    const createdCharacter = await newCharacter.save();

    /* socket notify */
    const character = {
      id: createdCharacter._id,
      roomId: createdCharacter.roomId,
      columnsJson: createdCharacter.columnsJson,
      name: createdCharacter.name,
      showOnResource: createdCharacter.showOnResource,
      text: createdCharacter.text,
    }
    Io.roomEmit(roomId, 'characterInfoAdd', character);

    /* API response */
    return createdCharacter;
  }
};