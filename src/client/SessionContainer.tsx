
"use strict";
import * as React from "react";
import { UserNameDialog } from "./UserNameDialog";
import { Notifier, notifier } from "./Notifier";
import { PlayGround } from "./PlayGround";
import { Docks } from "./Docks";
import { Launcher } from "./Launcher";
import { Photographer } from "./Photographer";

interface ISessionContainerState {
  userName: string;
  users: { id: string, name: string, socketId: string }[];
}

export class SessionContainer extends React.Component<{}, ISessionContainerState> {
  static instance?: SessionContainer;
  notifiers: notifier[] = [];
  mounted: boolean;
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

    this.notifiers.push(
      Notifier.on('roomUserSync', this.roomUserSyncHandler.bind(this))
    )
  }

  componentWillUnmount() {
    Notifier.offs(this.notifiers);
  }

  roomUserSyncHandler(users) {
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
        <Docks />
        <Launcher />
        <Photographer />
        <PlayGround />
        {this.renderUsers.call(this)}
      </div>
    )
  }

  renderUsers(): JSX.Element {
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
        </div>
        <UserNameDialog />
      </div>
    );
  }
}
