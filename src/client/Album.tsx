'use strict';

import React, { CSSProperties } from 'react';
import { GraphCaller } from './GraphCaller';

interface IAlbumState {
  images: IImage[]
}

interface IImage {
  id: string;
  roomId: string;
  fileName: string;
  key: string;
  url: string;
  mimeType: string;
  height: number;
  width: number;
  byteSize: number;
  tags: string[];
}
export class Album extends React.Component<{}, IAlbumState> {
  constructor(props) {
    super(props)
    this.state = {
      images: []
    }

    this.loadAllImages();
  }

  async loadAllImages() {
    const query = `
      query {
        image {
          id:_id
          roomId
          fileName
          key
          mimeType
          height
          width
          byteSize
          url
        }
      }`;
    GraphCaller.call(query)
      .then((json) => {
        const { data } = json;
        const { image } = data;
        this.setState({ images: image });
      })
  }

  render() {
    const style: { [key: string]: CSSProperties } = {
      container: {
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'baseline',
      }
    }
    return (
      <div style={style.container}>
        {this.renderImages.call(this)}
      </div>
    )
  }

  renderImages() {
    const { images } = this.state;
    const elList: JSX.Element[] = []
    for (let i = 0; i < images.length; i++) {
      const { key, url } = images[i];
      const el: JSX.Element = (
        <div key={key}>
          <img width={200} src={url} />
        </div>
      )
      elList.push(el);
    }
    return elList;
  }
}