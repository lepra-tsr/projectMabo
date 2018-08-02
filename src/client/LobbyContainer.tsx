"use strict";
import * as React from "react";
import { Rooms } from './Rooms';

export class LobbyContainer extends React.Component<{}, {}> {
  constructor(props){
    super(props);
  }
  render() {
    return (
      <div>

        <Rooms/>
      </div>
    )

  }
}