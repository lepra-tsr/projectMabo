const {
  GraphQLNonNull,
  GraphQLString,
  GraphQLBoolean,
} = require('graphql');
const { TokenModel } = require('../../model/Token/Model');
const { Validator } = require('../../util/Validator');
const { MongoWrapper: mw } = require("../../util/MongoWrapper");


export const validateToken = {
  type: GraphQLBoolean,
  description: 'query token description',
  args: {
    roomId: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'room id',
    },
    hash: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'token hash',
    },
  },
  resolve: (...args) => {
    const [/* source */, { roomId, hash }, /* context */] = args;
    Validator.test([
      ['token.roomId', roomId, { exist: true }],
      ['token.hash', hash, { exist: true }],
    ]);

    return new Promise((resolve, reject) => {

      return mw.open()
        .then(() => {
          const query = TokenModel.find();
          query.collection(TokenModel.collection);
          query.where({ roomId, hash });
          return query.exec()
            .then((result) => {
              console.log(result); // @DELETEME
              resolve(result.length === 1);
            })
        }).catch((e) => {
          reject(e);
        })
    })
  },
};