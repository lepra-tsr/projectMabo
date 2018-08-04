"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _a = require('graphql'), GraphQLString = _a.GraphQLString, GraphQLNonNull = _a.GraphQLNonNull;
var mw = require('../../../util/MongoWrapper').MongoWrapper;
var _b = require('../../../util/Validator'), Validator = _b.Validator, RoomValidator = _b.RoomValidator;
var Encrypt = require("../../../util/Encrypt").Encrypt;
var TokenType = require('../../model/Token/type').TokenType;
var TokenModel = require('../../model/Token/Model').TokenModel;
exports.createToken = {
    type: TokenType,
    description: 'mutation(create) token description',
    args: {
        roomId: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'new token\'s title',
        },
        password: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'new token\'s description',
        },
    },
    /**
     * @return {Promise}
     */
    resolve: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return new Promise(function (resolve, reject) {
            var _a = args[1], roomId = _a.roomId, password = _a.password;
            Validator.test([
                ['room.id', roomId, { exist: true }],
                ['room.password', password, { exist: true }],
            ]);
            return mw.open()
                .then(function () {
                var pExist = RoomValidator.validateRoomExists(roomId);
                var pAuth = RoomValidator.validateRoomAuth(roomId, password);
                return Promise.all([pExist, pAuth])
                    .then(function () {
                    var timestamp = Date.now();
                    var hash = Encrypt.sha256(password + timestamp);
                    var milliSecondsOfDay = 60 * 60 * 24 * 1000;
                    var expireDate = timestamp + milliSecondsOfDay;
                    var newToken = new TokenModel({
                        roomId: roomId,
                        hash: hash,
                        timestamp: timestamp,
                        expireDate: expireDate,
                    });
                    return newToken.save()
                        .then(function (createdToken) {
                        resolve(createdToken);
                    });
                });
            }).catch(function (e) {
                reject(e);
            });
        });
    },
};
