const {
  buildSchema
} = require('graphql');
const roomResolver = require('./roomResolver');

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
  room: ({id, title}) => {
    /*
     * ルーム検索用API
     * 検索条件を検索用の内部APIへ渡して、その検索結果(Room情報の配列)を返却する
     */
    // @TODO interface
    return roomResolver(id, title);
  },
  // chat,
  // user,
};