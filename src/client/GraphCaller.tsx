"use strict";

export class GraphCaller {
  static call() {
    const query = `query {
    room { _id title description }     
    }`;
    const variables = {};
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
    }).then((r) => r.json());
  }
}