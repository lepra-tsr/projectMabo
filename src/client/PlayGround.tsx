"use strict";
import * as React from "react";

interface piece {
  type: string;
  characterId: string;
  height: number;
  width: number;
  x: number;
  y: number;
}

interface board {
  pieces: piece[],
  height: number;
  width: number;
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
  }

  render() {
    return (
      <div style={{ alignSelf: 'stretch', display: 'flex' }}>
        <div>
          <input type="button" value="add board" />
        </div>
        <div style={{ width: '400px', backgroundColor: 'dimgray' }}>
        </div>
      </div>
    )
  }
}
