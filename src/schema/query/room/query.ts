const {
  GraphQLList,
  GraphQLInt,
} = require('graphql');
const {Room} = require('../../model/Room/type');

const mongoose = require('mongoose');
const roomSchema = new mongoose.Schema({
  title: String,
  description: String,
  password: String,
}, {collection: 'rooms'});
const RoomModel = mongoose.model('Room', roomSchema);

export const roomQuery = {
  type: new GraphQLList(Room),
  description: 'query room description',
  args: {
    id: {
      type: GraphQLInt,
      description: 'room id',
    }
  },
  /**
   * @return {Promise}
   */
  resolve: (/*...args*/) => {

    const mongoose = require('mongoose');
    const dotenv = require('dotenv');
    const env = dotenv.config().parsed;
    const user = encodeURIComponent(env['MONGODB_USER']);
    const pwd = encodeURIComponent(env['MONGODB_PASSWORD']);
    const dbName = env['MONGODB_DATABASE'];
    const uri = env['MONGODB_SERVER_URI'];
    const port = env['MONGODB_PORT'];
    const ep = `mongodb://${user}:${pwd}@${uri}:${port}/${dbName}`;

    return mongoose.connect(ep, {useNewUrlParser: true})
      .then(() => {
        const query = RoomModel.find();
        query.collection(RoomModel.collection);
        return query.exec()
          .then((result) => {
            return result.map((r) => {
              return {
                id: r._id,
                title: r.title,
                description: r.description,
                password: r.password,
              }
            })
          });
      })
  },
};