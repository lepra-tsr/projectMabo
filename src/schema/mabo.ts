const {
  // buildSchema,
  GraphQLSchema,
  GraphQLObjectType,
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

const MaboType = new GraphQLObjectType({
  name: 'mabo',
  description: 'mabo type',
  fields: {
    rooms: {
      type: RoomType,
      resolve: () => {
        return {
          id: 0,
          title: 'heyaya',
          description: 'heyaya',
          password: 'heyaya',
        };
      }
    },
  }
});

export const schema = new GraphQLSchema({
  query: MaboType
});

export const resolver = {
  author: ({firstName, lastName}) => {
    return `hello world!${firstName}${lastName}`;
  },
  getFortuneCookie: ({number}) => {
    return `cookie: ${number}`;
  }
};