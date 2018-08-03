'use strict';

import * as React from 'react';

import './handler.css';
import { Dialog, Classes, Button } from "@blueprintjs/core";
import { ChangeEvent } from 'react';
import { GraphCaller, IGraphCallerVariables } from "./GraphCaller";
import { MaboToast } from "./MaboToast";

export interface IPasswordDialogProps {
  isOpen: boolean;
}

export interface IPasswordDialogState {
  inputPassword?: string;
  isOpen: boolean;
  title?: string;
}

export class PasswordDialog extends React.Component<IPasswordDialogProps, IPasswordDialogState> {

  static instance ?: PasswordDialog;
  roomId ?: string;

  constructor(props: IPasswordDialogProps) {
    super(props);

    /* singleton */
    if (typeof PasswordDialog.instance === 'object') {
      return PasswordDialog.instance
    }
    PasswordDialog.instance = this;

    this.state = {
      inputPassword: '',
      isOpen: false,
      title: '',
    }
  }

  render() {
    return (
      <Dialog isOpen={this.state.isOpen} title={this.state.title}>
        <div className={Classes.DIALOG_BODY}>
          <p>password?</p>
          <input type={'form'} onChange={this.onChangePasswordInputHandler.bind(this)}/>
          <Button onClick={this.onClickCloseDialog.bind(this)}>キャンセル</Button>
          <Button onClick={this.onClickLoginButtonHandler.bind(this)}>ログイン</Button>
        </div>
      </Dialog>
    );
  }

  static show(roomId: string, title: string) {
    if (PasswordDialog.instance) {
      const tis = PasswordDialog.instance;
      tis.roomId = roomId;
      tis.setState({ isOpen: true, title });
    }
  }

  onChangePasswordInputHandler(e: ChangeEvent<HTMLInputElement>) {
    const {currentTarget: target} = e;
    if (target instanceof HTMLInputElement) {
      const {value: inputPassword} = target;
      this.setState({inputPassword});
    }
  }

  onClickCloseDialog() {
    console.log('aa'); // @DELETEME
  }

  onClickLoginButtonHandler() {
    const query = `mutation ($roomId:String! $password:String!){
      createToken(roomId:$roomId password:$password) {
        roomId
        hash
        timestamp
        expireDate
        _id
      }
    }`;
    const roomId = this.roomId;
    const password = this.state.inputPassword;
    const variables: IGraphCallerVariables = {
      roomId,
      password,
    };
    GraphCaller.call(query, variables)
      .then((json) => {
        const {data} = json;
        const {createToken} = data;
        if (!createToken) {
          const msg = 'ログインに失敗しました。部屋が存在しないか、パスワードが誤っているかもしれません';
          MaboToast.danger(msg);
          return false;
        }
        const msg = 'ログイン成功。画面が切り替わるまでお待ち下さい';
        MaboToast.success(msg);

        const hash: string = createToken.hash;
        const credential = encodeURIComponent(JSON.stringify({roomId, hash}));
        const cookie = `mabo_auth=${credential}; max-age=300`;
        const prevCookie = document.cookie;
        document.cookie = `${prevCookie}; ${cookie}`;
        const uri: string = `/room/${roomId}`;
        location.href = uri;
      })
      .catch((x) => {
        console.error(x);
      })
  }
}