const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const env = dotenv.config().parsed;

const user = encodeURIComponent(env['MONGODB_USER']);
const pwd = encodeURIComponent(env['MONGODB_PASSWORD']);
const dbName = env['MONGODB_DATABASE'];
const uri = env['MONGODB_SERVER_URI'];
const port = env['MONGODB_PORT'];
const ep = `mongodb://${user}:${pwd}@${uri}:${port}/${dbName}`;

router.get('/', (req, res, next) => {
  res.render('index', { title: 'Mabo' });
});

router.use('/lobby', require('./lobby'));

const graphqlHTTP = require('express-graphql');
const maboSchema = require('../schema/mabo');
const { schema } = maboSchema;
router.use('/graphql', graphqlHTTP({
  schema,
  // rootValue: resolver,
  graphiql: true,
}));

router.get('/db', (req, res, next) => {
  mongoose.connect(ep, { useNewUrlParser: true });

  const db = mongoose.connection;
  db.once('open', () => console.log('connected to mongodb'));

  const roomSchema = new mongoose.Schema({
    title: String,
    description: String,
    password: String,
  });
  const Room = mongoose.model('Room', roomSchema);
  const newRoom = new Room({
    title: 'sampleRoom',
    description: 'sampleDesc',
    password: 'samplepw'
  });
  newRoom.save((e) => {
    if (e) {
      return console.error(e);
    }

    Room.find((e, rooms) => {
      if (e) {
        return console.error(e);
      }
      console.log(rooms);
    });
  });
});

module.exports = router;
