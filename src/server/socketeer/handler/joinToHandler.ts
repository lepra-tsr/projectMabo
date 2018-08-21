"use strict";
const { slg } = require("../../util/MaboLogger");
const { MongoWrapper: mw } = require('../../util/MongoWrapper');
const { TokenModel } = require("../../schema/model/Token/Model");
const { UserModel } = require("../../schema/model/User/Model");

export const joinToHandler = ({ socket, nodeSocket, socketId, roomId, hash, name }: {
  socket;
  nodeSocket;
  socketId: string;
  roomId: string;
  hash: string;
  name: string;
}) => {
  socket.join(roomId, () => {
    slg.debug(`${socketId} -> joins to: ${roomId}, hash: ${hash}`);
    nodeSocket.in(roomId).emit("joinInfo", `here comes: ${socketId}`);
    nodeSocket.in(roomId).clients(async (e, clients) => {
      if (e) { throw e }
      const roomUserInfo = await userJoinTo(socketId, roomId, hash, name, clients);
      nodeSocket.in(roomId).emit("roomUserSync", roomUserInfo);
    });
  });
}

/**
 * 
 * @param socketId
 * @param roomId 
 * @param hash 
 * @return {Promise}
 */
function userJoinTo(socketId: string, roomId: string, hash: string, name: string, clients: string[]) {
  return new Promise(async (resolve) => {
    await mw.open()
    slg.info(name);
    /* get token */
    const tokenArray = await TokenModel
      .find()
      .where({ $and: [{ hash }, { roomId }] })
      .exec();

    const { _id: tokenId }: { _id: string } = tokenArray[0];
    slg.debug(`${socketId} -> token found: ${tokenId}`)

    /* insert user */
    const newUser = new UserModel({ roomId, socketId, tokenId, name, });
    const createdUser = await newUser.save()
    slg.debug(`${socketId} -> user saved: ${createdUser._id}`)

    /* delete broken connection */
    await UserModel
      .deleteMany({ $and: [{ roomId: { $eq: roomId } }, { socketId: { $not: { $in: clients } } }] })
      .exec();

    /* get roomUserInfomation */
    const users = await UserModel.find().where({ roomId }).exec();

    const socketIds = users.map((user) => user.socketId);
    slg.debug(`${socketId} -> in roomId: ${roomId}, members are [${socketIds.length}]: [${socketIds}]`);

    const roomUserInfo = users.map(u => ({ id: u._id, name: u.name, socketId: u.socketId }));
    resolve(roomUserInfo);
  });
}
