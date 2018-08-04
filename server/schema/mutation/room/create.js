"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _a = require('graphql'), GraphQLString = _a.GraphQLString, GraphQLNonNull = _a.GraphQLNonNull;
var mw = require('../../../util/MongoWrapper').MongoWrapper;
var RoomType = require('../../model/Room/type').RoomType;
var RoomModel = require('../../model/Room/Model').RoomModel;
var Validator = require('../../../util/Validator').Validator;
exports.createRoom = {
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
    resolve: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return new Promise(function (resolve, reject) {
            var _a = args[1], title = _a.title, _b = _a.description, description = _b === void 0 ? '' : _b, password = _a.password;
            Validator.test([
                ['room.title', title, { exist: true }],
                ['room.description', description, {}],
                ['room.password', password, { exist: true }],
            ]);
            mw.open()
                .then(function () {
                var newRoom = new RoomModel({
                    title: title,
                    description: description,
                    password: password,
                });
                return newRoom.save()
                    .then(function (createdRoom) {
                    resolve(createdRoom);
                });
            })
                .catch(function (e) {
                console.error('error: ', e);
                reject(e);
            });
        });
    },
};
