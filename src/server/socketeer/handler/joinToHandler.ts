"use strict";
const { slg } = require("../../util/MaboLogger");

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
    slg.debug(` -> ${socketId} joins to: ${roomId}, hash: ${hash}`);
    nodeSocket.in(roomId).emit("joinInfo", `here comes: ${socketId}`);

    return new Promise((resolve, reject) => {
      /* get token */
      const query = TokenModel.find();
      query.where({ $and: [{ hash }, { roomId }] });
      return query.exec()
        .then(tokenArray => {
          const { _id: tokenId }: { _id: string } = tokenArray[0];
          slg.debug(`  -> token found: ${tokenId}`)
          /* insert user */
          const newUser = new UserModel({
            roomId,
            socketId,
            tokenId,
            name: "",
          });
          return newUser.save()
            .then(createdUser => {
              slg.debug(`   -> user saved: ${createdUser._id}`)
              /* delete broken connection */
              nodeSocket.in(roomId).clients((e, clients) => {
                if (e) { reject(e) };
                const deleteQuery = UserModel.deleteMany({
                  $and: [
                    { roomId: { $eq: roomId } },
                    { socketId: { $not: { $in: clients } } }
                  ]
                });
                deleteQuery.exec()
                  .then(() => {
                    const query = UserModel.find();
                    query.where({ roomId });
                    query.exec()
                      .then((users) => {
                        const sockets = users.map((user) => user.socketId);
                        slg.debug(`in roomId: ${roomId}, members are [${sockets.length}]: [${sockets}]`);
                        const query = UserModel.find();
                        query.collection(UserModel.collection);
                        query.where({ roomId });

                        return query.exec().then(userArray => {
                          const roomUserInfo = userArray.map(user => {
                            const { _id, name, socketId } = user;

                            return { id: _id, name, socketId };
                          });
                          nodeSocket.in(roomId).emit("roomUserInfo", roomUserInfo);
                          resolve(createdUser);
                        });
                      })
                  })
              })
            });
        })
        .catch(e => {
          slg.debug(e);
          reject(e);
        });
    });
  });
}
