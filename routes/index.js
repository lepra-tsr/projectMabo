const express = require('express');
const router = express.Router();

const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
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

router.get('/db', (req, res, next) => {
  MongoClient.connect(ep, { useNewUrlParser: true }, (e, client) => {
    if (e) {
      throw e;
    }
    const db = client.db('mabo');
    db.collection('connection').find().toArray((e, docs) => {
      res.status(200).send(docs);
    });
  });
});

module.exports = router;
