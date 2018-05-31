'use strict';

import React from 'react';
import {
  Dialog,
  Button,
  Intent,
  Label,
} from '@blueprintjs/core';
import './handler.css'
class CreateScenario extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isOpen: true }
  }

  render() {
    const style = {
      card: {
        marginTop: '200px',
        marginLeft: '20%',
        width: '60%'
      },
    };


    return (
      <Dialog
        style={style.card}
        icon="film"
        isOpen={this.state.isOpen}
        onClose={this.onCloseHandler.bind(this)}
        title='Create scenario'>
        <div className="pt-dialog-body">
          <Label
          inline={true}   
            helperText="Helper text with details..."
            text="Label A"
          >
            <input className="pt-input" id="text-input" placeholder="Placeholder text" />
          </Label>
        </div>
        <div className="pt-dialog-footer">
          <div className="pt-dialog-footer-actions">
            <Button text="Secondary" />
            <Button
              intent={Intent.PRIMARY}
              text="Primary"
            />
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