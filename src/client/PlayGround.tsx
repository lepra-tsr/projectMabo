"use strict";
import * as React from "react";
import { Connection } from "./socketeer/Connection";
import { GraphCaller } from "./GraphCaller";
import { Pane } from './Pane';
interface IPieceProps {
  id: string;
  type: string;
  characterId: string;
  height: number;
  width: number;
  x: number;
  y: number;
}

export interface IBoardProps {
  id: string;
  pieces: IPieceProps[],
  height: number;
  width: number;
  x: number;
  y: number;
}

interface IPlayGroundState {
  boards: IBoardProps[],
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
    };
    GraphCaller.call(query, variables)
      .then((json) => {
        const { data } = json;
        const { board } = data;
        const boards:IBoardProps[] = board.map((b) => {
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
      });
  }

  render() {
    const playGroundStyle: React.CSSProperties = {
      position: 'fixed',
      border:'1px dashed lightgray'
    }
    return (
      <div style={playGroundStyle}>
        <Pane boards={this.state.boards}></Pane>
      </div>
    )
  }
}
