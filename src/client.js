'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import Lobby from './Lobby.jsx';
// import CreateScenario from './CreateScenario.jsx';
// import Login from './Login.jsx';
// import Scenario from './Scenario.jsx';

window.onload = () => {
  ReactDOM.render(<Lobby/>, document.getElementById('container'));
  // ReactDOM.render(<CreateScenario />, document.getElementById('container'));
  // ReactDOM.render(<Login />, document.getElementById('container'));
  // ReactDOM.render(<Scenario />, document.getElementById('container'));
};