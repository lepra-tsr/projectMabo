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

/**
 * Socket event の大まかな命名規則。REST的な動詞、或いは受信するデータの形式を反映する
 * <ul>
 * <li>${resourceName}Sync: 更新(UPDATE, PATCH的な変更)、削除、初期化時の洗い替え</li>
 * <li>${resourceName}Add: 追加(INSERT)。チャットログなど</li>
 * </ul>
 * @param socket
 */
  static initNotifier(socket) {
    socket.once('connect', () => {
      console.log('connected!');
      MaboToast.success('ソケット通信を確立しました');
      Connection.socketId = socket.id;
      console.log(`socketId: ${Connection.socketId}`);

      /* join room */
      socket.emit(...joinToEmitter(socket));
    })

    socket.on('roomUserSync', (roomUserInfo) => {
      Connection.users = [];
      for (let i = 0; i < roomUserInfo.length; i++) {
        const { id, name, socketId } = roomUserInfo[i];
        Connection.users.push({ id, name, socketId });
      }
      Notifier.emit('roomUserSync', Connection.users);
    })

    socket.on('chatTextAdd', (chat) => {
      console.log('chatTextAdd', chat);
      Notifier.emit('chatTextAdd', chat);
    })

    socket.on('channelInfoSync', (channel) => {
      console.log('channelInfoSync', channel);
      Notifier.emit('channelInfoSync', channel);
    })

    socket.on('characterInfoSync', (characters) => {
      console.log('characterInfoSync', characters);
      Notifier.emit('characterInfoSync', characters);
    })

    socket.on('boardInfoSync', (boards) => {
      console.log('boardInfoSync', boards);
      Notifier.emit('boardInfoSync', boards);
    })

    socket.on('pieceInfoSync', (pieces) => {
      console.log('pieceInfoSync', pieces);
      Notifier.emit('pieceInfoSync', pieces);
    })

    socket.on('reconnect', (attempts: number) => {
      console.log(`reConnect: ${socket.id}`);
      Connection.socketId = socket.id;
      /* after reconnect: join room */
      socket.emit(...joinToEmitter(socket));
      reconnectHandler(socket, attempts);
    })

    socket.on('joinInfo', (args: string) => {
      joinInfoHandler(socket, args);
    });

    socket.on('disconnect', (reason: string) => {
      console.log(`disconnected: ${reason}`);
    })
  }
}