"use strict";

import { GraphCaller, IGraphCallerVariables } from "./GraphCaller";
import { MaboToast } from "./MaboToast";
import { PasswordDialog } from "./PasswordDialog";

export class Auth {
  /**
   * @return {Promise }
   */
  static verify(roomId: string, password: string) {
    const query = `mutation ($roomId:String! $password:String!){
      createToken(roomId:$roomId password:$password) {
        roomId
        hash
        timestamp
        expireDate
        _id
      }
    }`;
    const variables: IGraphCallerVariables = { roomId, password, };

    return new Promise((resolve, reject) => {
      return GraphCaller.call(query, variables)
        .then((json) => {
          const { data } = json;
          const { createToken }: { createToken?: { hash: string } } = data;

          if (!createToken) {
            reject(json);
            return false;
          }

          const hash: string = createToken.hash;
          Auth.setCookie(roomId, hash);
          resolve(json);
        })
        .catch((e) => {
          console.error(e);
          reject(e);
        })
    })
  }

  static validateToken(credential: { hash: string, roomId: string }) {
    const query = `query ($roomId:String! $hash:String!){
      validateToken(roomId:$roomId hash:$hash)
    }`;
    const { hash, roomId }: { hash: string, roomId: string } = credential;
    const variables: IGraphCallerVariables = {
      roomId,
      hash,
    };
    return GraphCaller.call(query, variables)
      .then((json) => {
        const { data } = json;
        const { validateToken: result }: { validateToken: boolean } = data;
        return result;
      })
      .catch((e) => {
        /* cookieの認証情報が誤っている場合 */
        Auth.removeAuthCookie();
        MaboToast.danger('トークンが無効です。認証に失敗しました');
        Auth.invalidAuthFromCookieHandler();
        throw e;
      });
  }

  static invalidAuthFromCookieHandler() {
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

  static pickAuthFromCookie() {
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

  static getRoomIdFromUri() {
    const uri: string = document.URL;
    const pattern = /\/room\/([0-9a-fA-F]{24})[#\?]?$/;
    const result = pattern.exec(uri);
    if (!result) {
      return null;
    }
    const roomId: string = result[1];
    return roomId;
  }

  static removeAuthCookie() {
    document.cookie = 'mabo_auth=;max-age=0';
  }

  static setCookie(roomId: string, hash: string) {
    const credential = encodeURIComponent(JSON.stringify({ roomId, hash }));
    const cookie = `mabo_auth=${credential}; max-age=300;`;
    document.cookie = `${cookie}`;
  }
}