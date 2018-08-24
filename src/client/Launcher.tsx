'use strict';
import * as React from 'react';
import { Logs } from './Logs';
import { IAddItem, Docks } from './Docks';
import { ChatForm } from './ChatForm';

export class Launcher extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const style: { [key: string]: React.CSSProperties } = {
      outline: {
        position: 'fixed',
        top: '0px',
        left: '0px',
        transform: 'translate(200px, 20px)',
        backgroundColor: 'lightblue',
        border: '1px steelblue solid',
      }
    }
    return (
      <div style={style.outline}>
        {this.renderButtons.call(this)}
      </div>
    );
  }

  renderButtons(): JSX.Element[] {
    const items: IAddItem[] = [
      { content: (<Logs />), title: 'ログ', },
      { content: (<ChatForm />), title: 'チャットフォーム' },
    ]
    const elList: JSX.Element[] = []
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const { onClickLogLauncher } = this;
      const el = (
        <button type="button" onClick={onClickLogLauncher.bind(this, item)}>{item.title}</button>
      )
      elList.push(el);
    }
    return elList;
  }

  onClickLogLauncher(args: IAddItem) {
    Docks.addItem(args);
  }
}