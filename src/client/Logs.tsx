"use strict";
import * as React from "react";
import { Notifier } from "./Notifier";
import { Connection } from "./socketeer/Connection";
import { GraphCaller } from "./GraphCaller";
import { character } from "./Characters";
import { channel } from "./ChatForm";

interface log {
  id: string;
  socketId: string;
  userName: string;
  channelId: string;
  avatarId: string;
  content: string;
  faceId: string;
  characterId: string;
}

export interface picker extends channel {
  enabled: boolean,
}

interface ILogsState {
  pickers: picker[];
  logs: log[];
  characters: character[];
}

export class Logs extends React.Component<{}, ILogsState> {
  static instance?: Logs;
  constructor(props) {
    super(props);
    this.state = {
      pickers: [],
      logs: [],
      characters: [],
    };

    Notifier.on('channelInfo', this.channelInfoHandler.bind(this));
    this.loadAllPickers();

    Notifier.on('chatText', this.chatTextHandler.bind(this));
    this.loadAllChats();

    Notifier.on('syncCharacters', this.syncCharactersHandler.bind(this));
  }

  syncCharactersHandler(characters: character[]) {
    this.setState({ characters });
  }

  getCharacterNameById(characterId: string): string {
    const characters = this.state.characters;
    for (let i_c = 0; i_c < characters.length; i_c++) {
      const c = characters[i_c];
      if (c.id === characterId) {
        return c.name;
      }
    }
    // console.error(`characterId: ${characterId} に該当するデータが見つかりません`, characters);
    return '該当なし'
  }

  channelInfoHandler(channel) {
    const pickers = this.state.pickers;
    const picker = {
      id: channel.id,
      name: channel.name,
      enabled: true,
    }
    pickers.push(picker);
    this.setState({ pickers })
  }

  async loadAllPickers() {
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
    const log: any[] = [];
    const pickers: { id: string, name: string, enabled: boolean }[] = [];
    for (let i_p = 0; i_p < this.state.pickers.length; i_p++) {
      const p = this.state.pickers[i_p];
      if (p.enabled) {
        pickers.push(p);
      }
    }
    for (let i_l = 0; i_l < this.state.logs.length; i_l++) {
      const l = this.state.logs[i_l];
      let pick = false;
      let channelName = '';
      for (let i_p = 0; i_p < pickers.length; i_p++) {
        const p = pickers[i_p];
        if (p.id === l.channelId) {
          pick = true;
          channelName = p.name;
          break;
        }
      }
      if (!pick) {
        continue;
      }
      const characterName = this.getCharacterNameById(l.characterId);
      log.push(<p key={l.id}>{characterName}({l.userName})({channelName}),{l.content}</p>);
    }

    return (
      <div>
        <h4>logs</h4>
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
        </div>
        {log}
      </div>
    )
  }
}
