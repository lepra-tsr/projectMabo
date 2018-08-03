'use strict';

import React from 'react';
import {
  Card,
  Elevation,
} from '@blueprintjs/core';
import { PasswordDialog } from "./PasswordDialog";
import './handler.css';

export interface IRoomProps {
  _id: string;
  title: string;
  description?: string;
}

export interface IRoomState {
  isOpen: boolean;
}

export class Room extends React.Component<IRoomProps> {
  state: IRoomState;
  roomId: string;
  constructor(props: IRoomProps) {
    super(props);
    const { _id } = this.props;
    this.roomId = _id;
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
    PasswordDialog.show(this.roomId,this.props.title);
  }
}