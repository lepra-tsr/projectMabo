"use strict";
import * as React from "react";
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

export class Sandbox extends React.Component<{}, {}>{
  constructor(props: {}) {
    super(props);
  }
  render() {
    return (
      <div style={{ width: '300%' }}>
        <Board knightPosition={[7, 4]} />
      </div>
    );
  }
}

interface IBoardProps {
  knightPosition: number[];
}
@DragDropContext(HTML5Backend)
class Board extends React.Component<IBoardProps, {}> {
  renderSquare(i) {
    const x = i % 8;
    const y = Math.floor(i / 8);
    const black = (x + y) % 2 === 1;

    const [kX, kY] = this.props.knightPosition;
    const piece = (x === kX && y === kY) ? <Knight /> : null;

    return (
      <div key={i}
        style={{ width: '12.5%', height: '12.5%' }}>
        <Square black={black}>
          {piece}
        </Square>
      </div>
    );
  }

  render() {
    const squares:JSX.Element[] = [];
    for (let i = 0; i < 64; i++) {
      squares.push(this.renderSquare(i));
    }

    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexWrap: 'wrap'
      }}>
        {squares}
      </div>
    );
  }
}

interface ISquareProps {
  black: boolean;
}
class Square extends React.Component<ISquareProps, {}>{
  render() {
    const { black } = this.props;
    const fill = black ? 'black' : 'white';
    const stroke = black ? 'white' : 'black';

    return (
      <div style={{
        backgroundColor: fill,
        color: stroke,
        width: '100%',
        height: '100%'
      }}>
        {this.props.children}
      </div>
    );
  }
}

class Knight extends React.Component {

  render() {
    return (<span>♘</span>)
  }
}
