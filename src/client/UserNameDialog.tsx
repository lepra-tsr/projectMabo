'use strict';

import * as React from 'react';

import { Dialog, Classes, Button, IDialogProps } from "@blueprintjs/core";
import { ChangeEvent } from 'react';
import { SessionContainer } from "./SessionContainer";
import './handler.css';

export interface IUserNameDialogProps {
}

export interface IUserNameDialogState {
  isOpen: boolean;
  inputValue: string;
}

export class UserNameDialog extends React.Component<IUserNameDialogProps, IUserNameDialogState> {

  static instance ?: UserNameDialog;

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
          <input type={'form'} value={this.state.inputValue} onChange={this.onChangeUserNameInputHandler.bind(this)}/>
          <Button onClick={this.onClickLoginAcceptHandler.bind(this)}>決定</Button>
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

  onClickLoginAcceptHandler() {
    if (SessionContainer.instance instanceof SessionContainer) {
      SessionContainer.instance.setState({ userName: this.state.inputValue })
    }
    this.setState({ isOpen: false });
  }
}