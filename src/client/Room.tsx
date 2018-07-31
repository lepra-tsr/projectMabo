'use strict';

import React from 'react';
import {
  Card,
  Elevation,
} from '@blueprintjs/core';

import './handler.css';
import { PasswordDialog, IPasswordDialogProps } from "./PasswordDialog";

export interface IRoomProps {
  _id: string;
  title: string;
  description?: string;
}

export class Room extends React.Component<IRoomProps, {isOpen:boolean}> {
  constructor(props: IRoomProps) {
    super(props);
    this.state = { isOpen: false };
  }

  render() {
    const style = {
      card: {
        marginTop: '15px',
        marginLeft: '20%',
        width: '60%',
      }
    };
    const { _id, title, description = '' } = this.props;

    const passwordDialogProp: IPasswordDialogProps = {
      isOpen: this.state.isOpen,
      _id,
      title,
    };

    return (
      <Card key={_id} interactive={true} elevation={Elevation.TWO} style={style.card} onClick={() => this.setState({ isOpen: true })}>
        <h5><a href='#'>{title}</a></h5>
        <p>{description}</p>
        <PasswordDialog {...passwordDialogProp}/>
      </Card>
    );
  }
}