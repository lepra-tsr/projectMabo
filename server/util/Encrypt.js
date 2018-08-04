"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var crypto = require('crypto');
var dotenv = require('dotenv');
var env = dotenv.config().parsed;
var salt = env['SHA256_SALT'];
var Encrypt = /** @class */ (function () {
    function Encrypt() {
    }
    Encrypt.sha256 = function (data) {
        var hmac = crypto.createHmac('sha256', salt);
        hmac.update(data);
        var hash = hmac.digest('hex');
        return hash;
    };
    return Encrypt;
}());
exports.Encrypt = Encrypt;
