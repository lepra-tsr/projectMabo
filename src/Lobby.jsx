'use strict';

import React from 'react';
import {
  Button,
  Card,
  Elevation,
} from '@blueprintjs/core';
import './handler.css';


class Lobby extends React.Component {
  constructor(props) {
    super(props);
    const scenarios = [
      { id: 0, name: 'The hound of Kiritani', player: ['alpha', 'beta', 'charley'] },
      { id: 1, name: 'The Candle', player: ['alpha', 'beta', 'charley'] },
      { id: 2, name: 'Tower of hand', player: ['alpha', 'beta', 'charley'] },
      { id: 3, name: 'Ghost Machine', player: ['alpha', 'beta', 'charley'] },
    ];

    this.state = { scenarios };
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
        {this.renderScenarios()}
      </div>
    );
  }

  renderScenarios() {
    const style = {
      card: {
        marginTop: '15px',
        marginLeft: '20%',
        width: '60%',
      }
    };
    const scenarios = this.state.scenarios.map((s) => {
      return (
        <Card key={s.id} interactive={true} elevation={Elevation.TWO} style={style.card}>
          <h5><a href='#'>{s.name}</a></h5>
          <span>consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore</span>
          <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
        </Card>);
    });
    return scenarios;
  }
}

module.exports = Lobby;