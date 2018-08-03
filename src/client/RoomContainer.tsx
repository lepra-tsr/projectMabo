"use strict";
import * as React from "react";
import {  PasswordDialog } from './PasswordDialog';

export class RoomContainer extends React.Component<{}, {}> {
  constructor(props){
    super(props);
  }
  render() {
    return (
      <div>
        <PasswordDialog canOutsideClickClose={false}/>
      </div>
    )

  }
}