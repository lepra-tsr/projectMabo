const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
  res.render('index', {
    title: 'Mabo'
  });
});

router.get('/dnd', (req, res, next) => {
  res.render('dnd');
})

router.use('/lobby', require('./lobby'));
router.use('/room', require('./room'));

const graphqlHTTP = require('express-graphql');
const maboSchema = require('../server/schema/mabo');
const {
  schema
} = maboSchema;
router.use('/graphql', graphqlHTTP({
  schema,
  // rootValue: resolver,
  graphiql: true,
}));

module.exports = router;