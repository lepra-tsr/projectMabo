'use strict';

import io from 'socket.io-client';
import * as React from 'react';
import ReactDOM from 'react-dom';
import { GraphCaller, IGraphCallerVariables } from './GraphCaller';
import { MaboToast } from "./MaboToast";
import { RoomContainer } from "./RoomContainer";
import { PasswordDialog } from "./PasswordDialog";

window.onload = () => {
  io('http://localhost:3001');
  ReactDOM.render(<RoomContainer/>, document.getElementById('container'));

  const credential: null | { hash: string, roomId: string } = pickAuthFromCookie();
  if (!credential) {
    /* cookieがない場合 */
    /* paranoia: urlからroomIdを取得失敗した場合はlobbyへ */
    const roomId = getRoomIdFromUri();
    if (!roomId) {
      location.href = '/lobby';
      return false;
    }

    const title: string = document.title;
    PasswordDialog.show(roomId, title, () => {
      location.href = '/lobby';
    });

    /* パスワード入力フォームを表示 */
    MaboToast.danger('認証に失敗しました');
    return false;
  }
  /* cookieからトークンを取得して検証 */
  validateToken(credential)
    .then(() => {
      MaboToast.success('認証成功！');
    }).catch((e) => {
    /* NGの場合 */
    /* cookieを削除 */
    removeAuthCookie();
    /* パスワード入力フォームを表示 */
    console.error(e);
    MaboToast.danger('トークンが無効です。認証に失敗しました');
  });

  /**
   * @return {Promise}
   * @param credential
   */
  function validateToken(credential: { hash: string, roomId: string }) {
    const query = `query ($roomId:String! $hash:String!){
    validateToken(roomId:$roomId hash:$hash)
  }`;
    const {hash, roomId}: { hash: string, roomId: string } = credential;
    const variables: IGraphCallerVariables = {
      roomId,
      hash,
    };
    return GraphCaller.call(query, variables)
      .then((json) => {
        const {data} = json;
        const {validateToken: result}: { validateToken: boolean } = data;
        return result;
      })
  }

  function pickAuthFromCookie() {
    const cookie: string = document.cookie;
    const cookies = cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      let c = cookies[i];
      const [key, value] = c.split('=');
      if (key.trim() === 'mabo_auth') {
        const credential: { hash: string, roomId: string } = JSON.parse(decodeURIComponent(value));
        return credential
      }
    }
    return null;
  }

  function removeAuthCookie() {
    document.cookie = 'mabo_auth=;max-age=0';
  }

  function getRoomIdFromUri() {
    const uri: string = document.URL;
    const pattern = /\/room\/([0-9a-fA-F]{24})[#\?]?$/;
    const result = pattern.exec(uri);
    if (!result) {
      return null;
    }
    const roomId: string = result[1];
    return roomId;
  }
};