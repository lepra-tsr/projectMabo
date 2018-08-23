'use strict';

import React, { CSSProperties } from 'react';
import Rnd from 'react-rnd';

const IPSUM = 'クーロンの法則は1785年から89年にかけて発見されたが、それまでの電磁気学（確立していないがそれに関する研究）は、かなり曖昧で定性的なものであった。\n電磁気学は、1600年にギルバートはコハクが摩擦でものを引きつける現象から、物質を電気性物質、非電気性物質として区別したことに始まり、1640年にはゲーリケによって放電が確認された。\n18世紀に入った1729年にグレイが金属が電気的性質を伝えることを発見し、その作用を起こす存在を電気と名付けた。彼はギルバートの電気性物質の区別を、電気を導く物質として導体、電気を伝えない物質を不導体と分類した。1733年、デュ・フェが摩擦によって生じる電気には二つの性質があり、同種間では反発し、異種間では引き合うこと、そして異種の電気を有する物質どうしを接触させると中和して電気的作用を示さなくなることを発見した。1746年にはライデン瓶が発明され、電気を蓄える技術を手に入れた。1750年には検電器が発明され、これらからフランクリンが電気にプラスとマイナスの区別をつけることでデュ・フェの現象を説明した。\nフランクリンの手紙に示唆されて、プリーストリーは1766年に中空の金属容器を帯電させ、内部の空気中に電気力が働かないことを示し、重力との類推から電気力が距離の2乗に反比例すると予想した[1][2]。1769年にジョン・ロビソン(John Robison)は実験により同種電荷の斥力は距離の2.06乗に反比例し、異種電荷の引力は距離の2以下の累乗に反比例することを見いだした。しかしこの結果は1803年まで公表されなかった[3]。1773年にイギリスのキャヴェンディッシュは同心にした2個の金属球の外球を帯電させ、その二つを帯電させたときに内球に電気が移らないことから逆二乗の法則を導き出した。これはまさにクーロンの法則であり、クーロンよりも早く、しかも高い精度で求めていた。しかし、彼は研究資料を机にしまい込んで発表しなかったためにおよそ100年の間公表されなかった。';
// const IPSUM = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
export default class DndContainer extends React.Component {
  render() {
    return (<div>
      {this.renderDock.call(this)}
    </div>)
  }

  renderDock() {
    return (
      <div>
        <Dock son={IPSUM} />
        <Dock son={IPSUM} default={{ x: 0, y: 0, width: 300, height: 200 }} />
      </div>
    )
  }
}

interface IDockProps {
  son: string | JSX.Element;
  default?: { x: number, y: number, width?: number, height?: number };
}
interface IDockState {
  zIndex: number;
}
class Dock extends React.Component<IDockProps, IDockState> {
  rnd;
  static instances: Dock[] = [];
  constructor(props) {
    super(props);
    this.state = {
      zIndex: 0
    }
    Dock.instances.push(this);
  }

  bubbleUp() {
    const { instances } = Dock;
    for (let i = 0; i < instances.length; i++) {
      const d = instances[i];
      if (d === this) { continue }
      const { state } = d;
      const { zIndex } = state;
      if (zIndex > 0) {
        d.setState({ zIndex: 0 })
      }
    }
    this.setState({ zIndex: 1 });
  }

  render() {
    const s: { [key: string]: CSSProperties } = {
      rnd: {
        border: '1px silver dashed',
        backgroundColor: 'lightblue',
        overflowX: 'hidden',
        overflowY: 'hidden',
        zIndex: this.state.zIndex,
      },
      h: {
        border: '1px lightgray dashed',
        backgroundColor: 'ghostwhite',
      },
      b: {
        backgroundColor: 'white',
        whiteSpace: 'pre-wrap',
        wordBreak: 'normal',
        overflowWrap: 'normal',
      },
    }
    const rndProps = {
      default: this.props.default,
      dragHandleClassName: '.handle',
    }

    return (
      <Rnd ref={(i) => this.rnd = i} style={s.rnd} {...rndProps}>
        <div onClick={this.bubbleUp.bind(this)} className="handle" style={s.h}>h</div>
        <div onClick={this.bubbleUp.bind(this)} style={s.b}>{this.props.son}</div>
      </Rnd>
    )
  }
}