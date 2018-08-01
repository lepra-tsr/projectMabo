const {
  GraphQLNonNull,
  GraphQLString,
  GraphQLList,
} = require('graphql');
const {TokenType} = require('../../model/Token/type');
const {TokenModel} = require('../../model/Token/Model');
const {Validator} = require('../../util/Validator');
const {MongoWrapper: mw} = require("../../util/MongoWrapper");


export const queryToken = {
  type: new GraphQLList(TokenType),
  description: 'tokenの検索を行う。セキュリティの都合上、roomIdとhashは必須',
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
    const [/* source */, {roomId, hash}, /* context */] = args;
    Validator.test([
      ['token.roomId', roomId, {exist: true}],
      ['token.hash', hash, {exist: true}],
    ]);

    return new Promise((resolve, reject) => {
      return mw.open()
        .then(() => {
          const query = TokenModel.find();
          query.collection(TokenModel.collection);
          query.where({roomId, hash});
          return query.exec()
            .then((records) => {
              resolve(records);
            })
        }).catch((e) => {
          reject(e);
        })
    })
  },
};