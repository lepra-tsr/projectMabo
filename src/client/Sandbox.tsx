"use strict";
import * as React from "react";
import { DragDropContext, DragSource, DropTarget } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

const ItemTypes = {
  KNIGHT: 'knight',
}

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
    return (
      <div key={i}
        style={{ width: '12.5%', height: '12.5%' }}>
        <BoardSquare x={x}
          y={y}>
          {this.renderPiece(x, y)}
        </BoardSquare>
      </div>
    );
  }

  renderPiece(x, y) {
    const [knightX, knightY] = this.props.knightPosition;
    if (x === knightX && y === knightY) {
      return <Knight connectDragSource={() => { }} isDragging={false} />;
    }
  }

  render() {
    const squares: JSX.Element[] = [];
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
let knightPosition = [0, 0];
let observer;

function emitChange() {
  if (observer) {
    observer(knightPosition);
  }
}

export function observe(o) {
  if (observer) {
    throw new Error('Multiple observers not implemented.');
  }

  observer = o;
  emitChange();
}

export function moveKnight(toX, toY) {
  knightPosition = [toX, toY];
  emitChange();
}

function canMoveKnight(toX, toY) {
  const [x, y] = knightPosition;
  const dx = toX - x;
  const dy = toY - y;

  return (Math.abs(dx) === 2 && Math.abs(dy) === 1) ||
    (Math.abs(dx) === 1 && Math.abs(dy) === 2);
}

const squareTarget = {
  drop(props, monitor) {
    moveKnight(props.x, props.y);
  }
}

function boardSquareCollect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
  }
}

interface IBoardSquareProps {
  x: number;
  y: number;
  connectDropTarget: Function;
  isOver: boolean;
}
@DropTarget(ItemTypes.KNIGHT, squareTarget, boardSquareCollect)
class BoardSquare extends React.Component<IBoardSquareProps, {}>{
  render() {
    const { x, y, connectDropTarget, isOver } = this.props;
    const black = (x + y) % 2 === 1;

    return connectDropTarget(
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%'
      }}>
        <Square black={black}>
          {this.props.children}
        </Square>
        {isOver &&
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: '100%',
            zIndex: 1,
            opacity: 0.5,
            backgroundColor: 'yellow',
          }} />
        }
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

const knightSource = {
  beginDrag(props) { return {} }
}

function knightCollect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  }
}

interface IKnightProps {
  connectDragSource: Function;
  isDragging: boolean;
}
@DragSource(ItemTypes.KNIGHT, knightSource, knightCollect)
class Knight extends React.Component<IKnightProps, {}> {

  render() {
    const { connectDragSource, isDragging } = this.props;
    // return (<span>♘</span>)
    return connectDragSource(
      <div style={{
        opacity: isDragging ? 0.5 : 1,
        fontSize: 25,
        fontWeight: 'bold',
        cursor: 'move',
      }}>♘</div>
    )
  }
}
