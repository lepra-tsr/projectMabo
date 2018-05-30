'use strict';

import React from 'react';
import {
  Button,
  Card,
  Elevation
} from '@blueprintjs/core';
import './handler.css'

class Lobby extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const style = {
      card: {
        marginTop: '200px',
        marginLeft: '20%',
        width: '60%'
      },
      cardText: {
        height: '400px',
        overflow: 'scroll'
      },
      rightButton: {
        marginRight: '0px'
      },
    };

    return (
      <Card interactive={true} elevation={Elevation.TWO}>
        <h5><a href='#'>シナリオ一覧</a></h5>
        <span>新しくシナリオを作成するか、シナリオにログインしましょう</span>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
        </p>
        <Button>Submit</Button>
      </Card>
    );
  }
}

module.exports = Lobby;