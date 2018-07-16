const express = require('express');
const router = express.Router();

const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const user = encodeURIComponent('mabo');
const pwd = encodeURIComponent('azatoth');
const dbName = 'mabo';
const uri = `mongodb://${user}:${pwd}@52.194.141.20:27017/${dbName}`;

router.get('/', (req, res, next) => {
  res.render('index', { title: 'Mabo' });
});

router.get('/db', (req, res, next) => {
  MongoClient.connect(uri, { useNewUrlParser: true }, (e, client) => {
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
