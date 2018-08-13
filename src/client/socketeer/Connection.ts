"use strict";
import io from 'socket.io-client';
import { MaboToast } from "../MaboToast";
import { joinInfoHandler } from './handler/joinInfoHandler';
import { joinToEmitter } from './emitter/joinToEmitter';
import { reconnectHandler } from './handler/reconnectHandler';
import { Notifier } from '../Notifier';

const ep = 'http://localhost';
const port = 3001;

export class Connection {
  static userName: string = 'デフォルト';
  static socket;
  static socketId: string;
  static hash: string;
  static roomId: string;
  static users: { id: string, name: string, socketId: string }[];

  static start({ hash, roomId }: { hash: string, roomId: string }) {
    const uri: string = `${ep}:${port}`;
    const socket = io(uri);
    Connection.roomId = roomId;
    Connection.hash = hash;
    Connection.socket = socket;
    Connection.initNotifier(socket);
  }

  static initNotifier(socket) {
    socket.once('connect', () => {
      console.log('connected!');
      MaboToast.success('ソケット通信を確立しました');
      Connection.socketId = socket.id;
      console.log(`socketId: ${Connection.socketId}`);

      /* join room */
      socket.emit(...joinToEmitter(socket));
    })

    socket.on('roomUserInfo', (roomUserInfo) => {
      Connection.users = [];
      for (let i = 0; i < roomUserInfo.length; i++) {
        const { id, name, socketId } = roomUserInfo[i];
        Connection.users.push({ id, name, socketId });
      }
      Notifier.emit('roomUserInfo', Connection.users);
    })

    socket.on('chatText', (chat) => {
      console.log('chatText', chat);
      Notifier.emit('chatText', chat);
    })

    socket.on('channelInfo', (channel) => {
      console.log('channelInfo', channel);
      Notifier.emit('channelInfo', channel);
    })

    socket.on('characterInfo', (character) => {
      console.log('characterInfo', character);
      Notifier.emit('characterInfo', character);
    })

    socket.on('reconnect', (attempts: number) => {
      console.log(`reConnect: ${socket.id}`);
      Connection.socketId = socket.id;
      /* join room */
      socket.emit(...joinToEmitter(socket));
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