"use strict";
const { MongoWrapper: mw } = require('../../util/MongoWrapper');
const { UserModel } = require("../../schema/model/User/Model");

export const disconnectedHandler = async ({ socket, nodeSocket, }: { socket, nodeSocket }) => {
  await mw.open()
  await UserModel.deleteMany({ socketId: socket.id }).exec()
};
