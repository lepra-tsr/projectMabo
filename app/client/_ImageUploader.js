"use strict";

const CU        = require('./commonUtil.js');
const timestamp = require('./_timestamp.js');
const Modal     = require('./_Modal.js');

require('dotenv').config();

const scenarioId = CU.getScenarioId();

/**
 * 画像アップローダーに対応するクラス
 *
 * @constructor
 */
let ImageUploader = function() {
  this.modalContent = undefined;
  this.modal        = undefined;
  
  let config = {
    id           : 'image-uploader',
    type         : 'footer',
    title        : '画像登録',
    removeOnClose: true,
  };
  Modal.call(this, config);
  
  this.images    = [];
  this.commonTag = [];
  
  this.setPassPhrase = false;
  this.passPhrase    = '';
  
  /*
   * 上部ファイルピッカー、アップロード
   * 共通タグ編集
   * 選択した画像一覧
   */
  this.formDom          = $(`<div></div>`, {});
  this.tagsDom          = $(`<div></div>`, {});
  this.setPassPhraseDom = $(`<div></div>`, {});
  this.imagesDom        = $(`<div></div>`, {});
  
  /*
   * アップロードボタン
   */
  this.uploadButtonDom =
    $(`<input>`, {
      type : 'button',
      value: 'アップロード',
      name : 'imageUpload',
    })
      .css({float: 'right'});
  
  /*
   * ダミーの画像ファイルピッカー。クリックで非表示のinputをトリガーする
   */
  let fakeFilePickerDom = $('<input>', {
    type : 'button',
    value: '画像ファイルを選択',
    name : 'imagePicker',
  });
  
  /*
   * デフォルトスタイルのファイルピッカー。非表示クラスを付与して隠す
   */
  this.filePickerDom = $(`<input>`, {
    addClass: 'd-none',
    href    : '#',
    name    : 'imageSelector',
    type    : 'file',
    accept  : 'image/*',
    multiple: true
  });
  
  /*
   * 共通タグ部分
   */
  let commonTagLabelDom = $('<label></label>', {
    for: 'commonTags'
  });
  let commonTagInputDom = $('<input>', {
    id         : 'commonTags',
    placeholder: '共通タグ(「 」「　」「,」「、」で区切って複数入力できます)',
    addClass   : 'browser-default',
    type       : 'form'
  });
  
  /*
   * パスフレーズの設定
   */
  let setPassPhraseInputDom = $(`<input>`, {
    type       : 'form',
    name       : 'passPhraseInput',
    placeholder: 'パスワードを設定',
  }).val(this.passPhrase);
  
  /*
   * 画像サムネイル部分
   */
  let imageListDom = $(`<ul></ul>`, {
    addClass: 'list-group'
  });
  
  /*
   * ファイル選択解除ボタン
   */
  this.unSelectButtonDom = $(`<input>`, {
    type : 'button',
    value: 'クリア',
    name : 'unselect',
  });
  
  /*
   * DOM組み立て
   */
  $(this.formDom).append($(this.uploadButtonDom));
  $(this.formDom).append($(fakeFilePickerDom));
  $(this.formDom).append($(this.filePickerDom));
  $(this.modalContent).append($(this.formDom));
  
  $(this.tagsDom).append($(commonTagLabelDom));
  $(this.tagsDom).append($(commonTagInputDom));
  $(this.modalContent).append($(this.tagsDom));
  
  $(this.setPassPhraseDom).append($(setPassPhraseInputDom));
  $(this.modalContent).append($(this.setPassPhraseDom));
  
  $(this.modalContent).append($(this.unSelectButtonDom));
  
  $(this.imagesDom).append($(imageListDom));
  $(this.modalContent).append($(this.imagesDom));
  
  this.show();
  
  /*
   * イベントリスナ付与
   */
  
  /*
   * ファイルピッカーを押下したら秘匿している実体でクリックイベントをキック
   */
  $(fakeFilePickerDom).on('click', (e) => {
    $(this.filePickerDom).trigger('click');
  });
  $(this.filePickerDom).on('change', (e) => {
    this.onImagePick(e.target.files);
  });
  
  /*
   * アップロード処理
   */
  $(this.uploadButtonDom).on('click', () => {
    this.upload();
  });
  
  /*
   * 画像選択の解除
   */
  $(this.unSelectButtonDom).on('click', () => {
    this.unSelectImages('force');
  });
};

/*
 * プロトタイプをマージ
 */
Object.assign(ImageUploader.prototype, Modal.prototype);

/**
 * パスフレーズ入力フォームからパスフレーズを取得し、有効なパスフレーズの場合はパスフレーズ使用フラグを設定する。
 *
 * @returns {boolean}
 */
ImageUploader.prototype.getPassPhrase = function() {
  
  let passPhrase = $(this.setPassPhraseDom).find('input[name=passPhraseInput]').val().trim();
  
  if (passPhrase.length === 0 || passPhrase.length > 10) {
    this.setPassPhrase = false;
    this.passPhrase    = '';
    return false;
  }
  
  this.setPassPhrase = true;
  this.passPhrase    = passPhrase;
};

/**
 * 共通タグを配列形式で取得
 *
 * @returns {Array}
 */
ImageUploader.prototype.getCommonTag = function() {
  let tagString = $(this.tagsDom).find('input').val();
  
  /*
   * セパレータでパースして配列へ変換する
   * * 全角/半角スペース
   * * 全角/半角カンマ
   * * 読点
   */
  this.commonTag = CU.parseTagStringToArray(tagString);
};


/**
 * 画像のアップロード処理
 * 取り込んだ画像をAmazon S3へアップロードする。
 */
ImageUploader.prototype.upload = function() {
  
  /*
   * 画面をロック
   */
  
  /*
   * 共通タグ情報を付与
   */
  this.getCommonTag();
  
  /*
   * パスフレーズを指定
   */
  this.getPassPhrase();
  
  /*
   * アップロード処理
   */
  this.images
    .filter((img) => {
      /*
       * ゴミ箱アイコンで選択解除した画像は送信時に無視する
       */
      return img.ignore !== true
    })
    .forEach((img) => {
      /*
       * 個別タグ情報
       */
      
      /*
       * 共通タグと個別タグをマージ
       */
      img.tags = img.tags
        .concat(this.commonTag)
        .filter((v, i, a) => {
          return a.indexOf(v) === i;
        });
      
      /*
       * タイムスタンプとファイル名をアンダースコアで接続
       */
      let query = CU.getQueryString({key: img.key, contentType: img.contentType});
      
      /*
       * Amazon S3のAPIへPOSTするための一時URIを取得
       */
      CU.callApiOnAjax(`/images/signedURI/putObject${query}`, 'get')
        .done((signedUri, status) => {
          /*
           * CORS用の設定
           */
          let option = {
            contentType: img.contentType,
            processData: false,
          };
          
          /*
           * 画像をAmazon S3へアップロード。
           * 一時URIにPUTする
           */
          CU.callApiOnAjax(signedUri, 'put', {data: img.binary}, option)
            .done((r) => {
              
              let s3Info = {
                key        : img.key,
                name       : img.name,
                fileSize   : img.fileSize,
                width      : img.width,
                height     : img.height,
                contentType: img.contentType,
                scenarioId : scenarioId,
                tags       : [].concat(img.tags),
              };
              
              /*
               * パスフレーズの指定があった場合は追加
               */
              if (this.setPassPhrase === true) {
                s3Info.passPhrase = this.passPhrase;
              }
              
              /*
               * S3へアップロードが成功したら、リソースのURIをDBへ登録する
               */
              CU.callApiOnAjax(`/images/s3`, 'put', {data: s3Info})
                .done((r) => {
                  /*
                   * 画像のアップロード・登録処理完了
                   */
                  console.log(`アップロード完了: ${img.name}`);
                })
                .fail((r) => {
                  console.error('画像アップロードには成功しましたが、画像情報の登録に失敗しました。');
                  console.error(r);
                  return false;
                })
            })
            .fail((r) => {
              console.error('Amazon s3へのアップロードに失敗しました。');
              console.error(r);
              return false;
            })
          
        })
        .fail((r, status) => {
          console.warn('Amazon s3一時認証URIの取得に失敗しました。');
          console.warn(r);
          return false;
        });
    });
  this.unSelectImages('force');
};

/**
 * S3に画像ファイルをアップロードする際、同バケット内で一意なキー文字列を指定する必要がある。
 * 厳密なユニークにはならないが、秒単位のタイムスタンプをファイル名に付与してキー文字列を生成する。
 *
 * @param input
 * @returns {string}
 */
ImageUploader.prototype.generateKey = function(input) {
  
  let _timestamp = timestamp();
  
  return `images/${_timestamp}_${input}`;
};

/**
 * サムネイルDOMの初期化。
 * forceを指定した場合は、ファイルピッカーの値もクリアする。
 *
 * @param force
 */
ImageUploader.prototype.unSelectImages = function(force) {
  /*
   * ファイルピッカーの選択を削除
   * 選択中File配列を初期化
   * DOMを削除
   */
  this.images = [];
  $(this.imagesDom).find('ul').empty();
  
  if (force === 'force') {
    $(this.filePickerDom).val('');
  }
};

/**
 * ファイルピッカーのchangeイベントから呼び出すメソッド
 * Filesオブジェクトを取得し、this.imagesへ取り込んでDOMを生成する
 *
 * @param _files
 * @returns {boolean}
 */
ImageUploader.prototype.onImagePick = function(_files) {
  
  let files = _files;
  
  /*
   * ファイルピッカーのchangeイベントから呼ぶ
   * ファイルを指定しない場合は何もしない
   */
  if (!files.length) {
    return false;
  }
  
  this.unSelectImages();
  
  let extensionError = false;
  for (let i = 0; i < files.length; i++) {
    
    let thumbnailListDom = $(this.imagesDom).find('ul');
    
    if (!/(\.png|\.jpg|\.jpeg|\.gif)$/i.test(files[i].name)) {
      /*
       * 対応していない画像拡張子の場合はエラー表示してスキップ
       */
      extensionError = true;
      $(thumbnailListDom)
        .append(`<li></li>`)
        .append(`<span>${files[i].name}</span><span>&nbsp;-&nbsp;読み込めませんでした。</span>`);
      continue;
    }
    
    /*
     * dataUrlとして読み込み(プレビュー用)
     */
    let fr_dataUrl = new FileReader();
    fr_dataUrl.readAsDataURL(files[i]);
    fr_dataUrl.onload = (e) => {
      
      /*
       * ファイルピッカー経由でFileReaderがdataUrlとして読み込み完了したら
       * 仮想の画像DOMを作成して参照先を読み込み結果へ指定する
       */
      let img = new Image();
      
      img.src    = fr_dataUrl.result;
      img.onload = () => {
        /*
         * 画像DOMを作成してDOMに追加したら、
         * サムネイルと情報、個別タグ編集フォームの追加
         */
        let imageChip = $(`<li data-listindex="${i}" data-ignore="false" class="z-depth-1" style="margin:1em 0em;padding:1em;">` +
          `<div style="float:right;">` +
          `<h6>${files[i].name}</h6>` +
          `<p>` +
          `${img.width}x${img.height},&nbsp;${Math.round(files[i].size / 1024)}kbytes` +
          `&nbsp;<i data-listindex="${i}" style="color:red;" class="fa fa-trash"></i>` +
          `</p>` +
          `<input class="browser-default" type="text" name="imageTagForm" data-listindex="${i}" placeholder="立ち絵 笑顔,日本人 女性" style="font-size:11px;"/>` +
          `</div>` +
          `<img src="${fr_dataUrl.result}" width="150" height="150">` +
          `</li>`);
        
        $(thumbnailListDom).append(imageChip);
        
        /*
         * 情報をひとまとめにしてimages配列へ格納する
         * ファイル名はタイムスタンプと結合する
         */
        this.images.push({
          index      : i,
          dom        : $(imageChip),
          key        : this.generateKey(files[i].name),
          name       : files[i].name,
          contentType: files[i].type,
          fileSize   : files[i].size,
          width      : img.width,
          height     : img.height,
          binary     : files[i],
          tags       : []
        });
        
        /*
         * ゴミ箱アイコンをクリックすると、非選択状態にする
         */
        $(`i[data-listindex=\"${i}\"]`).on('click', () => {
          let li     = $(`li[data-listindex=\"${i}\"]`);
          let ignore = ($(li).attr('data-ignore') === 'false' ? true : false);
          
          $(li).attr('data-ignore', ignore)
            .css('opacity', (ignore === true ? '0.3' : '1.0' ));
          let index                 = this.images.findIndex((v) => {
            return v.index === i;
          });
          this.images[index].ignore = ignore;
        });
        
        /*
         * 個別タグの編集フォームにイベント付与
         */
        $(`input[name=imageTagForm][data-listindex=\"${i}\"]`).on('blur', (e) => {
          let that = e.target;
          /*
           * カンマと半角スペースでパースする
           */
          let tagString = $(that).val().trim();
          let tagArray  = CU.parseTagStringToArray(tagString);
          
          this.images[i].tags = tagArray;
          
          $(`span[data-listindex=\"${i}\"]`).remove();
          
          if (tagArray.length === 0) {
            return;
          }
          
          tagArray.forEach((v) => {
            /*
             * 既に同名のタグが存在する場合は作成しない
             */
            $(that).before(
              `<span name="imageTags" data-listindex="${i}" data-imagetag="${v}">${v}&nbsp;</span>`
            );
          });
        })
      };
    }
  }
  if (extensionError) {
    toast.warn('読み取れない識別子のファイルがあります。');
  }
};

module.exports = ImageUploader;