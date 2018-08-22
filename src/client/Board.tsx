'use strict';
import * as React from 'react';
import Draggable from 'react-draggable';
import { IBoardProps } from './PlayGround';

interface IBoardState {
  width: number;
  height: number;
}

export class Board extends React.Component<IBoardProps, IBoardState> {
  constructor(props) {
    super(props);
    this.state = {
      width: this.props.width,
      height: this.props.height,
    }
  }

  render() {
    const boardWidth: number = this.state.width;
    const boardHeight: number = this.state.height;
    const boardStyle: React.CSSProperties = {
      'flexShrink': 0,
      'width': `${boardWidth}px`,
      'height': `${boardHeight}px`,
      'border': '1px solid red',
    }
    const pieceWidth: number = 70;
    const pieceHeight: number = 70;
    const pieceStyle: React.CSSProperties = {
      'width': `${pieceWidth}px`,
      'height': `${pieceHeight}px`,
      'border': '1px solid blue',
    }

    const bounds = {
      left: -1 * pieceWidth,
      top: -1 * pieceHeight,
      right: boardWidth,
      bottom: boardHeight,
    }

    const pieces = this.props.pieces;

    return (
      <div style={boardStyle}>
        {pieces.map((p) => (
          <Draggable key={p.id} bounds={bounds} onMouseDown={(e) => e.stopPropagation()}>
            <div style={pieceStyle}>{p.id}</div>
          </Draggable>
        ))}
      </div>
    )
  }
}
