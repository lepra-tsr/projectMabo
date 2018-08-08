"use strict";
const { slg } = require("../../util/MaboLogger");
const { MongoWrapper: mw } = require('../../util/MongoWrapper');
const { UserModel } = require("../../schema/model/User/Model");

export const disconnectedHandler = ({
  socket,
  nodeSocket,
}: {
    socket;
    nodeSocket;
  }) => {
  return new Promise((resolve, reject) => {
    return mw.open()
      .then(() => {
        UserModel.deleteMany({ socketId: socket.id }).exec()
          .then(() => {
            resolve();
          })
          .catch(e => {
            reject(e);
          });
      })
  }).catch(e => {
    slg.debug(e);
  });
};
