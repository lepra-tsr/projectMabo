'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import { LobbyContainer } from './LobbyContainer';

window.onload = () => {
  ReactDOM.render(<LobbyContainer/>, document.getElementById('container'));
};
