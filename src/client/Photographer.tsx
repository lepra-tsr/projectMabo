'use strict';

import React, { CSSProperties, ChangeEvent } from 'react';

interface IPhotographerState {
  images: image[];
}

interface image {
  fileName: string;
  dataUrl: string;
  byteSize: number;
  mimeType: string;
  width: number;
  height: number;
  picked: boolean;
  tags: string[];
}

export class Photographer extends React.Component<{}, IPhotographerState> {
  constructor(props) {
    super(props);
    this.state = {
      images: [],
    }
  }

  render() {
    const style: { [key: string]: CSSProperties } = {
      c: {
        marginTop: 100
      },
      images: {
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'baseline',
      }
    }
    return (
      <div style={style.c}>
        <div>
          <input multiple type="file" onChange={this.onChangeImageFilePickerHandler.bind(this)} />
          <input type="button" value="upload" onClick={this.onClickUploadButtonHandler.bind(this)}></input>
        </div>
        <div style={style.images}>
          {this.renderThumbnails.call(this)}
        </div>
      </div>
    )
  }

  renderThumbnails() {
    const elList: JSX.Element[] = [];
    const { images } = this.state;
    for (let i_i = 0; i_i < images.length; i_i++) {
      const {
        picked,
        fileName,
        dataUrl,
        byteSize,
        mimeType,
        width,
        height } = images[i_i];
      const kiloBytes = Math.floor(byteSize / 1024)
      const scription = `"${fileName}"`
      const title = `${width}x${height}, ${kiloBytes}KiB, ${mimeType}`
      const el: JSX.Element = (
        <div key={i_i}>
          <img
            src={dataUrl}
            title={title}
            width={180} />
          <label>
            <input type="checkbox" checked={picked} onChange={this.onChangeCheckboxHandler.bind(this, i_i)} />
            <span>{scription}</span>
          </label>
        </div>
      )
      elList.push(el);
    }
    return elList;
  }

  onChangeCheckboxHandler(i_i) {
    const { images } = this.state;
    const i = images[i_i];
    i.picked = !i.picked;
    this.setState({ images });
  }

  async onChangeImageFilePickerHandler(e: ChangeEvent) {
    const { currentTarget } = e;
    if (currentTarget instanceof HTMLInputElement) {
      const { files }: any = currentTarget;
      if (!files) {
        return false;
      }

      const pAll: Promise<image>[] = [];
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const p: Promise<any> = this.readImageFile(f);
        pAll.push(p);
      }
      const images = await Promise.all(pAll);
      this.setState({ images });
    }
  }

  async readImageFile(f) {
    return new Promise((resolve) => {
      const fr = new FileReader();
      fr.onloadend = (e) => {
        const { currentTarget } = e;
        if (currentTarget instanceof FileReader) {
          const dataUrl = currentTarget.result;
          if (typeof dataUrl !== 'string') {
            throw Error('data url の取得に失敗しました')
          }
          const img = new Image();
          img.src = dataUrl;
          img.onload = () => {
            const { width, height } = img;
            const picked = false;
            const tags = [];
            const {
              name: fileName,
              size: byteSize,
              type: mimeType,
            } = f;
            const image: image = { picked, tags, fileName, dataUrl, byteSize, mimeType, width, height, }
            resolve(image);
          }
        }
      };

      fr.readAsDataURL(f)
    })
  }

  async onClickUploadButtonHandler() {
    const { images } = this.state;
    for (let i_i = 0; i_i < images.length; i_i++) {
      /* get signature URI */
      /* put to S3 */
      /* put to Images */
    }
  }
}