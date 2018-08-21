'use strict';
import * as React from 'react';
import Draggable from 'react-draggable';

import { Board } from './Board';
import { IBoardProps } from './PlayGround';

interface IPaneState {
  magnify: number;
}

interface IPaneProps {
  boards: IBoardProps[];
}

export class Pane extends React.Component<IPaneProps, IPaneState> {
  constructor(props) {
    super(props);
    this.state = {
      magnify: 1,
    };
  }

  render() {
    const paneWidth = window.innerWidth;
    const paneHeight = window.innerHeight;
    const bounds = {
      left: -1 * 0.5 * paneWidth,
      top: -1 * 0.5 * paneHeight,
      right: 1 * 0.5 * paneWidth,
      bottom: 1 * 0.5 * paneHeight,
    }

    const paneStyle: React.CSSProperties = {
      'width': `${paneWidth}px`,
      'height': `${paneHeight}px`,
      'border': '1px dashed black',
    }

    const viewStyle: React.CSSProperties = {
      'width': `${paneWidth}px`,
      'height': `${paneHeight}px`,
      'border': '1px dashed purple',
      'display': 'flex',
      'flexWrap': 'wrap',
      'alignItems': 'center',
      'justifyContent': 'center',
      'alignContent': 'center',
      'transform': `scale(${this.state.magnify}, ${this.state.magnify})`
    }

    const boards = this.props.boards;

    return (
      <Draggable bounds={bounds} grid={[1, 1]} >
        <div style={paneStyle}>
          <div style={viewStyle} onWheel={this.onWheelViewHandler.bind(this)}>
            {boards.map((b) => (<Board key={b.id} {...b} />))}
          </div>
        </div>
      </Draggable>
    )
  }

  onWheelViewHandler(e: WheelEvent) {
    if (e.deltaY === 0) { return false; }
    const MAGNIFY_MAX = 3;
    const MAGNIFY_MIN = 0.5;

    const coefficient = 0.01;
    const delta = e.deltaY * coefficient;
    let { magnify } = this.state;
    magnify += delta;
    if (magnify < MAGNIFY_MIN) {
      magnify = MAGNIFY_MIN;
    } else if (magnify > MAGNIFY_MAX) {
      magnify = MAGNIFY_MAX;
    }

    this.setState({ magnify });
  }
}
