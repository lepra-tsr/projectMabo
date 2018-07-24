const {
  // buildSchema,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLList,
  GraphQLInt,
  GraphQLString,
} = require('graphql');
// const {roomResolver} = require('./roomResolver');

// export const schema = buildSchema(`
//   type Query {
//     room(id: Int title: String): [Room]
//   }
//
//   type Room {
//     id: Int
//     title: String
//   }
// `);

const Room = new GraphQLObjectType({
  name: 'Room',
  fields: () => ({
    id: {type: GraphQLInt, resolve: (room) => room.id || 999},
    title: {type: GraphQLString, resolve: (room) => room.title || '999'},
    password: {type: GraphQLString, resolve: (room) => room.password || '999'},
  })
});

const RoomList = [
  {id: 1, title: 'title1', password: 'password1'},
  {id: 2, title: 'title2', password: 'password2'},
  {id: 3, title: 'title3', password: 'password3'},
];

/* 問い合わせ時のroomに対応 */
const Query = new GraphQLObjectType({
  name: 'mabo',
  description: 'root query',
  fields: {
    room: {
      type: new GraphQLList(Room),
      args: {
        id: {
          type: GraphQLInt,
          description: 'room id',
        }
      },
      resolve: (...args) => {
        console.log(args[0]); // @DELETEME
        console.log(args[1]); // @DELETEME
        return RoomList;
      },
    },
    connection: {
      type: GraphQLString,
      resolve: () => {
        return 'test connection';
      }
    }
  }
});

export const schema = new GraphQLSchema({
  query: Query,
});


// export const resolver = {
//   room: roomResolver,
//   // chat,
//   // user,
// };