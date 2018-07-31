'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import {Rooms} from './Rooms';

window.onload = () => {
  ReactDOM.render(<Rooms/>, document.getElementById('container'));
};