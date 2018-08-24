'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import Docks from './Docks';

window.onload = () => {
  ReactDOM.render(<Docks />, document.getElementById('container'));
};
