"use strict";
import * as React from "react";
import { Listener } from "./Listener";
import { Connection } from "./socketeer/Connection";
import { GraphCaller } from "./GraphCaller";
import { Pickers } from "./Pickers";

interface ILogsState {
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

export class Logs extends React.Component<{}, ILogsState> {
  static instance?: Logs;
  constructor(props) {
    super(props);
    this.state = {
      logs: [],
    };
  }

  componentDidMount() {
    Listener.on('chatText', this.chatTextHandler.bind(this));
    this.loadAllChats();
  }

  async loadAllChats() {
    const query = `
    query($roomId:String!){
      chat(roomId:$roomId) {
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
    const variables = { roomId: Connection.roomId };
    try {
      const { data } = await GraphCaller.call(query, variables);
      const { chat } = data;
      const logs = chat.map((c) => ({
        id: c._id,
        socketId: c.socketId,
        userName: c.userName,
        channelId: c.channelId,
        avatarId: c.avatarId,
        content: c.content,
        faceId: c.faceId,
      }));
      this.setState({ logs });
    } catch (e) {
      console.error(e);
    }
  }

  chatTextHandler(chat) {
    const logs = this.state.logs.slice();
    logs.push(chat);
    this.setState({ logs });
  }

  render() {
    return (
      <div>
        <h4>logs</h4>
        {this.state.logs
          .map((l) => (<p key={l.id}>{l.userName}({l.socketId}),{l.content}</p>))}
        <Pickers />
      </div>
    )
  }
}
