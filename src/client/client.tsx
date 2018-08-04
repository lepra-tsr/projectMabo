'use strict';

import * as React from 'react';
import ReactDOM from 'react-dom';
import { MaboToast } from "./MaboToast";
import { RoomContainer } from "./RoomContainer";
import { Auth } from "./Auth";
import { Connection } from "./Connection";

window.onload = () => {
  ReactDOM.render(<RoomContainer/>, document.getElementById('container'));

  const credential: null|{ hash: string, roomId: string } = Auth.pickAuthFromSS();
  if (!credential) {
    MaboToast.danger('認証情報が見つかりませんでした。認証が必要です');
    Auth.invalidAuthFromCookieHandler();
    return false;
  }

  const {hash, roomId} = credential;
  Auth.validateToken(credential)
    .then(() => {
      MaboToast.success('認証成功！');
      Connection.start({ hash,roomId });
      RoomContainer.sessionStart();
    })
    .catch((e) => {
      console.log(e);
    });
};