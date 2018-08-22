"use strict";
import * as React from "react";
import { Connection } from "./socketeer/Connection";
import { GraphCaller } from "./GraphCaller";
import { Pane } from './Pane';
import { MaboToast } from "./MaboToast";
import { Notifier } from "./Notifier";

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

    Notifier.on('boardInfoSync', this.boardInfoSyncHandler.bind(this));
  }

  boardInfoSyncHandler(boards) {
    this.setState({ boards });
  }

  loadAllObjects() {
    const query = `
    query ($roomId:String!){
      board(roomId: $roomId){
        id: _id
        roomId
        height
        width
        pieces {
          id: _id
          characterId
          roomId
          boardId
          type
          height
          width
          x
          y
        }
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
        const boards: IBoardProps[] = board;

        this.setState({ boards });
      });
  }

  render() {
    const playGroundStyle: React.CSSProperties = {
      width: '50%',

      // position: 'fixed',
      border: '1px dashed lightgray'
    }
    return (
      <div style={playGroundStyle}>
        <div>
          <h5>boards</h5>
          {this.renderBoards.call(this)}
          <input type="button" value="add board" onClick={this.onClickAddBoardButtonHandler.bind(this)} />
        </div>
        <Pane boards={this.state.boards}></Pane>
      </div>
    )
  }
  renderBoards() {
    const result: JSX.Element[] = [];
    const { boards } = this.state;
    for (let i_b = 0; i_b < boards.length; i_b++) {
      const b = boards[i_b];
      const { pieces } = b;
      const board = (
        <div key={b.id}>
          <p>
            <span>{b.id}, {b.width}x{b.height}</span>
            <input type="button" value="remove board" onClick={this.onClickRemoveBoardButtonHandler.bind(this, b.id)} />
          </p>
          <ul>
            {pieces.map((p) => (
              <li key={p.id}>
                <span>{p.id}</span>
                <input type="button" value="remove piece" onClick={this.onClickRemovePieceButtonHandler.bind(this, p.id)} />
              </li>
            ))}
          </ul>
          <input type="button" value="add piece" onClick={this.onClickAddPieceButtonHandler.bind(this, b.id)} />
        </div>
      )
      result.push(board);
    }

    return result;
  }

  onClickRemovePieceButtonHandler(pieceId) {

  }

  onClickAddPieceButtonHandler(boardId) {
    const mutation = `
    mutation ($roomId: String! $boardId: String!){
      createPiece(
        roomId: $roomId
        boardId: $boardId
      ) {
        id: _id
        characterId
        roomId
        boardId
        type
        height
        width
        x
        y
      }
    }`;
    const variables = {
      roomId: Connection.roomId,
      boardId,
    }
    GraphCaller.call(mutation, variables)
      .then((json) => {
        const { data } = json;
        console.log(data);
      })
      .catch((e) => {
        console.error(e);
        MaboToast.danger('コマの削除に失敗しました');
      })
  }

  onClickAddBoardButtonHandler() {
    const mutation = `
    mutation (
      $roomId: String!
      $height: Int!
      $width: Int!
    ){
      createBoard(
        roomId: $roomId
        height: $height
        width: $width
      ) {
        id: _id
        roomId
        height
        width
      }
    }`;
    const variables = {
      roomId: Connection.roomId,
      height: 300,
      width: 400,
    }
    GraphCaller.call(mutation, variables)
      .then((json) => {
        const { data } = json;
        console.log(data);
      })
      .catch((e) => {
        console.error(e);
        MaboToast.danger('ボードの作成に失敗しました');
      })
  }

  onClickRemoveBoardButtonHandler(boardId: string) {
    const mutation = `
    mutation ($boardId: String!){
      deleteBoard(id:$boardId) {
        id: _id
        roomId
        height
        width
      }
    }`;
    const variables = { boardId };
    GraphCaller.call(mutation, variables)
      .then((json) => {
        const { data } = json;
        console.log(data);
      })
      .catch((e) => {
        console.error(e);
        MaboToast.danger('ボードの作成に失敗しました');
      })
  }
}
