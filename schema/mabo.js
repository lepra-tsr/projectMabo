"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var buildSchema = require('graphql').buildSchema;
var roomResolver = require('./roomResolver');
exports.schema = buildSchema("\n  type Query {\n    room(id: Int title: String): [Room]\n  }\n  \n  type Room {\n    id: Int\n    title: String\n  }\n");
exports.resolver = {
    room: function (_a) {
        var id = _a.id, title = _a.title;
        /*
         * ルーム検索用API
         * 検索条件を検索用の内部APIへ渡して、その検索結果(Room情報の配列)を返却する
         */
        // @TODO interface
        return roomResolver(id, title);
    },
};
