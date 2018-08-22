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

    return (
      <div style={boardStyle}>
      </div>
    )
  }
}
