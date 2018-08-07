'use strict';

import * as React from 'react';

import { Dialog, Classes, Button, IDialogProps } from "@blueprintjs/core";
import { ChangeEvent } from 'react';
import { SessionContainer } from "./SessionContainer";
import './handler.css';
import { GraphCaller, IGraphCallerVariables } from './GraphCaller';
import { Connection } from './socketeer/Connection';
import { MaboToast } from './MaboToast';

export interface IUserNameDialogProps {
}

export interface IUserNameDialogState {
  isOpen: boolean;
  inputValue: string;
}

export class UserNameDialog extends React.Component<IUserNameDialogProps, IUserNameDialogState> {

  static instance?: UserNameDialog;

  constructor(props: IUserNameDialogProps) {
    super(props);

    if (typeof UserNameDialog.instance === 'object') {
      return UserNameDialog.instance
    }
    UserNameDialog.instance = this;

    const userName: string = SessionContainer.getUserName();

    this.state = {
      inputValue: userName,
      isOpen: true,
    }
  }

  render() {
    const dialogProp: IDialogProps = {
      autoFocus: true,
      canEscapeKeyClose: false,
      canOutsideClickClose: false,
      isCloseButtonShown: false,
      isOpen: this.state.isOpen,
      title: 'ユーザ名',
    };
    return (
      <Dialog  {...dialogProp}>
        <div className={Classes.DIALOG_BODY}>
          <p>string</p>
          <input type={'form'} value={this.state.inputValue} onChange={this.onChangeUserNameInputHandler.bind(this)} />
          <Button onClick={this.onClickFixUserNameHandler.bind(this)}>決定</Button>
        </div>
      </Dialog>
    );
  }

  static show() {
    if (UserNameDialog.instance) {
      const tis = UserNameDialog.instance;
      tis.setState({ isOpen: true });
    }
  }

  onChangeUserNameInputHandler(e: ChangeEvent<HTMLInputElement>) {
    const { currentTarget: target } = e;
    if (target instanceof HTMLInputElement) {
      const { value: inputValue } = target;
      this.setState({ inputValue });
    }
  }

  onClickFixUserNameHandler() {
    if (SessionContainer.instance instanceof SessionContainer) {
      SessionContainer.instance.setState({ userName: this.state.inputValue })
    }
    this.patchUserName()
      .then(() => {
      this.setState({ isOpen: false });
    })
  }

  /**
   * @return {Promise}
   */
  patchUserName() {
    return new Promise((resolve, reject) => {
      const query = `
      mutation($socketId:String!, $name:String!){
        updateUser(socketId:$socketId name:$name){
          name
        }
      }`;
      const { socketId } = Connection;
      const name = this.state.inputValue;
      const variables: IGraphCallerVariables = { socketId, name };
      GraphCaller.call(query, variables)
        .then((json) => {
          const { data } = json;
          const { updateUser }: { updateUser?: { name: string } } = data;

          if (!updateUser) {
            reject(json);
            return false; 
          }
          const { name }: { name: string } = updateUser;
          Connection.userName = name;
          const msg: string = `接続ユーザ名を"${name}"に変更しました！`;
          MaboToast.success(msg)
          resolve();
        }).catch((e) => {
          const msg = `接続ユーザ名の変更に失敗しました`;
          MaboToast.danger(msg)
          console.error(e);
          reject(e);
        })
    })
  }
}