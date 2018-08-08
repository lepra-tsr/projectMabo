"use strict";
const { slg } = require("../../util/MaboLogger");
const { MongoWrapper: mw } = require('../../util/MongoWrapper');
const { TokenModel } = require("../../schema/model/Token/Model");
const { UserModel } = require("../../schema/model/User/Model");

export const joinToHandler = ({ socket, nodeSocket, socketId, roomId, hash, }: {
  socket;
  nodeSocket;
  socketId: string;
  roomId: string;
  hash: string;
}) => {
  socket.join(roomId, () => {
    slg.debug(`${socketId} -> joins to: ${roomId}, hash: ${hash}`);
    nodeSocket.in(roomId).emit("joinInfo", `here comes: ${socketId}`);
    nodeSocket.in(roomId).clients((e, clients) => {
      if (e) { throw e }
      userJoinTo(socketId, roomId, hash, clients)
        .then((roomUserInfo) => {
          nodeSocket.in(roomId).emit("roomUserInfo", roomUserInfo);
        })
    })
  });
}

/**
 * 
 * @param socketId
 * @param roomId 
 * @param hash 
 * @return {Promise}
 */
function userJoinTo(socketId: string, roomId: string, hash: string, clients: string[]) {
  return new Promise((resolve, reject) => {
    return mw.open()
      .then(() => {

        /* get token */
        const query = TokenModel.find();
        query.where({ $and: [{ hash }, { roomId }] });
        return query.exec()
          .then(tokenArray => {
            const { _id: tokenId }: { _id: string } = tokenArray[0];
            slg.debug(`${socketId} -> token found: ${tokenId}`)

            /* insert user */
            const newUser = new UserModel({
              roomId,
              socketId,
              tokenId,
              name: "",
            });
            return newUser.save()
              .then(createdUser => {
                slg.debug(`${socketId} -> user saved: ${createdUser._id}`)

                /* delete broken connection */
                const deleteQuery = UserModel.deleteMany({
                  $and: [
                    { roomId: { $eq: roomId } },
                    { socketId: { $not: { $in: clients } } }
                  ]
                });
                deleteQuery.exec()
                  .then(() => {

                    /* get roomUserInfomation */
                    const query = UserModel.find();
                    query.where({ roomId });
                    query.exec()
                      .then((users) => {
                        const socketIds = users.map((user) => user.socketId);
                        slg.debug(`${socketId} -> in roomId: ${roomId}, members are [${socketIds.length}]: [${socketIds}]`);

                        const roomUserInfo = users.map(u => ({ id: u._id, name: u.name, socketId: u.socketId }));
                        resolve(roomUserInfo);
                      })
                  })
              });
          })
      })
      .catch(e => {
        slg.debug(e);
        reject(e);
      });
  });
}
