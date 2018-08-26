'use strict';

import React, { CSSProperties, ChangeEvent } from 'react';
import { GraphCaller } from './GraphCaller';
import { Connection } from './socketeer/Connection';
import { MaboToast } from './MaboToast';

interface IPhotographerState {
  images: IImage[];
}

interface IImage {
  file: Blob;
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

      const pAll: Promise<IImage>[] = [];
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
        if (!(currentTarget instanceof FileReader)) { throw Error('ファイルの読み込みに失敗しました') }

        const dataUrl = currentTarget.result;
        if (typeof dataUrl !== 'string') { throw Error('data url の取得に失敗しました') }

        const img = new Image();
        img.src = dataUrl;
        img.onload = () => {
          const { width, height } = img;
          const picked = false;
          const tags = [];
          const {
            name,
            size: byteSize,
            type: mimeType,
          } = f;
          const fileName = encodeURIComponent(name);
          const image: IImage = {
            file: f,
            picked,
            tags,
            fileName,
            dataUrl,
            byteSize,
            mimeType,
            width,
            height,
          }
          resolve(image);
        }
      };
      fr.readAsDataURL(f)
    })
  }

  async onClickUploadButtonHandler() {
    const { images } = this.state;
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      (
        async () => {
          try {
            const { key, signedUrlForPut } = await this.getKeyAndSignedUrlForPut(image);
            await this.putImageBlobFileToS3(image, signedUrlForPut);
            await this.registerImageKeyToDB(image, key);
            MaboToast.success(`${image.fileName}のアップロードに成功しました`)
          } catch (e) {
            console.error(e);
            MaboToast.danger(`${image.fileName}画像のアップロードに失敗しました`);
          }
        }
      ).call(this);
    }
  }

  async getKeyAndSignedUrlForPut(image: IImage): Promise<{ key: string, signedUrlForPut: string }> {
    const { fileName, mimeType, } = image;
    const timestamp = new Date().getTime();
    const key = `images/${timestamp}_${fileName}`;
    const contentType = mimeType;

    const query = `
      query ($key:String! $contentType:String!){
        signedUrlForPut(key: $key, contentType: $contentType)
      }`;
    const variablesSignedUrlPut = { key, contentType }
    const json = await GraphCaller.call(query, variablesSignedUrlPut);

    const { data } = json;
    const { signedUrlForPut }: { signedUrlForPut: string } = data;

    return { key, signedUrlForPut };
  }

  async putImageBlobFileToS3(image: IImage, signedUrlForPut): Promise<void> {
    const { file, mimeType: contentType, } = image;

    const response = await fetch(signedUrlForPut, {
      method: 'PUT',
      headers: {
        'content-type': contentType,
      },
      body: file,
    })
    if (!response.ok) {
      console.error(response);
      throw new Error('アップロードに失敗');
    }
  }

  async registerImageKeyToDB(image: IImage, key: string): Promise<void> {
    const { fileName, mimeType, height, width, byteSize, } = image;
    const mutation = `
      mutation (
        $roomId: String!
        $fileName: String!
        $key: String!
        $mimeType: String!
        $height: Int!
        $width: Int!
        $byteSize: Int!
      ){
        createImage(
          roomId: $roomId
          fileName: $fileName
          key: $key
          mimeType: $mimeType
          height: $height
          width: $width
          byteSize: $byteSize
        ) { _id }
      }`;
    const variablesSignedUrlGet = {
      roomId: Connection.roomId,
      fileName,
      key,
      mimeType,
      height,
      width,
      byteSize,
    };
    await GraphCaller.call(mutation, variablesSignedUrlGet)
  }
}