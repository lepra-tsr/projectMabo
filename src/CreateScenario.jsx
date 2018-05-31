'use strict';

import React from 'react';
import {
  Dialog,
  Button,
  Intent,
  Label,
} from '@blueprintjs/core';
import './handler.css';

class CreateScenario extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isOpen: true };
  }

  render() {
    return (
      <Dialog
        icon="film"
        isOpen={this.state.isOpen}
        onClose={this.onCloseHandler.bind(this)}
        title='Create scenario'>
        <div className="pt-dialog-body">
          <Label inline={true} text="">
            <input className="pt-input" id="text-input" placeholder="ガシャン！"/>
          </Label>
        </div>
        <div className="pt-dialog-footer">
          <div className="pt-dialog-footer-actions">
            <Button text="Cancel"/>
            <Button intent={Intent.PRIMARY} text="Create"/>
          </div>
        </div>
      </Dialog>
    );
  }

  onCloseHandler() {
    this.setState({ isOpen: false });
  }

  show() {
    this.setState({ isOpen: true });
  }
}

module.exports = CreateScenario;