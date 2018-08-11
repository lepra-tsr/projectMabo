"use strict";
import * as React from "react";
import { ChangeEvent } from 'react';
import { UserNameDialog } from "./UserNameDialog";
import { Logs } from "./Logs";
import { Listener } from "./Listener";
import { Connection } from "./socketeer/Connection";
import { GraphCaller } from "./GraphCaller";
import { ChatForm } from "./ChatForm";

interface ISessionContainerState {
  userName: string;
  users: { id: string, name: string, socketId: string }[];
  inputText: string;
  inputChannel: string,
  channel: string,
  channels: {
    id: string,
    name: string,
  }[],
  pickers: {
    id: string,
    name: string,
    enabled: boolean,
  }[]
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
      inputChannel: '',
      channel: '',
      channels: [],
      pickers: [],
    };
  }

  componentDidMount() {
    Listener.on('roomUserInfo', this.roomUserInfoHandler.bind(this));
    Listener.on('channelInfo', this.channelInfoHandler.bind(this));
    this.loadAllChannels();
    this.loadAllpickers();
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
      const channels = channelResult.map((c) => ({
        id: c._id,
        name: c.name,
      }));
      const channel = (this.state.channel === '') ? channels[0].id : this.state.channel;
      this.setState({ channel, channels })
    }
    catch (e) {
      console.error(e);
    }
  }

  async loadAllpickers() {
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
      const { channel } = data
      /* merging */
      const pickers: { id: string, name: string, enabled: boolean }[] = [];
      for (let i_c = 0; i_c < channel.length; i_c++) {
        const c = channel[i_c];
        let isExist = false;
        for (let i_p = 0; i_p < this.state.pickers.length; i_p++) {
          const p = this.state.pickers[i_p];
          if (c._id === p.id) {
            isExist = true;
            break;
          }
        }
        if (isExist) {
          continue;
        }
        const picker: { id: string, name: string, enabled: boolean } = {
          id: c._id,
          name: c.name,
          enabled: true,
        }
        pickers.push(picker);
      }
      this.setState({ pickers })
    }
    catch (e) {
      console.error(e);
    }
  }

  roomUserInfoHandler(users) {
    const newUsers = [].concat(users);
    this.setState({ users: newUsers });
  }

  channelInfoHandler(channels) {
    this.setState({ channels, pickers: channels })
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
          <ChatForm />
          <div>
            <h5>channel</h5>
            <select value={this.state.channel}
              onChange={this.onChangeChannelSelectorHandler.bind(this)}>
              {this.state.channels
                .map((c) => (<option value={c.id} key={c.id}>{c.name}</option>))}
            </select>
            <input type="form" onKeyUp={this.onKeyUpChannelNameInputHandler.bind(this)} />
            <input type="button" value="add channel" onClick={this.onClickAddChannelHandler.bind(this)} />
            <p>{this.state.channel}</p>
          </div>
          <div>
            <h5>picker</h5>
            {this.state.pickers.map((p) => {
              return (
                <label key={p.id}>
                  <span>{p.name}</span>
                  <input key={p.id} type="checkbox" checked={p.enabled}
                    onChange={this.onChangePickerInputHandler.bind(this, p.id)}
                  /><br />
                </label>
              )
            })}
            <p>{this.state.pickers.filter(p => p.enabled).map(p => p.name).join(',')}</p>
          </div>
        </div>
        <Logs />
        <UserNameDialog />
      </div>
    )
  }

  onChangePickerInputHandler(pickerId) {
    const pickers = this.state.pickers.slice();
    for (let i_p = 0; i_p < pickers.length; i_p++) {
      const p = pickers[i_p];
      if (p.id === pickerId) {
        p.enabled = !p.enabled;
        break;
      }
    }
    this.setState({ pickers });
  }

  onChangeChannelSelectorHandler(e: ChangeEvent<HTMLSelectElement>) {
    const { currentTarget: target } = e;
    if (target instanceof HTMLSelectElement) {
      const { value: channel } = target;
      this.setState({ channel });
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
}
