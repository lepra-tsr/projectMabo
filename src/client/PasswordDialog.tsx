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
}

export class PasswordDialog extends React.Component<IPasswordDialogProps, IPasswordDialogState> {
  constructor(props: IPasswordDialogProps) {
    super(props);
    this.state = {
      inputPassword: '',
    }
  }

  render() {
    return (
      <Dialog isOpen={this.props.isOpen} title={this.props.title}>
        <div className={Classes.DIALOG_BODY}>
          <p>password?</p>
          <input type={'form'} onChange={this.onChangePasswordInputHandler.bind(this)}/>
          <Button onClick={this.onClickLoginButtonHandler.bind(this)}>ログイン</Button>
        </div>
      </Dialog>
    );
  }

  onChangePasswordInputHandler(e: ChangeEvent<HTMLInputElement>) {
    const { currentTarget: target } = e;
    if (target instanceof HTMLInputElement) {
      const { value: inputPassword } = target;
      this.setState({ inputPassword });
    }
  }

  onClickLoginButtonHandler() {
    const query = `mutation ($roomId:String! $password:String!){
      tokenCreate(roomId:$roomId password:$password) {
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
        const { data } = json;
        const { tokenCreate } = data;
        if (!tokenCreate) {
          const msg = 'ログインに失敗しました。部屋が存在しないか、パスワードが誤っているかもしれません';
          MaboToast.danger(msg);
          return false;
        } else {
          const msg = 'ログイン成功。画面が切り替わるまでお待ち下さい';
          MaboToast.success(msg);
          const hash:string = tokenCreate.hash;
          const uri:string = `/room/${roomId}/${hash}`;
          location.href = uri;
        }
      })
  }
}