"use strict";
import * as React from "react";
import { UserNameDialog } from "./UserNameDialog";
import { Listener } from "./Listener";

interface ISessionContainerState {
  userName: string;
  users: { id: string, name: string, socketId: string }[];
  logs: {/* @TODO モックだし適当でもいいかも */}[],
}

export class SessionContainer extends React.Component<{}, ISessionContainerState> {
  static instance?: SessionContainer;
  constructor(props) {
    super(props);

    if (typeof SessionContainer.instance === 'object') {
      return SessionContainer.instance;
    }
    SessionContainer.instance = this;

    this.state = {
      userName: 'デフォルト',
      users: []
    };
    Listener.on('roomUserInfo', this.roomUserInfoHandler.bind(this));
  }

  roomUserInfoHandler(users) {
    const newUsers = [].concat(users);
    this.setState({ users: newUsers });
  }

  static getUserName() {
    return SessionContainer.instance
      ? SessionContainer.instance.state.userName
      : 'デフォルト';
  }

  render() {
    return (
      <div>
        <div>
          <h4>Connection.userName:</h4>
          <p>{this.state.userName}</p>
        </div>
        <div>
          <h4>users</h4>
          {this.state.users
            .map((u) => {
              return (<p key={u.id}>{u.id}, {u.name}, {u.socketId}</p>)
            })
          }
        </div>
        <UserNameDialog />
      </div>
    )
  }
}