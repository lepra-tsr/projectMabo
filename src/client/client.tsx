'use strict';

import io from 'socket.io-client';
import * as React from 'react';
import ReactDOM from 'react-dom';
import { MaboToast } from "./MaboToast";
import { RoomContainer } from "./RoomContainer";
import { PasswordDialog } from "./PasswordDialog";
import { Auth } from "./Auth";

window.onload = () => {
  io('http://localhost:3001');
  ReactDOM.render(<RoomContainer/>, document.getElementById('container'));

  const credential: null|{ hash: string, roomId: string } = Auth.pickAuthFromCookie();
  if (!credential) {
    MaboToast.danger('認証情報が見つかりませんでした。認証が必要です');
    invalidAuthFromCookieHandler();
    return false;
  }

  Auth.validateToken(credential)
    .then(() => {
      MaboToast.success('認証成功！');
    })
    .catch((e) => {
      /* cookieの認証情報が誤っている場合 */
      Auth.removeAuthCookie();
      MaboToast.danger('トークンが無効です。認証に失敗しました');
      invalidAuthFromCookieHandler();
    });

  function invalidAuthFromCookieHandler() {
    const roomId = Auth.getRoomIdFromUri();
    if (!roomId) {
      /* URIからroomIDが取得できない場合はlobbyへ */
      location.href = '/lobby';
      return false;
    }

    const title: string = document.title;
    PasswordDialog.show(roomId, title, () => {
      location.href = '/lobby';
    });
  }
};