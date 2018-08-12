"use strict";
import * as React from "react";
import { ChangeEvent } from 'react';
import { Listener } from "./Listener";
import { Connection } from "./socketeer/Connection";
import { GraphCaller } from "./GraphCaller";

interface IChannelsState {
  inputChannel: string,
  channel: string,
  channels: {
    id: string,
    name: string,
  }[],
}

export class Channels extends React.Component<{}, IChannelsState> {
  static instance?: Channels;
  constructor(props) {
    super(props);
    this.state = {
      inputChannel: '',
      channel: '',
      channels: [],
    };
  }

  componentDidMount() {
    Listener.on('channelInfo', this.channelInfoHandler.bind(this));
    this.loadAllChannels();
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

  channelInfoHandler(channel) {
    const channels = this.state.channels;
    channels.push(channel);
    this.setState({ channels })
  }

  render() {
    return (
      <div>
        <h5>channel</h5>
        <select value={this.state.channel}
          onChange={this.onChangeChannelSelectorHandler.bind(this)}>
          {this.state.channels
            .map((c) => (<option value={c.id} key={c.id}>{c.name}</option>))}
        </select>
        <input type="form" onKeyUp={this.onKeyUpChannelNameInputHandler.bind(this)} />
        <input type="button" value="add channel" onClick={this.onClickAddChannelHandler.bind(this)} />
        {/* <p>{this.state.channel}</p> */}
      </div>
    )
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
