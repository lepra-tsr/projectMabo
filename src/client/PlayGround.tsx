"use strict";
import * as React from "react";
import { Connection } from "./socketeer/Connection";
import { GraphCaller } from "./GraphCaller";
import { Pane } from './Pane';
import { Notifier, notifier } from "./Notifier";

export interface IPieceProps {
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

export interface IPlayGroundState {
  boards: IBoardProps[],
  pieces: IPieceProps[];
}

export class PlayGround extends React.Component<{}, IPlayGroundState> {
  static instance?: PlayGround;
  notifiers: notifier[] = [];
  hasMounted: boolean = false;
  constructor(props) {
    super(props);

    if (typeof PlayGround.instance === 'object') {
      return PlayGround.instance;
    }
    PlayGround.instance = this;

    this.state = {
      boards: [],
      pieces: [],
    }
    this.notifiers.push(
      Notifier.on('boardInfoSync', this.boardInfoSyncHandler.bind(this)),
      Notifier.on('pieceInfoSync', this.pieceInfoSyncHandler.bind(this)),
    );
  }

  componentDidMount() {
    this.hasMounted = true;
    this.loadAllObjects();
  }

  componentWillUnmount() {
    this.hasMounted = false;
    Notifier.offs(this.notifiers);
  }

  boardInfoSyncHandler(boards) {
    this.setState({ boards });
  }

  pieceInfoSyncHandler(pieces) {
    this.setState({ pieces });
  }

  loadAllObjects() {
    const query = `
    query ($roomId:String!){
      board(roomId: $roomId){
        id: _id
        roomId
        height
        width
      }
      piece(roomId: $roomId) {
        id: _id
        characterId
        roomId
        type
        height
        width
        x
        y
      }
    }`;
    const variables = {
      roomId: Connection.roomId,
    };
    GraphCaller.call(query, variables)
      .then((json) => {
        const { data } = json;
        const { board, piece } = data;
        const boards: IBoardProps[] = board;
        const pieces: IPieceProps[] = piece;

        if (!this.hasMounted) {
          console.warn('[warn] unmount後のコンポーネントでのstateの更新をスキップしました');
          return false;
        }
        this.setState({ boards, pieces });
      });
  }

  render() {
    const playGroundStyle: React.CSSProperties = {
      width: '50%',
      height: '700px',
      // position: 'fixed',
      border: '1px dashed lightgray'
    }
    return (
      <div style={playGroundStyle}>

        <Pane boards={this.state.boards} pieces={this.state.pieces} />
      </div>
    )
  }
}
