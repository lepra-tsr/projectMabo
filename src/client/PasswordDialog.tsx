'use strict';

import * as React from 'react';

import './handler.css';
import { Dialog, Classes, Button } from "@blueprintjs/core";
import { ChangeEvent } from 'react';
import { GraphCaller, IGraphCallerVariables } from "./GraphCaller";
import { MaboToast } from "./MaboToast";

export interface IPasswordDialogProps {
  isOpen: boolean;
  _id: string;
  title: string;
}

export interface IPasswordDialogState {
  inputPassword?: string;
  isOpen: boolean;
}

export class PasswordDialog extends React.Component<IPasswordDialogProps, IPasswordDialogState> {
  constructor(props: IPasswordDialogProps) {
    super(props);
    this.state = {
      inputPassword: '',
      isOpen: this.props.isOpen,
    }
  }

  render() {
    return (
      <Dialog isOpen={this.props.isOpen} title={this.props.title}>
        <div className={Classes.DIALOG_BODY}>
          <p>password?</p>
          <input type={'form'} onChange={this.onChangePasswordInputHandler.bind(this)}/>
          <Button onClick={this.onClickCloseDialog.bind(this)}>キャンセル</Button>
          <Button onClick={this.onClickLoginButtonHandler.bind(this)}>ログイン</Button>
        </div>
      </Dialog>
    );
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
    const roomId = this.props._id;
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