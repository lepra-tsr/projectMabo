'use strict';

import * as React from 'react';

import './handler.css';
import { Dialog, Classes, Button } from "@blueprintjs/core";
import { ChangeEvent } from 'react';

export interface IPasswordDialogProps {
  isOpen: boolean,
  title: string,
}

export interface IPasswordDialogState {
  inputPassword?: string
}

export class PasswordDialog extends React.Component<IPasswordDialogProps, IPasswordDialogState> {
  constructor(props: IPasswordDialogProps) {
    super(props);
    this.state = {
      inputPassword: ''
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
  }
}