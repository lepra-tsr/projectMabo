"use strict";
import * as React from "react";
import { Connection } from "./socketeer/Connection";
import { GraphCaller } from "./GraphCaller";

interface piece {
  id: string;
  type: string;
  characterId: string;
  height: number;
  width: number;
  x: number;
  y: number;
}

interface board {
  id: string;
  pieces: piece[],
  height: number;
  width: number;
  x: number;
  y: number;
}

interface IPlayGroundState {
  boards: board[],
}

export class PlayGround extends React.Component<{}, IPlayGroundState> {
  static instance?: PlayGround;
  constructor(props) {
    super(props);

    if (typeof PlayGround.instance === 'object') {
      return PlayGround.instance;
    }
    PlayGround.instance = this;

    this.state = {
      boards: []
    }
    this.loadAllObjects();
  }

  loadAllObjects() {
    const query = `
    query ($roomId:String!){
      board(roomId: $roomId){
        _id
        roomId
        height
        width
      }
    }
    `;
    const variables = {
      roomId: Connection.roomId,
    }
    GraphCaller.call(query, variables)
      .then((json) => {
        const { data } = json;
        const { board } = data;
        const boards = board.map((b) => {
          return {
            id: b._id,
            roomId: b.roomId,
            height: b.height,
            width: b.width,
            pawns: [],
            x: 0,
            y: 0,
          }
        })
        this.setState({ boards });
      })
  }

  render() {
    return (
      <div style={{ alignSelf: 'stretch', display: 'flex', }}>
        <div>
          <input type="button" value="add board" />
        </div>
        <div style={{ width: '400px', backgroundColor: 'dimgray', position: 'relative' }}>
          {this.state.boards.map((b) => {
            const style: React.CSSProperties = {
              position: 'absolute',
              width: b.width,
              height: b.height,
              top: b.y,
              left: b.x,
              backgroundColor: 'ghostwhite',
            }
            return (<div key={b.id} style={style} ></div>)
          })}
        </div>
      </div>
    )
  }
}
