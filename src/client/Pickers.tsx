"use strict";
import * as React from "react";
import { Listener } from "./Listener";
import { Connection } from "./socketeer/Connection";
import { GraphCaller } from "./GraphCaller";

interface IPickersState {
  pickers: {
    id: string,
    name: string,
    enabled: boolean,
  }[]
}

export class Pickers extends React.Component<{}, IPickersState> {
  static instance?: Pickers;
  constructor(props) {
    super(props);
    this.state = {
      pickers: [],
    };
  }

  componentDidMount() {
    Listener.on('channelInfo', this.channelInfoHandler.bind(this));
    this.loadAllPickers();
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

  render() {
    return (
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
        {/* <p>{this.state.pickers.filter(p => p.enabled).map(p => p.name).join(',')}</p> */}
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
}
