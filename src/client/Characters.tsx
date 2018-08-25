'use strict';

import React, { ChangeEvent } from 'react';
import { GraphCaller } from './GraphCaller';
import { Notifier, notifier } from './Notifier';
import './handler.css';
import { Connection } from './socketeer/Connection';
import { MaboToast } from './MaboToast';

export interface character {
  id: string;
  roomId: string;
  columnsJson: string;
  name: string;
  showOnResource: boolean;
  text: string;
}
interface ICharactersState {
  inputCharacterName: string
  characters: character[];
}

export class Characters extends React.Component<{}, ICharactersState> {
  notifiers: notifier[] = [];
  hasMounted: boolean = false;
  constructor(props) {
    super(props);
    this.state = {
      inputCharacterName: '',
      characters: [],
    };
    this.notifiers.push(
      Notifier.on('characterInfoSync', this.characterInfoSyncHandler.bind(this)),
    );
  }

  componentDidMount() {
    this.hasMounted = true;
    this.reloadCharacterData();
  }
  
  componentWillUnmount() {
    this.hasMounted = false;
    Notifier.offs(this.notifiers);
  }

  characterInfoSyncHandler(characters) {
    if (!this.hasMounted) {
      console.warn('[warn] unmount後のコンポーネントでのstateの更新をスキップしました');
      return false;
    }
    this.setState({ characters });
  }

  async reloadCharacterData() {
    const query = `
    query ($roomId: String!){
      character(roomId: $roomId) {
        _id
        roomId
        columnsJson
        name
        showOnResource
        text
      }
    }`;
    const variables = {
      roomId: Connection.roomId
    }

    return GraphCaller.call(query, variables)
      .then((json) => {
        const { data } = json;
        const { character } = data;
        const characters = character.map((c) => ({
          id: c._id,
          roomId: c.roomId,
          columnsJson: c.columnsJson,
          name: c.name,
          showOnResource: c.showOnResource,
          text: c.text,
        }))
        Notifier.emit('characterInfoSync', characters);
      })
  }

  render() {
    return (
      <div>
        <input type="form" onKeyUp={this.onKeyUpCharacterNameInputHandler.bind(this)} />
        <input type="button" value="create character" onClick={this.onClickCreateCharacterHandler.bind(this)} />
        {this.state.inputCharacterName}
        {this.state.characters.map((c) => (<p key={c.id}>{c.id}:{c.name}</p>))}
      </div>
    );
  }

  onClickCreateCharacterHandler() {
    const name = this.state.inputCharacterName;
    const roomId = Connection.roomId;
    if (name.trim().length === 0) {
      MaboToast.danger('空白以外の文字を1文字以上入力してください');
      return false;
    }
    const mutation = `
    mutation($roomId:String! $name:String!){
      createCharacter(
        roomId: $roomId
        name: $name
      ){
        _id
        roomId
        columnsJson
        name
        showOnResource
        text
      }
    }
    `;
    const variables = {
      roomId,
      name,
    }
    GraphCaller.call(mutation, variables)
  }

  onKeyUpCharacterNameInputHandler(e: ChangeEvent<HTMLInputElement>) {
    const { currentTarget: target } = e;
    if (target instanceof HTMLInputElement) {
      const { value: inputCharacterName } = target;
      this.setState({ inputCharacterName });
    }
  }
}