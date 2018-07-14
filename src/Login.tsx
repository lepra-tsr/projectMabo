'use strict';

import React from 'react';
import {
  Dialog,
  Button,
  Intent,
} from '@blueprintjs/core';
import './handler.css';

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isOpen: true };
  }

  render() {
    return (
      <Dialog icon="film"
              isOpen={this.state.isOpen}
              title='Log in'>
        <div className="pt-dialog-body">
          <input type='password' className="pt-input" id="text-input"/>
        </div>
        <div className="pt-dialog-footer">
          <div className="pt-dialog-footer-actions">
            <Button text="Cancel"/>
            <Button intent={Intent.PRIMARY} text="Log in"/>
          </div>
        </div>
      </Dialog>
    );
  }
}

module.exports = Login;