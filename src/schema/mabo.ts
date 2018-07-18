const {
  // buildSchema,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLList,
  GraphQLInt,
  GraphQLString,
  getNullableType,
} = require('graphql');

const RoomType = new GraphQLObjectType({
  name: 'Room',
  fields: {
    id: {
      type: GraphQLInt,
      resolve: () => {
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
});

const roomQuery = {
  type: new GraphQLList(RoomType),
  args: {
    id: {
      name: 'id',
      type: GraphQLInt,
    }
  },
  resolve: (room, args) => {
    console.log(args); // @DELETEME

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

export const resolver = {
  author: ({firstName, lastName}) => {
    return `hello world!${firstName}${lastName}`;
  },
  getFortuneCookie: ({number}) => {
    return `cookie: ${number}`;
  }
};