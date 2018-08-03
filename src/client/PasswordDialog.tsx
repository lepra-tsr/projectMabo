'use strict';

import * as React from 'react';

import './handler.css';
import { Dialog, Classes, Button, IDialogProps } from "@blueprintjs/core";
import { ChangeEvent } from 'react';
import { MaboToast } from "./MaboToast";
import { Auth } from "./Auth";

export interface IPasswordDialogProps {
  canOutsideClickClose:boolean
}

export interface IPasswordDialogState {
  inputPassword?: string;
  isOpen: boolean;
  title?: string;
}

export class PasswordDialog extends React.Component<IPasswordDialogProps, IPasswordDialogState> {

  static instance ?: PasswordDialog;
  roomId ?: string;
  cancel ?: Function;

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
    const dialogProp: IDialogProps = {
      autoFocus: true,
      canEscapeKeyClose: false,
      canOutsideClickClose: this.props.canOutsideClickClose,
      isCloseButtonShown: false,
      onClose: this.onCloseHandler.bind(this),
      isOpen: this.state.isOpen,
      title: this.state.title,
    };
    return (
      <Dialog  {...dialogProp}>
        <div className={Classes.DIALOG_BODY}>
          <p>password?</p>
          <input type={'form'} onChange={this.onChangePasswordInputHandler.bind(this)}/>
          <Button onClick={this.onClickLoginButtonHandler.bind(this)}>ログイン</Button>
          <Button onClick={this.onCancelDialog.bind(this)}>キャンセル</Button>
        </div>
      </Dialog>
    );
  }

  onCloseHandler() {
    this.setState({ isOpen: false });
  }

  static show(roomId: string, title: string, cancel?: Function) {
    if (PasswordDialog.instance) {
      const tis = PasswordDialog.instance;
      tis.roomId = roomId;
      tis.cancel = cancel;
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

  onCancelDialog() {
    this.onCloseHandler();
    if (typeof this.cancel === 'function') {
      this.cancel();
    }
  }

  onClickLoginButtonHandler() {
    const roomId = this.roomId;
    const password = this.state.inputPassword;
    if (!roomId) {
      const msg = '[システムエラー] 無効な部屋情報です';
      MaboToast.danger(msg);
      console.error(roomId);
      return false;
    }
    if (!password) {
      const msg = 'パスワードを入力してください';
      MaboToast.danger(msg);
      return false;
    }

    Auth.verify(roomId, password)
      .then(() => {
        const msg = 'ログイン成功。画面が切り替わるまでお待ち下さい';
        MaboToast.success(msg);
        const uri: string = `/room/${roomId}`;
        location.href = uri;
      })
      .catch((x) => {
        const msg = 'ログインに失敗しました。部屋が存在しないか、パスワードが誤っているかもしれません';
        MaboToast.danger(msg);
        console.error(x);
      });
  }
}