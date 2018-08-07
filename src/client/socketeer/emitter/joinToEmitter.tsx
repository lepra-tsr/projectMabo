'use strict';
import { Connection } from '../Connection';

export const joinToEmitter = (socket) => {
  let argJoinTo = {
    socketId: Connection.socketId,
    roomId: Connection.roomId,
    hash: Connection.hash,
  };
  return ['joinTo', argJoinTo];
}