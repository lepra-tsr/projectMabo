"use strict";
import io from 'socket.io-client';
import { Socket } from 'socket.io';
import { MaboToast } from "../MaboToast";
import { joinInfoHandler } from './handler/joinInfoHandler';
import { joinToEmitter } from './emitter/joinToEmitter';
import { reconnectHandler } from './handler/reconnectHandler';

const ep = 'http://localhost';
const port = 3001;

export class Connection {
  static userName: string = 'デフォルト';
  static socket: Socket;
  static socketId: string;
  static hash: string;
  static roomId: string;

  static start({ hash, roomId }: { hash: string, roomId: string }) {
    const uri: string = `${ep}:${port}`;
    const socket = io(uri);
    Connection.roomId = roomId;
    Connection.hash = hash;
    Connection.socket = socket;
    Connection.initListener(socket);
  }

  static initListener(socket) {
    socket.on('connect', () => {
      console.log('connected!');
      MaboToast.success('ソケット通信を確立しました');
      Connection.socketId = socket.id;
      console.log(`socketId: ${Connection.socketId}`);

      /* join room */
      socket.emit(...joinToEmitter(socket));
    })

    socket.on('roomUserInfo', (roomUserInfo) => {
      /* @TODO roomUserInfoHandler */
      for (let i = 0; i < roomUserInfo.length; i++) {
        const { id, name, socketId } = roomUserInfo[i];
        console.log(id, name, socketId);
      }
    })

    socket.on('reconnect', (attempts: number) => {
      console.log('reconnect!');
      reconnectHandler(socket, attempts);
    })

    socket.on('hello', (args) => {
      console.log(args);
    });


    socket.on('joinInfo', (args: string) => {
      joinInfoHandler(socket, args);
    });

    socket.on('disconnect', (reason: string) => {
      console.log(`disconnected: ${reason}`);
    })
  }
}