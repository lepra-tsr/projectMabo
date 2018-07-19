const {
  // buildSchema,
  GraphQLSchema,
  GraphQLObjectType,
  // GraphQLList,
  GraphQLInt,
  GraphQLString,
  getNullableType,
} = require('graphql');

const RoomType = new GraphQLObjectType({
  name: 'Room',
  fields: () => {
    return {
      id: {
        type: GraphQLInt,
        resolve: ({id, title, description, password}) => {
          console.log('args:', id, title, description, password); // @DELETEME
          return 0;
        }
      },
      title: {
        type: GraphQLString,
        resolve: () => {
          return 'it works. title!';
        }
      },
      description: {
        type: GraphQLString,
        resolve: () => {
          return 'it works. description!';
        }
      },
      password: {
        type: getNullableType(GraphQLString),
        resolve: () => {
          return 'it works. pwd!';
        }
      },
    }
  }
});

const roomQuery = {
  type: RoomType,
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
    console.log(room, id, title); // @DELETEME
    /* get rooms which id equals to ${id} */
    return {
      id: 0,
      title: '_title',
      description: '_desc',
      password: '_password',
    }
  }
};

const rootQuery = new GraphQLObjectType({
  name: 'rootQuery',
  description: 'This is rootQuery',
  fields: () => ({
    room: roomQuery,
    /* chat: chatQuery, ... */
  })
});
// https://github.com/aichbauer/express-graphql-boilerplate
export const schema = new GraphQLSchema({
  query: rootQuery
});

export const resolver = () => {

}