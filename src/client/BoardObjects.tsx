"use strict";
import * as React from "react";
import { IPlayGroundState, IBoardProps, IPieceProps } from "./PlayGround";
import { notifier, Notifier } from "./Notifier";
import { Connection } from "./socketeer/Connection";
import { GraphCaller } from "./GraphCaller";
import { MaboToast } from "./MaboToast";

export class BoardObjects extends React.Component<{}, IPlayGroundState>{
  hasMounted: boolean = false;
  notifiers: notifier[] = [];
  constructor(props) {
    super(props);
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
    return (
      <div>
        <h5>boards</h5>
        {this.renderBoards.call(this)}
        <input type="button" value="add board" onClick={this.onClickAddBoardButtonHandler.bind(this)} />
        <h5>pieces</h5>
        {this.renderPieces.call(this)}
        <input type="button" value="add piece" onClick={this.onClickAddPieceButtonHandler.bind(this)} />
      </div>
    )
  }

  renderBoards() {
    const result: JSX.Element[] = [];
    const { boards } = this.state;
    for (let i_b = 0; i_b < boards.length; i_b++) {
      const b = boards[i_b];
      const board = (
        <div key={b.id}>
          <p>
            <span>{b.id}, {b.width}x{b.height}</span>
            <input type="button" value="remove board" onClick={this.onClickRemoveBoardButtonHandler.bind(this, b.id)} />
          </p>
        </div>
      )
      result.push(board);
    }

    return result;
  }

  renderPieces() {
    const result: JSX.Element[] = [];
    const { pieces } = this.state;
    for (let i_p = 0; i_p < pieces.length; i_p++) {
      const p = pieces[i_p];
      const piece = (
        <div key={p.id}>
          <p>
            <span>{p.id}, x:{p.x} - y:{p.y}</span>
            <input type="button" value="remove piece" onClick={this.onClickRemovePieceButtonHandler.bind(this, p.id)} />
          </p>
        </div>
      );
      result.push(piece);
    }

    return result;
  }



  onClickRemovePieceButtonHandler(pieceId) {
    const mutation = `
    mutation ($pieceId: String!){
      deletePiece(id: $pieceId) {
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
    const variables = { pieceId };
    GraphCaller.call(mutation, variables)
      .catch((e) => {
        console.error(e);
        MaboToast.danger('コマの削除に失敗しました');
      })
  }

  onClickAddPieceButtonHandler() {
    const mutation = `
    mutation ($roomId: String!){
      createPiece(
        characterId:"0123456789" 
        roomId: $roomId
        type: "pawn"
        height: 120
        width: 120
        x:0
        y:0
      ) {
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
    }
    GraphCaller.call(mutation, variables)
      .catch((e) => {
        console.error(e);
        MaboToast.danger('コマの追加に失敗しました');
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
      .catch((e) => {
        console.error(e);
        MaboToast.danger('ボードの作成に失敗しました');
      })
  }
}