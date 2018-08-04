"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _a = require('graphql'), GraphQLNonNull = _a.GraphQLNonNull, GraphQLString = _a.GraphQLString, GraphQLList = _a.GraphQLList;
var TokenType = require('../../model/Token/type').TokenType;
var TokenModel = require('../../model/Token/Model').TokenModel;
var mw = require("../../../util/MongoWrapper").MongoWrapper;
var Validator = require('../../../util/Validator').Validator;
exports.queryToken = {
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
    /**
     * @return {Promise}
     * @param args
     */
    resolve: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var _a = args[1], roomId = _a.roomId, hash = _a.hash;
        return new Promise(function (resolve, reject) {
            Validator.test([
                ['token.roomId', roomId, { exist: true }],
                ['token.hash', hash, { exist: true }],
            ]);
            return mw.open()
                .then(function () {
                var query = TokenModel.find();
                query.collection(TokenModel.collection);
                query.where({ roomId: roomId, hash: hash });
                return query.exec()
                    .then(function (records) {
                    resolve(records);
                });
            }).catch(function (e) {
                reject(e);
            });
        });
    },
};
