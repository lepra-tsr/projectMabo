"use strict";
import * as React from "react";
import { Rooms } from './Rooms';
import { PasswordDialog } from './PasswordDialog';

export class LobbyContainer extends React.Component<{}, {}> {
  constructor(props){
    super(props);
  }
  render() {
    return (
      <div>
        <PasswordDialog isOpen={false}/>
        <Rooms/>
      </div>
    )

  }
}