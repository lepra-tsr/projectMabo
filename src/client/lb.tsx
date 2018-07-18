'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import {Lobby} from './Lobby';

import io from 'socket.io-client';

window.onload = () => {

  io('http://localhost:3001');

  ReactDOM.render(<Lobby/>, document.getElementById('container'));
  // ReactDOM.render(<CreateScenario />, document.getElementById('container'));
  // ReactDOM.render(<Login/>, document.getElementById('container'));
  // ReactDOM.render(<Scenario />, document.getElementById('container'));
};