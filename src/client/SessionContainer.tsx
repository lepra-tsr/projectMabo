"use strict";
import * as React from "react";
import { UserNameDialog } from "./UserNameDialog";

interface ISessionContainerState {
  userName: string;
}

export class SessionContainer extends React.Component<{}, ISessionContainerState> {
  static instance ?: SessionContainer;
  constructor(props){
    super(props);

    if (typeof SessionContainer.instance === 'object') {
      return SessionContainer.instance;
    }
    SessionContainer.instance = this;

    this.state = {
      userName: 'デフォルト',
    };
  }

  static getUserName() {
    return SessionContainer.instance
      ? SessionContainer.instance.state.userName
      : 'デフォルト';
  }

  render() {
    return (
      <div>
        {Object.keys(this.state).map(k => (<p key={k}>{k}:{this.state[k]}</p>))}
        <UserNameDialog/>
      </div>
    )
  }
}