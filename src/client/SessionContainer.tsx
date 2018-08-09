"use strict";
import * as React from "react";
import { ChangeEvent } from 'react';
import { UserNameDialog } from "./UserNameDialog";
import { Listener } from "./Listener";
import { Connection } from "./socketeer/Connection";
import { GraphCaller } from "./GraphCaller";

interface ISessionContainerState {
  userName: string;
  users: { id: string, name: string, socketId: string }[];
  inputText: string;
  logs: {
    id: string,
    socketId: string,
    userName: string,
    channelId: string,
    avatarId: string,
    content: string,
    faceId: string,
  }[],
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
      inputText: '',
      logs: [],
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
        <div>
          <h4>logs</h4>
          <textarea onKeyDown={this.onKeyDownTextAreaHandler.bind(this)} />
          <input type="button" value="send" onClick={this.onClickSendButtonHandler.bind(this)} />
          {this.state.logs
            .map((l) => (<p key={l.id}>{l.content}</p>))}
        </div>
        <UserNameDialog />
      </div>
    )
  }

  onKeyDownTextAreaHandler(e: ChangeEvent<HTMLTextAreaElement>) {
    const { currentTarget: target } = e;
    if (target instanceof HTMLTextAreaElement) {
      const { value: inputText } = target;
      this.setState({ inputText });
    }
  }

  async onClickSendButtonHandler() {
    const mutation = `
    mutation(
      $roomId: String!
      $socketId: String!
      $userName: String!
      $channelId: String!
      $avatarId: String!
      $content: String!
      $faceId: String!
    ){
      createChat(
        roomId: $roomId
        socketId: $socketId
        userName: $userName
        channelId: $channelId
        avatarId: $avatarId
        content: $content
        faceId: $faceId
      ){
        _id
        roomId
        socketId
        userName
        channelId
        avatarId
        content
        faceId
      }
    }`;
    const variables = {
      roomId: Connection.roomId,
      socketId: Connection.socketId,
      userName: Connection.userName,
      channelId: '@not implemented',
      avatarId: '@not implemented',
      content: this.state.inputText, 
      faceId: '@not implemented'
    }
    const json = await GraphCaller.call(mutation, variables);
    console.log(json);
  }
}
