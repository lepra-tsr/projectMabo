"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _a = require('graphql'), GraphQLList = _a.GraphQLList, GraphQLString = _a.GraphQLString;
var RoomType = require('../../model/Room/type').RoomType;
var RoomModel = require('../../model/Room/Model').RoomModel;
exports.queryRoom = {
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
    resolve: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var _id = args[1]._id;
        var mw = require('../../../util/MongoWrapper').MongoWrapper;
        return mw.open()
            .then(function () {
            var query = RoomModel.find();
            query.collection(RoomModel.collection);
            if (_id) {
                query.where({ _id: _id });
            }
            return query.exec()
                .then(function (result) {
                return result.map(function (r) {
                    return {
                        _id: r._id,
                        title: r.title,
                        description: r.description,
                        password: '*secret*' /*r.password*/,
                    };
                });
            });
        });
    },
};
