'use strict';

import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {
  getMuiTheme,
  lightBaseTheme
} from 'material-ui/styles';
import {AppBar} from 'material-ui';

class Scenario extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
      </MuiThemeProvider>
    );
  }
}

module.exports = Scenario;