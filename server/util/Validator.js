"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var baseRule = {
    room: {
        id: {
            type: 'string',
            regexp: /[0-9a-fA-F]{24}/,
        },
        title: {
            type: 'string',
            regexp: /[^\s]{1,50}/,
        },
        description: {
            type: 'string',
            regexp: /[^\s]{0,1000}/,
        },
        password: {
            type: 'string',
            regexp: /[^\s]{0,1000}/,
        },
    },
    token: {
        roomId: {
            equalTo: 'room.id',
        },
        hash: {
            type: 'string',
            regexp: /[0-9a-fA-F]{64}/,
        },
    }
};
var Validator = /** @class */ (function () {
    function Validator() {
    }
    Validator.test = function (args) {
        for (var i = 0; i < args.length; i++) {
            var _a = args[i], key = _a[0], v = _a[1], _b = _a[2], _rule = _b === void 0 ? {} : _b;
            var br = Validator.digWithPath(baseRule, key);
            var rule = Object.assign(_rule, br);
            if (Object.keys(rule).length === 0) {
                throw new Error('implementation error: バリデーション未定義');
            }
            if (rule.hasOwnProperty('exist')) {
                if (rule.exist && typeof v === 'undefined') {
                    Validator.raiseValidationError("exist:\u5FC5\u9808\u30D1\u30E9\u30E1\u30FC\u30BF\u3067\u3059");
                }
            }
            if (rule.hasOwnProperty('type')) {
                if (typeof v !== rule.type) {
                    Validator.raiseValidationError("type:\u578B\u304C" + rule.type + "\u3067\u306F\u3042\u308A\u307E\u305B\u3093");
                }
            }
            if (rule.hasOwnProperty('regexp')) {
                if (!rule.regexp.test(v)) {
                    Validator.raiseValidationError("regexp:\u6B63\u898F\u8868\u73FE" + rule.regexp + "\u306B\u30DE\u30C3\u30C1\u3057\u307E\u305B\u3093");
                }
            }
        }
        return true;
    };
    Validator.digWithPath = function (rule, path) {
        var paths = path.split('.');
        var r = rule;
        for (var i = 0; i < paths.length; i++) {
            var p = paths[i];
            if (!r.hasOwnProperty(p)) {
                throw new Error("implementation error: \u30D0\u30EA\u30C7\u30FC\u30B7\u30E7\u30F3\u672A\u5B9A\u7FA9 (" + path + ")");
            }
            r = r[p];
        }
        if (r.hasOwnProperty('equalTo')) {
            var path_1 = r['equalTo'];
            r = Validator.digWithPath(baseRule, path_1);
        }
        return r;
    };
    Validator.raiseValidationError = function (msg) {
        throw new Error("validation error: " + msg);
    };
    Validator.raiseResourceNotFoundError = function (msg) {
        throw new Error("resource not found error: " + msg);
    };
    Validator.raiseAuthenticationFailedError = function (msg) {
        throw new Error("authentication failed error: " + msg);
    };
    return Validator;
}());
exports.Validator = Validator;
var RoomModel = require('../schema/model/Room/Model').RoomModel;
var ObjectId = require('mongodb').ObjectId;
var RoomValidator = /** @class */ (function () {
    function RoomValidator() {
    }
    RoomValidator.validateRoomExists = function (roomId) {
        var query = RoomModel.find();
        query.collection(RoomModel.collection);
        query.where({ _id: ObjectId(roomId) });
        return query.exec()
            .then(function (result) {
            if (result.length === 0) {
                var msg = 'room: ルームが見つかりません';
                Validator.raiseResourceNotFoundError(msg);
            }
        });
    };
    RoomValidator.validateRoomAuth = function (roomId, password) {
        var query = RoomModel.find();
        query.collection(RoomModel.collection);
        query.where({ _id: ObjectId(roomId), password: password });
        return query.exec()
            .then(function (result) {
            if (result.length === 0) {
                var msg = 'room: 認証に失敗しました';
                Validator.raiseAuthenticationFailedError(msg);
            }
        });
    };
    return RoomValidator;
}());
exports.RoomValidator = RoomValidator;
