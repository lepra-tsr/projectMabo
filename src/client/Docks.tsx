'use strict';

import React, { CSSProperties } from 'react';
import Rnd from 'react-rnd';

const IPSUM = 'クーロンの法則は1785年から89年にかけて発見されたが、それまでの電磁気学（確立していないがそれに関する研究）は、かなり曖昧で定性的なものであった。\n電磁気学は、1600年にギルバートはコハクが摩擦でものを引きつける現象から、物質を電気性物質、非電気性物質として区別したことに始まり、1640年にはゲーリケによって放電が確認された。\n18世紀に入った1729年にグレイが金属が電気的性質を伝えることを発見し、その作用を起こす存在を電気と名付けた。彼はギルバートの電気性物質の区別を、電気を導く物質として導体、電気を伝えない物質を不導体と分類した。1733年、デュ・フェが摩擦によって生じる電気には二つの性質があり、同種間では反発し、異種間では引き合うこと、そして異種の電気を有する物質どうしを接触させると中和して電気的作用を示さなくなることを発見した。1746年にはライデン瓶が発明され、電気を蓄える技術を手に入れた。1750年には検電器が発明され、これらからフランクリンが電気にプラスとマイナスの区別をつけることでデュ・フェの現象を説明した。\nフランクリンの手紙に示唆されて、プリーストリーは1766年に中空の金属容器を帯電させ、内部の空気中に電気力が働かないことを示し、重力との類推から電気力が距離の2乗に反比例すると予想した[1][2]。1769年にジョン・ロビソン(John Robison)は実験により同種電荷の斥力は距離の2.06乗に反比例し、異種電荷の引力は距離の2以下の累乗に反比例することを見いだした。しかしこの結果は1803年まで公表されなかった[3]。1773年にイギリスのキャヴェンディッシュは同心にした2個の金属球の外球を帯電させ、その二つを帯電させたときに内球に電気が移らないことから逆二乗の法則を導き出した。これはまさにクーロンの法則であり、クーロンよりも早く、しかも高い精度で求めていた。しかし、彼は研究資料を机にしまい込んで発表しなかったためにおよそ100年の間公表されなかった。';
const OFFSET = 20;
const DELTA = 15;

/*
 * 機能要件メモ
 * 
 * ✔ 表示(使いざま)
 * ✔ 削除
 * 上下フィット
 * ✔ ドラッグで移動……ヘッダ 
 * ✔ リサイズ
 * 位置初期化API
 * ✔ 重ね順(一番上とそれ以外)
 * ✔ フォーカス時の重ね順変更
 */
interface IDocks {
  items: item[]
}

interface item {
  key: number;
  zIndex: number;
  title: string;
  content: JSX.Element | string;
  size?: { width: number, height: number };
  position?: { x: number, y: number };
  default?: { x: number, y: number, width?: number, height?: number };
  onClose: () => void;
  onBubbleUp: () => void;
}

export interface IAddItem {
  title: string;
  content: JSX.Element | string;
  size?: { width: number, height: number };
  position?: { x: number, y: number };
  default?: { x: number, y: number, width?: number, height?: number };
}
export default class Docks extends React.Component<{}, IDocks> {
  static _: Docks;
  index: number = 0;
  constructor(props) {
    super(props);
    if (typeof Docks._ === 'object') {
      return Docks._;
    }
    Docks._ = this;

    this.state = {
      items: []
    }
  }

  static addItem(args: IAddItem): number {
    return Docks._.addItem(args);
  }

  addItem({ title, content, position: _position, default: _default }: IAddItem): number {
    const { items } = this.state;
    const key = this.index;
    const offset = OFFSET + this.index * DELTA;
    const newItem = {
      key,
      zIndex: items.length + 1,
      title: title || 'no title',
      content: content || IPSUM,
      position: _position,
      default: _default || { x: offset, y: offset },
      onClose: this.removeItem.bind(this, key),
      onBubbleUp: this.bubbleUp.bind(this, key),
    };
    items.push(newItem);
    this.setState({ items });
    this.index++;

    return key;
  }

  static removeItem(key: number) {
    Docks._.removeItem(key);
  }

  removeItem(key: number) {
    const { items } = this.state;
    for (let i_i = 0; i_i < items.length; i_i++) {
      const i = items[i_i];
      if (i.key === key) {
        items.splice(i_i, 1);
        break;
      }
    }
    this.setState({ items });
  }

  static bubbleUp(key: number) {
    return Docks._.bubbleUp(key);
  }

  bubbleUp(key: number) {
    const { items } = this.state;
    items.sort((x, y) => {
      const xZ = x.zIndex;
      const yZ = y.zIndex;
      return (xZ > yZ) ? 1 : -1;
    })
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      item.zIndex = (item.key === key) ? items.length + 1 : i;
    }
    this.setState({ items });
  }

  alignItems() {
    const { items } = this.state;
    const newItems: item[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const offset: number = OFFSET;
      const x: number = offset + i * DELTA;
      const y: number = offset + i * DELTA;
      const newKey = this.index;
      const newItem: item = {
        key: newKey,
        content: item.content,
        zIndex: item.zIndex,
        title: item.title,
        size: item.size,
        default: { x, y },
        onClose: this.removeItem.bind(this, newKey),
        onBubbleUp: this.bubbleUp.bind(this, newKey),
      };
      newItems.push(newItem);
      this.index++;
    }

    this.setState({ items: newItems });
  }

  render() {
    const args: IAddItem = {
      title: 'sample',
      content: IPSUM,
    }
    return (
      <div>
        {this.renderDock.call(this)}
        <button type="button" onClick={this.addItem.bind(this, args)}>push</button>
        <button type="button" onClick={this.alignItems.bind(this)}>align</button>
      </div>
    )
  }

  renderDock() {
    const { items } = this.state
    const elList: JSX.Element[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const s: { [key: string]: CSSProperties } = {
        rnd: {
          border: '1px silver dashed',
          backgroundColor: 'lightblue',
          overflowX: 'hidden',
          overflowY: 'hidden',
          zIndex: item.zIndex,
        },
        h: {
          border: '1px lightgray dashed',
          backgroundColor: 'ghostwhite',
          display: 'flex',
        },
        b: {
          backgroundColor: 'white',
          whiteSpace: 'pre-wrap',
          wordBreak: 'normal',
          overflowWrap: 'normal',
        },
      }
      const rndProps = {
        default: item.default,
        dragHandleClassName: '.handle',
        onDragStart: item.onBubbleUp,
        onResizeStart: item.onBubbleUp,
      }
      const el = (
        <Rnd key={item.key}
          // ref={(i) => this.rnd = i}
          style={s.rnd} {...rndProps}>
          <div onClick={item.onBubbleUp} className="handle" style={s.h}>
            <div>
              <button type="button" onClick={item.onClose}>close</button>
            </div>
            <div>
              <span>{item.title}</span>
            </div>
          </div>
          <div onClick={item.onBubbleUp} style={s.b}>{item.content}</div>
        </Rnd >);
      elList.push(el);
    }
    return elList;
  }
}