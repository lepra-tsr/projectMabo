"use strict";
import * as React from "react";
import { ChangeEvent } from 'react';
import { Connection } from "./socketeer/Connection";
import { GraphCaller } from "./GraphCaller";
import { SessionContainer } from "./SessionContainer";
import { Notifier } from "./Notifier";
import { character } from "./Characters";

export interface channel { 
  id: string;
  name: string;
}

interface IChatFormState {
  inputText: string;
  inputChannel: string;
  channelId: string;
  channels: channel[];
  characterId: string;
  characters: character[];
}

export class ChatForm extends React.Component<{}, IChatFormState> {
  static instance?: ChatForm;
  constructor(props) {
    super(props);
    this.state = {
      inputText: '',
      inputChannel: '',
      channelId: '',
      channels: [],
      characterId: '',
      characters: [],
    };

    Notifier.on('channelInfoSync', this.channelInfoSyncHandler.bind(this));
    Notifier.on('characterInfoSync', this.characterInfoSyncHandler.bind(this));
    this.loadAllChannels();
  }

  characterInfoSyncHandler(characters: character[]) {
    this.setState({ characters });
  }

  async loadAllChannels() {
    const query = `
    query($roomId:String!){
      channel(roomId:$roomId) {
        _id
        roomId
        name
      }
    }`;
    const variables = { roomId: Connection.roomId };
    try {
      const { data } = await GraphCaller.call(query, variables);
      const { channel: channelResult } = data

      const channels = this.state.channels;
      channels.splice(0, channels.length);

      for (let i_c = 0; i_c < channelResult.length; i_c++) {
        const c = channelResult[i_c];
        const channel = {
          id: c._id,
          name: c.name,
        }
        channels.push(channel);
      }

      this.setState({ channels })
    }
    catch (e) {
      console.error(e);
    }
  }

  channelInfoSyncHandler(channel) {
    const channels = this.state.channels;
    channels.push(channel);
    this.setState({ channels })
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
        <p>channelId:{this.state.channelId}</p>
        <p>characterId:{this.state.characterId}</p>
        <div>
          <h5>channel</h5>
          <select value={this.state.channelId}
            onChange={this.onChangeChannelSelectorHandler.bind(this)}>
            <option value="" disabled>未選択</option>
            {this.state.channels
              .map((c) => (<option value={c.id} key={c.id}>{c.name}</option>))}
          </select>
          <input type="form" onKeyUp={this.onKeyUpChannelNameInputHandler.bind(this)} />
          <input type="button" value="add channel" onClick={this.onClickAddChannelHandler.bind(this)} />
        </div>
        <div>
          <h5>character</h5>
          <select value={this.state.characterId} onChange={this.onChangeCharacterSelectorHandler.bind(this)}>
            <option value="" disabled>未選択</option>
            {this.state.characters
              .map(c => (<option value={c.id} key={c.id}>{c.name}</option>))}
          </select>
        </div>
      </div>
    )
  }

  onChangeCharacterSelectorHandler(e: ChangeEvent<HTMLSelectElement>) {
    const { currentTarget: target } = e;
    if (target instanceof HTMLSelectElement) {
      const { value: characterId } = target;
      this.setState({ characterId });
    }
  }

  onChangeChannelSelectorHandler(e: ChangeEvent<HTMLSelectElement>) {
    const { currentTarget: target } = e;
    if (target instanceof HTMLSelectElement) {
      const { value: channelId } = target;
      this.setState({ channelId });
    }
  }

  onKeyUpChannelNameInputHandler(e: ChangeEvent<HTMLInputElement>) {
    const { currentTarget: target } = e;
    if (target instanceof HTMLInputElement) {
      const { value: inputChannel } = target;
      this.setState({ inputChannel });
    }
  }

  async  onClickAddChannelHandler() {
    const mutation = `
    mutation($roomId:String! $name:String!) {
      createChannel(
        roomId: $roomId
        name: $name
      ){
        _id
        roomId
        name
      }
    }`;
    const variables = {
      roomId: Connection.roomId,
      name: this.state.inputChannel,
    };
    await GraphCaller.call(mutation, variables);
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
      $characterId: String!
    ){
      createChat(
        roomId: $roomId
        socketId: $socketId
        userName: $userName
        channelId: $channelId
        avatarId: $avatarId
        content: $content
        faceId: $faceId
        characterId: $characterId
      ){
        _id
        roomId
        socketId
        userName
        channelId
        avatarId
        content
        faceId
        characterId
      }
    }`;
    const variables = {
      roomId: Connection.roomId,
      socketId: Connection.socketId,
      userName: Connection.userName,
      channelId: this.state.channelId,
      avatarId: '012345678901234567890123',
      content: this.state.inputText,
      faceId: '012345678901234567890123',
      characterId: this.state.characterId,
    }
    await GraphCaller.call(mutation, variables);
  }
}
