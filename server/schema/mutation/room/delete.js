"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _a = require('graphql'), GraphQLList = _a.GraphQLList, GraphQLString = _a.GraphQLString;
var RoomType = require('../../model/Room/type').RoomType;
var RoomModel = require('../../model/Room/Model').RoomModel;
exports.deleteRoom = {
    type: new GraphQLList(RoomType),
    description: 'mutation room description',
    args: {
        title: {
            type: GraphQLString,
            description: 'room title',
        },
        description: {
            type: GraphQLString,
            description: 'room description',
        },
        password: {
            type: GraphQLString,
            description: 'room password',
        }
    },
    /**
     * @return {Promise}
     */
    resolve: function () {
        var mw = require('../../../util/MongoWrapper').MongoWrapper;
        return mw.open()
            .then(function () {
            var query = RoomModel.find();
            query.collection(RoomModel.collection);
            return query.exec()
                .then(function (result) {
                return result.map(function (r) {
                    return {
                        id: r._id,
                        title: r.title,
                        description: r.description,
                        password: r.password,
                    };
                });
            });
        });
    },
};
