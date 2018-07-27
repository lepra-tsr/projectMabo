const {
  GraphQLString,
  GraphQLNonNull,
} = require('graphql');
const { MongoWrapper: mw } = require('../../util/MongoWrapper');
const { RoomType } = require('../../model/Room/type');
const { RoomModel } = require('../../model/Room/Model');

export const roomCreate = {
  type: RoomType,
  description: 'mutation(create) room description',
  args: {
    title: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'new room\'s title',
    },
    description: {
      type: GraphQLString,
      description: 'new room\'s description',
    },
    password: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'new room\'s password',
    }
  },
  /**
   * @return {Promise}
   */
  resolve: (...args) => {
    const [, { title, description = '', password }] = args;

    if (!title || !password) {
      const msg = 'タイトルとパスワードは必須です';
      const p = new Promise((resolve) => {
        console.error(msg);
        resolve({
          userErrors: 'タイトルとパスワードは必須です'
        });
      });
      return p;
    }
    const trimmedLength = {
      title: title.trim().length,
      description: description.trim().length,
    };
    if (trimmedLength.title === 0 || trimmedLength.title > 50) {
      return {
        userErrors: `タイトルの文字長が短すぎるか、長すぎます(1文字以上50文字以下)`
      }
    }
    if (trimmedLength.description > 1000) {
      return {
        userErrors: `概要の文字長が長すぎます(1000文字以下)`
      }
    }

    return mw.open()
      .then(() => {
        const newRoom = new RoomModel({
          title,
          description,
          password,
        });
        return newRoom.save()
          .then((createdRoom) => {
            return createdRoom;
          });
      })
      .catch((e) => {
        console.error('error: ', e);
      });
  },
};