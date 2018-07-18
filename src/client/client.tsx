'use strict';

import io from 'socket.io-client';

window.onload = () => {

  io('http://localhost:3001');

  // ReactDOM.render(<CreateScenario />, document.getElementById('container'));
  // ReactDOM.render(<Login/>, document.getElementById('container'));
  // ReactDOM.render(<Scenario />, document.getElementById('container'));
};