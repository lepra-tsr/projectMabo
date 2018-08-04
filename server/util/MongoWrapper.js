"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose = require('mongoose');
var dotenv = require('dotenv');
var MongoWrapper = /** @class */ (function () {
    function MongoWrapper() {
        throw new Error('do not construct me!');
    }
    MongoWrapper.open = function () {
        var env = dotenv.config().parsed;
        var user = encodeURIComponent(env['MONGODB_USER']);
        var pwd = encodeURIComponent(env['MONGODB_PASSWORD']);
        var dbName = env['MONGODB_DATABASE'];
        var uri = env['MONGODB_SERVER_URI'];
        var port = env['MONGODB_PORT'];
        var ep = "mongodb://" + user + ":" + pwd + "@" + uri + ":" + port + "/" + dbName;
        return mongoose.connect(ep, {
            useNewUrlParser: true,
            connectTimeoutMS: 10000,
            socketTimeoutMS: 15000,
        })
            .catch(function (e) {
            console.error("database connection failed: ", e);
        });
    };
    MongoWrapper.close = function () {
        mongoose.disconnect();
    };
    return MongoWrapper;
}());
exports.MongoWrapper = MongoWrapper;
