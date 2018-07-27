const mongoose = require('mongoose');
const dotenv = require('dotenv');

export class MongoWrapper {
  constructor() {
    throw new Error('do not construct me!');
  }

  static open() {
    const env = dotenv.config().parsed;
    const user = encodeURIComponent(env['MONGODB_USER']);
    const pwd = encodeURIComponent(env['MONGODB_PASSWORD']);
    const dbName = env['MONGODB_DATABASE'];
    const uri = env['MONGODB_SERVER_URI'];
    const port = env['MONGODB_PORT'];
    const ep = `mongodb://${user}:${pwd}@${uri}:${port}/${dbName}`;
    return mongoose.connect(ep, {
        useNewUrlParser: true,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 15000,
      })
      .catch((e) => {
        console.error(`database connection failed: `, e);
      })
  }

  static close(){
    mongoose.disconnect();
  }
}