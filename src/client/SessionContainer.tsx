"use strict";
import * as React from "react";
import { UserNameDialog } from "./UserNameDialog";
import { Logs } from "./Logs";
import { Listener } from "./Listener";
import { ChatForm } from "./ChatForm";

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
      users: [],
    }
  }

  componentDidMount() {
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
      <div style={{ display: 'flex', justifyContent: 'center' }}>
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
          <hr />
          <ChatForm />
          <hr />
          <ChatForm />
        </div>
        <Logs />
        <Logs />
        <UserNameDialog />
      </div>
    )
  }
}
