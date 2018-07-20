const {
  buildSchema
} = require('graphql');
const {roomResolver} = require('./roomResolver');

export const schema = buildSchema(`
  type Query {
    room(id: Int title: String): [Room]
  }
  
  type Room {
    id: Int
    title: String
  }
`);


export const resolver = {
  room: roomResolver,
  // chat,
  // user,
};