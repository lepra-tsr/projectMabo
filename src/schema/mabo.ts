const {
  // buildSchema,
  GraphQLSchema,
  GraphQLObjectType,
  // GraphQLList,
  GraphQLInt,
  GraphQLString,
  // getNullableType,
} = require('graphql');

// const RoomType = new GraphQLObjectType({
//   name: 'Room',
//   fields: {
//     id: {
//       type: GraphQLInt,
//       resolve: () => {
//         return 0;
//       }
//     },
//     title: {
//       type: GraphQLString,
//       resolve: () => {
//         return 'it works. title!';
//       }
//     },
//     description: {
//       type: GraphQLString,
//       resolve: () => {
//         return 'it works. description!';
//       }
//     },
//     password: {
//       type: getNullableType(GraphQLString),
//       resolve: () => {
//         return 'it works. pwd!';
//       }
//     },
//   }
// });

const roomQuery = {
  type: GraphQLString,
  args: {
    id: {
      name: 'id',
      type: GraphQLInt,
    },
    title: {
      name: 'title',
      type: GraphQLString,
    }
  },
  resolve: (room, {id, title}) => {
    /* get rooms which id equals to ${id} */
    console.log(id,title); // @DELETEME
    return `room which has id:${id}, title:${title}`;
  }
};

const rootQuery = new GraphQLObjectType({
  name: 'rootQuery',
  description: 'This is rootQuery',
  fields: () => ({room: roomQuery})
});
// https://github.com/aichbauer/express-graphql-boilerplate
export const schema = new GraphQLSchema({
  query: rootQuery
});