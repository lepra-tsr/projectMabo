"use strict";
import * as React from "react";
import { PasswordDialog } from './PasswordDialog';
import { SessionContainer } from './SessionContainer';

interface IRoomContainerState {
  authenticated: boolean;
}

export class RoomContainer extends React.Component<{}, IRoomContainerState> {
  static instance ?: RoomContainer;

  constructor(props) {
    super(props);
    if (typeof RoomContainer.instance === 'object') {
      return RoomContainer.instance;
    }
    RoomContainer.instance = this;

    this.state = {
      authenticated: false
    }
  }

  render() {
    return (
      <div>
        <PasswordDialog canOutsideClickClose={false}/>
        {this.state.authenticated ? <SessionContainer/> : null}
      </div>
    )
  }

  static sessionStart() {

    if (RoomContainer.instance) {
      const tis = RoomContainer.instance;
      tis.setState({ authenticated: true });
    }
  }
}