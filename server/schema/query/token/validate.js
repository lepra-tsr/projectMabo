"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _a = require('graphql'), GraphQLBoolean = _a.GraphQLBoolean, GraphQLNonNull = _a.GraphQLNonNull, GraphQLString = _a.GraphQLString;
var Validator = require('../../../util/Validator').Validator;
var TokenModel = require('../../model/Token/Model').TokenModel;
var mw = require("../../../util/MongoWrapper").MongoWrapper;
exports.validateToken = {
    type: GraphQLBoolean,
    description: 'verify token',
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
        Validator.test([
            ['token.roomId', roomId, { exist: true }],
            ['token.hash', hash, { exist: true }],
        ]);
        return new Promise(function (resolve, reject) {
            return mw.open()
                .then(function () {
                var query = TokenModel.find();
                query.collection(TokenModel.collection);
                query.where({ roomId: roomId, hash: hash });
                return query.exec()
                    .then(function (records) {
                    resolve(records.length === 1);
                });
            }).catch(function (e) {
                reject(e);
            });
        });
    }
};
