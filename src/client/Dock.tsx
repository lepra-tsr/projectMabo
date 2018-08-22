'use strict';
import * as React from 'react';

export class Dock extends React.Component {
  render() {
    const items = [
      { key: 'chat' },
      { key: 'character' },
      { key: 'log' },
      { key: 'dice' },
    ]
    const style: { [key: string]: React.CSSProperties } = {
      container: {
        position: 'fixed',
        display: 'flex',
        justifyContent: 'space-evenly',
        width: '20%',
        transform: 'translate(30px, 30px)',
        border: 'black 1px solid',
      },
      item: {
        width: '50px',
        height: '50px',
        backgroundColor: 'ghostwhite',
        border: 'lightgray 1px dashed',
      }
    }
    return (
      <div style={style.container}>
        {items.map((i) => (<div style={style.item} key={i.key} onClick={this.onClickItemHandler.bind(this)} >{i.key}</div>))}
      </div>
    )
  }

  onClickItemHandler(key: string) {
    
  }
}