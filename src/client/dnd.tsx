'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import DndContainer from './DndContainer';

window.onload = () => {
  ReactDOM.render(<DndContainer />, document.getElementById('container'));
};
