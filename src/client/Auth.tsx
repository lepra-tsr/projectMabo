"use strict";

import { GraphCaller, IGraphCallerVariables } from "./GraphCaller";

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

  static setCookie(roomId: string, hash: string) {
    const credential = encodeURIComponent(JSON.stringify({ roomId, hash }));
    const cookie = `mabo_auth=${credential}; max-age=300;`;
    document.cookie = `${cookie}`;
  }
}