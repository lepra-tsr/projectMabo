"use strict";
import * as React from "react";
import { UserNameDialog } from "./UserNameDialog";
import { Listener } from "./Listener";

interface ISessionContainerState {
  userName: string;
  users: { id: string, name: string, socketId: string }[];
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
          <p>{this.state.userName}</p>
        </div>
        <div>
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