"use strict";
import * as React from "react";
import { ChangeEvent } from 'react';
import { Connection } from "./socketeer/Connection";
import { GraphCaller } from "./GraphCaller";
import { SessionContainer } from "./SessionContainer";
import { Channels } from "./Channels";

interface IChatFormState {
  inputText: string;
}

export class ChatForm extends React.Component<{}, IChatFormState> {
  static instance?: ChatForm;
  constructor(props) {
    super(props);
    this.state = {
      inputText: '',
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
        <textarea onKeyUp={this.onKeyUpTextAreaHandler.bind(this)} />
        <input type="button" value="send" onClick={this.onClickSendButtonHandler.bind(this)} />
        <p>inputText:{this.state.inputText}</p>
        <Channels />
      </div>
    )
  }

  onKeyUpTextAreaHandler(e: ChangeEvent<HTMLTextAreaElement>) {
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
      channelId: '012345678901234567890123',
      avatarId: '012345678901234567890123',
      content: this.state.inputText,
      faceId: '012345678901234567890123'
    }
    await GraphCaller.call(mutation, variables);
  }
}
