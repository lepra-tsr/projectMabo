const {
  GraphQLSchema,
  GraphQLObjectType,
} = require('graphql');
/*
 * schema
 * |- query
 * |    `- room
 * |- mutation
 * |    `- room
 * `- model
 *      |- Room
 *      |    |- schema.ts // mongoose schema
 *      |    `- type.ts   // graphql type (include schema.ts to generate type definition)
 *      `- Connection
 *           |- schema.ts // mongoose schema
 *           `- type.ts   // graphql type (include schema.ts to generate type definition)
 */
const { queryRoom } = require('./query/room/query');
const { createRoom } = require('./mutation/room/create');
const { updateRoom } = require('./mutation/room/update');
const { deleteRoom } = require('./mutation/room/delete');

const { queryToken } = require('./query/token/query');
const { validateToken } = require('./query/token/validate');
const { createToken } = require('./mutation/token/create');

const { queryUser } = require('./query/user/query');
const { updateUser } = require('./mutation/user/update');

const { queryChat } = require('./query/chat/query');
const { createChat } = require('./mutation/chat/create');

const { queryChannel } = require('./query/channel/query');
const { createChannel } = require('./mutation/channel/create');

const { queryCharacter } = require('./query/character/query');
const { createCharacter } = require('./mutation/character/create');

const { queryBoard } = require('./query/board/query');
const { createBoard } = require('./mutation/board/create');
const { deleteBoard } = require('./mutation/board/delete');

const { queryPiece } = require('./query/piece/query');
const { createPiece } = require('./mutation/piece/create');
const { updatePiece } = require('./mutation/piece/update');
const { deletePiece } = require('./mutation/piece/delete');

const { signedUrlForGet } = require('./query/image/signedUrlForGet');
const { signedUrlForPut } = require('./query/image/signedUrlForPut');
const { createImage } = require('./mutation/image/create');


const Query = new GraphQLObjectType({
  name: 'maboQuery',
  description: 'root query',
  fields: {
    room: queryRoom,
    token: queryToken,
    validateToken: validateToken,
    user: queryUser,
    chat: queryChat,
    channel: queryChannel,
    character: queryCharacter,
    board: queryBoard,
    piece: queryPiece,
    signedUrlForGet,
    signedUrlForPut,
  }
});

const Mutation = new GraphQLObjectType({
  name: 'maboMutation',
  description: 'root mutation',
  fields: {
    createRoom,
    updateRoom,
    deleteRoom,
    createToken,
    updateUser,
    createChat,
    createChannel,
    createCharacter,
    createBoard,
    deleteBoard,
    createPiece,
    updatePiece,
    deletePiece,
    createImage,
  }
});

export const schema = new GraphQLSchema({
  query: Query,
  mutation: Mutation,
});