'use strict';

import React from 'react';
import {
  Card,
  Elevation,
} from '@blueprintjs/core';

import './handler.css';
import { LobbyData } from "./LobbyData";

export interface IRoomProps {
  _id: string;
  title: string;
  description?: string;
}

export class Room extends React.Component<IRoomProps, { isOpen: boolean }> {
  constructor(props: IRoomProps) {
    super(props);
    this.state = {isOpen: false};
  }

  render() {
    const style = {
      card: {
        marginTop: '15px',
        marginLeft: '20%',
        width: '60%',
      }
    };
    const {_id, title, description = ''} = this.props;

    return (
      <Card key={_id} interactive={true} elevation={Elevation.TWO} style={style.card} onClick={this.onClickShowAuthDialogHandler.bind(this)}>
        <h5><a href='#'>{title}</a></h5>
        <p>{description}</p>
      </Card>
    );
  }

  onClickShowAuthDialogHandler() {
    console.log('clicked'); // @DELETEME
    LobbyData.dialogIsOpen = true;
  }
}