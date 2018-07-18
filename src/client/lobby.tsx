'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import {Rooms} from './Rooms';

import io from 'socket.io-client';

window.onload = () => {

  io('http://localhost:3001');

  ReactDOM.render(<Rooms/>, document.getElementById('container'));
  // ReactDOM.render(<CreateScenario />, document.getElementById('container'));
  // ReactDOM.render(<Login/>, document.getElementById('container'));
  // ReactDOM.render(<Scenario />, document.getElementById('container'));
};