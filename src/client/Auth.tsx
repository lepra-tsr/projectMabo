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
    const variables: IGraphCallerVariables = {roomId, password,};

    return new Promise((resolve, reject) => {
      return GraphCaller.call(query, variables)
        .then((json) => {
          const {data} = json;
          const {createToken}: { createToken?: { hash: string } } = data;

          if (!createToken) {
            reject(json);
            return false;
          }

          const hash: string = createToken.hash;
          Auth.setAuthToSS(roomId, hash);
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
      .catch((e) => {
        /* cookieの認証情報が誤っている場合 */
        Auth.removeAuthFromSS();
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


  static pickAuthFromSS() {
    const item: null | string = sessionStorage.getItem('mabo_auth');
    if (!item) {
      return null;
    }
    const credential: { hash: string, roomId: string } = JSON.parse(item);
    return credential;
  }

  static removeAuthFromSS() {
    sessionStorage.removeItem('mabo_auth');
  }

  static setAuthToSS(roomId: string, hash: string) {
    const credential: string = JSON.stringify({roomId, hash});
    sessionStorage.setItem('mabo_auth', credential);
  }
}