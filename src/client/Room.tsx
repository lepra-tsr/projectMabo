'use strict';

import React from 'react';
import {
  Card,
  Elevation,
} from '@blueprintjs/core';

import './handler.css';

export interface IRoomProps {
  id: number;
  title: string;
  description: string;
}

export class Room extends React.Component<IRoomProps, {}> {
  constructor(props: IRoomProps) {
    super(props);
  }

  render() {
    const style = {
      card: {
        marginTop: '15px',
        marginLeft: '20%',
        width: '60%',
      }
    };
    const {id, title, description} = this.props;
    return (
      <Card key={id} interactive={true} elevation={Elevation.TWO} style={style.card}>
        <h5><a href='#'>{title}</a></h5>
        <p>{description}</p>
      </Card>
    );
  }
}