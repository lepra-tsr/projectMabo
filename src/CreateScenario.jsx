'use strict';

import React from 'react';
import {
  Dialog,
  Button,
  Intent,
} from '@blueprintjs/core';
import './handler.css'
class CreateScenario extends React.Component {
  constructor(props) {
    super(props);
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
      <Dialog style={style.card} icon="inbox"
        isOpen={true}
        title="Dialog header">
        <div className="pt-dialog-body">Some content</div>
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
}

module.exports = CreateScenario;