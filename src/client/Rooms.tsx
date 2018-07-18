'use strict';

import React from 'react';
import {Button} from '@blueprintjs/core';
import {Room, IRoomProps} from './Room';
import './handler.css';

interface ILobbyState {
  scenarios: IRoomProps[];
}

export class Rooms extends React.Component<{}, ILobbyState> {
  constructor(props) {
    super(props);
    const lorem = '複素数体であれば、任意のCM-タイプの A は、実際、数体である定義体（英語版）(field of definition)を持っている。自己準同型環の可能なタイプは、対合（ロサチの対合（英語版）(Rosati involution）をもつ環として既に分類されていて、CM-タイプのアーベル多様体の分類を導き出す。楕円曲線と同じような方法でCM-タイプの多様体を構成するには、Cd の中の格子 Λ から始め、アーベル多様体のリーマンの関係式（英語版）(Riemann relations)を考えに入れる必要がある。 CM-タイプ(CM-type)は、単位元での A の正則接空間上にある EndQ(A) の（最大）可換部分環 L の作用を記述したものである。単純な種類のスペクトル理論が適応され、L が固有ベクトルの基底を通して作用することを示すことができる。言い換えると、L は A の正則ベクトル場の上の対角行列を通した作用を持っている。L 自体がある複数の体の積というよりも数体であるという単純な場合には、CM-タイプは L の複素埋め込み（英語版）(complex embedding)のリストである。複素共役をなすペアとして、2d 個の複素埋め込みがあり、CM-タイプは各々のペアのから一つを選択する。そのようなCM-タイプの全てが実現されることが知られている。';
    this.state = {
      scenarios: [
        {id: 0, title: 'The hound of Kiritani', description: lorem,},
        {id: 1, title: 'The Candle', description: lorem,},
        {id: 2, title: 'Tower of hand', description: lorem,},
        {id: 3, title: 'Ghost Machine', description: lorem,},
      ]
    };
  }

  render() {
    const style = {
      button: {
        marginTop: '150px',
        marginLeft: '20%',
        width: '60%',
      }
    };

    return (
      <div>
        <Button style={style.button}>Create new scenario</Button>
        {this.state.scenarios.map((s: IRoomProps) => <Room key={s.id} {...s}/>)}
      </div>
    );
  }
}