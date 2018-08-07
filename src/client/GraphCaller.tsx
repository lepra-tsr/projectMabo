"use strict";

export interface IGraphCallerVariables {
  roomId?: string;
  password?: string;
  hash?: string;
  socketId?: string;
  name?: string;
}

export interface IFetchResult {
  data?: any;
  errors?: any;
}

export class GraphCaller {
  static call(query: string, variables: IGraphCallerVariables = {}) {
    return new Promise<IFetchResult>((resolve, reject) => {
      fetch('/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables,
        })
      }).then((r) => {
        return r.json()
          .then((json: IFetchResult) => {
            const isError = json.hasOwnProperty('errors');
            if (isError) {
              const { errors } = json;
              for (let i_e = 0; i_e < errors.length; i_e++) {
                const message: string = errors[i_e].message;
                console.error(message);
              }
              reject(json);
            }

            resolve(json);
          });
      });
    })
  }
}