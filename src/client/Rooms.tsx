'use strict';

import React from 'react';
import {Button} from '@blueprintjs/core';
import {Room, IRoomProps} from './Room';
import { GraphCaller } from './GraphCaller';
import './handler.css';

interface ILobbyState {
  scenarios: IRoomProps[];
}

export class Rooms extends React.Component<{}, ILobbyState> {
  constructor(props) {
    super(props);
    this.state = {
      scenarios: [
      ]
    };
    GraphCaller.call()
      .then((r) => {
        const { data } = r;
        const { room } = data;
        this.setState({ scenarios: room });
      })
      .catch((r) => {
        console.error(r);
      })
  }

  render() {
    const style = {
      button: {
        marginTop: '150px',
        marginLeft: '20%',
        width: '60%',
      }
    };

    return (
      <div>
        <Button style={style.button}>Create new scenario</Button>
        {this.state.scenarios.map((s: IRoomProps) => <Room key={s._id} {...s}/>)}
      </div>
    );
  }
}