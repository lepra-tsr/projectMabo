"use strict";

export interface IGraphCallerVariables {
  roomId?: string;
  password?: string;
}

export class GraphCaller {
  static call(query: string, variables: IGraphCallerVariables = {}) {
    return fetch('/graphql', {
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
        .then((json) => {
          if (json.hasOwnProperty('errors')) {
            const {errors} = json;
            for (let i_e = 0; i_e < errors.length; i_e++) {
              const message: string = errors[i_e].message;
              console.error(message);
            }
          }

          return json;
        });
    });
  }
}