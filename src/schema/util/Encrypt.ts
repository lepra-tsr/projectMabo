const crypto = require('crypto');
const dotenv = require('dotenv');
const env = dotenv.config().parsed;
const salt = env['SHA256_SALT'];

export class Encrypt {
  static sha256(data: string) {
    const hmac = crypto.createHmac('sha256', salt);
    hmac.update(data);
    const hash: string = hmac.digest('hex');

    return hash
  }
}