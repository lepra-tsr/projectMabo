"use strict";

const CU         = require('./commonUtil.js');
const timestamp  = require('./_timestamp.js');
const Modal      = require('./_Modal.js');
const Mediator   = require('./_Mediator.js');

const ScenarioInfo = require('./_ScenarioInfo.js');
const sInfo        = new ScenarioInfo();
const socket       = sInfo.socket;

const mediator = new Mediator();

/**
 * 画像管理ダイアログに対応するクラス。
 *
 * アップロードした画像の検索、論理削除、タグ変更、マップ上のオブジェクトへの割当を行う。
 *
 * @constructor
 * @param _callback
 */
let ImageManager = function(_callback) {
  this.callback = undefined;
  if (typeof _callback === 'function') {
    this.callback = _callback;
  }
  
  this.modalContent = undefined;
  this.modal        = undefined;
  
  let config = {
    id           : 'image-manager',
    type         : 'footer',
    title        : '画像管理',
    removeOnClose: true
  };
  Modal.call(this, config);
  
  this.thumbnails     = [];
  this.searchTag      = [];
  this.inScenarioOnly = true;
  this.usePassPhrase  = false;
  this.passPhrase     = '';
  
  this.conditionDom = $(`<div></div>`);
  this.thumbnailDom = $(`<div></div>`, {css: {'max-height': '400px', overflow: 'scroll'}});
  this.editTagDom   = $(`<div></div>`);
  this.actionDom    = $(`<div></div>`);
  
  /*
   * 検索部品
   */
  
  /*
   * フリーワード検索
   */
  this.textSearchFormDom = $(`<input>`, {
    type       : 'form',
    placeholder: 'タグ検索に使用する文字列'
  });
  
  /*
   * 検索ボタン
   */
  this.searchButtonDom = $(`<input>`, {
    type : 'button',
    value: '検索',
    name : 'imageManager-search',
  });
  
  /*
   * 既存タグで使用率が高いタグ
   */
  this.popularTagsDom = $(`<div>使用率 222222 3333333</div>`);
  
  /*
   * シナリオ内の画像のみ検索するフラグ
   */
  this.scenarioOnlyDom     = $(`<div></div>`);
  let scenarioOnlyLabelDom = $(`<label></label>`, {
    for: 'imageManager-scenarioOnly',
  }).text('同じシナリオの画像のみ表示する');
  let scenarioOnlyCheckDom = $(`<input>`, {
    id     : 'imageManager-scenarioOnly',
    type   : 'checkbox',
    checked: this.inScenarioOnly
  });
  
  /*
   * 隠し画像を検索するフラグ
   */
  this.showHiddenDom     = $(`<div></div>`);
  let showHiddenLabelDom = $(`<label></label>`, {
    for: 'imageManager-showHidden'
  }).text('隠し画像を表示');
  let showHiddenCheckDom = $(`<input>`, {
    id     : 'imageManager-showHidden',
    name   : 'showHiddenCheckBox',
    type   : 'checkbox',
    checked: this.usePassPhrase
  });
  let showHiddenInputDom = $(`<input>`, {
    type       : 'form',
    name       : 'passPhraseInput',
    placeholder: 'パスワード',
  }).val(this.passPhrase);
  
  /*
   * ボタン群
   */
  
  /*
   * タグ編集
   */
  this.editTagDom      = $(`<div></div>`);
  let editTagInputDom  = $(`<input>`, {
    type       : 'form',
    placeholder: 'タグをスペース区切りで入力'
  });
  let editTagButtonDom = $(`<input>`, {
    type : 'button',
    value: 'タグ更新',
    name : 'imageManager-tagUpdater'
  });
  
  /*
   * 削除ボタン
   */
  this.deleteButtonDom = $('<input>', {
    type : 'button',
    value: '削除',
    name : 'imageManager-delete'
  });
  
  /*
   * 割当ボタン
   */
  this.attachButtonDom = $('<input>', {
    type : 'button',
    value: '割り当て',
    name : 'imageManager-assign'
  });
  
  /*
   * DOM組み立て
   */
  $(this.conditionDom).append($(this.textSearchFormDom));
  $(this.conditionDom).append($(this.searchButtonDom));
  $(this.conditionDom).append($(this.popularTagsDom));
  $(this.modalContent).append($(this.conditionDom));
  
  $(this.scenarioOnlyDom).append($(scenarioOnlyCheckDom));
  $(this.scenarioOnlyDom).append($(scenarioOnlyLabelDom));
  $(this.conditionDom).append($(this.scenarioOnlyDom));
  
  $(this.showHiddenDom).append($(showHiddenCheckDom));
  $(this.showHiddenDom).append($(showHiddenLabelDom));
  $(this.showHiddenDom).append($(showHiddenInputDom));
  $(this.conditionDom).append($(this.showHiddenDom));
  
  $(this.editTagDom).append($(editTagInputDom));
  $(this.editTagDom).append($(editTagButtonDom));
  $(this.modalContent).append($(this.editTagDom));
  
  $(this.actionDom).append($(this.deleteButtonDom));
  
  /*
   * コールバック関数をコンストラクタに渡した場合のみ割当ボタンを表示
   */
  if (this.callback) {
    $(this.actionDom).append($(this.attachButtonDom));
  }
  $(this.modalContent).append($(this.actionDom));
  
  $(this.modalContent).append($(this.thumbnailDom));
  
  this.show();
  
  $(this.textSearchFormDom)[0].focus();
  
  /*
   * イベントリスナ付与
   */
  
  $(this.searchButtonDom).on('click', () => {
    this.fetchImages();
  });
  
  $(this.deleteButtonDom).on('click', () => {
    this.deleteImages();
  });
  
  $(this.attachButtonDom).on('click', () => {
    let imageInfo = this.getSelectedImage();
    if (imageInfo === false) {
      /*
       * 画像が2つ以上、または選択していなかった場合は何もしない
       */
      return false;
    }
    this.callback(imageInfo);
    this.hide();
  });
};

Object.assign(ImageManager.prototype, Modal.prototype);

/**
 * 選択した画像を論理削除する。
 *
 * @returns {boolean}
 */
ImageManager.prototype.deleteImages = function() {
  let targetKeys = this.thumbnails.filter((v) => {
    return v.selected === true;
  }).map((v) => {
    return v.key;
  });
  
  if (targetKeys.length === 0) {
    return false;
  }
  
  let param = {
    key       : targetKeys,
    scenarioId: sInfo.id
  };
  
  let query = CU.getQueryString(param);
  
  CU.callApiOnAjax(`/images${query}`, 'delete')
    .done((r) => {
      this.fetchImages();
    })
    .fail((e) => {
      console.error(e);
    })
};

/**
 * タグ検索フォームからタグを配列形式で取得する。
 */
ImageManager.prototype.getSearchTag = function() {
  let tagString = $(this.textSearchFormDom).val();
  /*
   * セパレータでパースして配列へ変換する
   * * 全角/半角スペース
   * * 全角/半角カンマ
   * * 読点
   */
  this.searchTag = CU.parseTagStringToArray(tagString)
};

/**
 *  シナリオ内検索チェックボックスからチェック状態を取得する。
 */
ImageManager.prototype.getScenarioOnly = function() {
  this.inScenarioOnly = $(this.scenarioOnlyDom).find('input').prop('checked');
};

/**
 * パスフレーズ入力フォームとチェックボックスの状態から、パスフレーズ使用フラグとパスフレーズの設定を行う。
 * 無効なパスフレーズだった場合は、パスフレーズ使用フラグをfalseへ設定する。
 *
 * @returns {boolean}
 */
ImageManager.prototype.getPassPhrase = function() {
  
  let usePassPhrase = $(this.showHiddenDom).find('input[name=showHiddenCheckBox]').prop('checked');
  let passPhrase    = $(this.showHiddenDom).find('input[name=passPhraseInput]').val().trim();
  
  if (usePassPhrase !== true) {
    this.usePassPhrase = false;
    this.passPhrase    = '';
    return false;
  }
  
  if (passPhrase.length === 0 || passPhrase.length > 10) {
    this.usePassPhrase = false;
    this.passPhrase    = '';
    return false;
  }
  
  this.usePassPhrase = true;
  this.passPhrase    = passPhrase;
  return true;
};

/**
 * 検索条件を使用し、検索APIから該当する画像のキーを取得する。
 * その後、認証済みURI発行APIから画像ごとに認証済みURIを取得して画像を表示する。
 */
ImageManager.prototype.fetchImages = function() {
  
  /*
   * 検索条件を指定
   */
  let param = {};
  
  /*
   * タグ検索
   */
  this.getSearchTag();
  if (this.searchTag.length !== 0) {
    param.tags = this.searchTag;
  } else {
    console.warn('タグを指定してください。');
    return false;
  }
  
  /*
   * シナリオ限定
   */
  this.getScenarioOnly();
  if (this.inScenarioOnly === true) {
    param.scenarioId = sInfo.id
  }
  
  /*
   * パスフレーズ指定
   */
  this.getPassPhrase();
  if (this.usePassPhrase === true) {
    param.passPhrase = this.passPhrase;
  }
  
  /*
   * 前回の検索結果を削除
   */
  $(this.thumbnailDom).empty();
  
  let query = CU.getQueryString(param);
  
  CU.callApiOnAjax(`/images${query}`, 'get')
    .done((results) => {
      
      results.forEach((result) => {
        let name   = result.name || 'noName';
        let tags   = result.tags || [];
        let key    = result.key;
        let width  = result.width;
        let height = result.height;
        
        let query = CU.getQueryString({key: result.key});
        
        CU.callApiOnAjax(`/images/signedURI/getObject${query}`, 'get')
          .done((r) => {
            
            let image      = {};
            image.src      = r.uri;
            image.name     = name;
            image.key      = key;
            image.width    = width;
            image.height   = height;
            image.tags     = tags;
            image.selected = false;
            this.pushImage(image);
          })
          .fail((r) => {
            console.error(r);
            return false;
          })
      })
    })
    .fail((r) => {
      console.error(r);
      return false;
    })
};

/**
 * サムネイルを挿入する。
 *
 * @param image
 */
ImageManager.prototype.pushImage = function(image) {
  /*
   * DOM作成
   */
  image.dom        = $(`<div></div>`, {
    addClass: 'z-depth-1',
    css     : {
      display       : 'inline-block',
      "margin-right": '0.4em',
      padding       : '0.2em'
    }
  });
  let imageDom     =
        $('<img>', {
          width : '150px',
          height: 'auto'
        }).attr('src', image.src);
  let formDom      = $('<div></div>');
  let fileNameDom  = $('<h6></h6>').text(image.name);
  let tagsDom      = $('<p></p>').text(image.tags);
  let tagsInputDom = $('<input>', {type: 'form', placeholder: '個別タグを入力'}).val(image.tags);
  $(formDom).append($(fileNameDom));
  $(formDom).append($(tagsDom));
  $(formDom).append($(tagsInputDom));
  $(image.dom).append($(formDom));
  $(image.dom).append($(imageDom));
  $(this.thumbnailDom).append($(image.dom));
  
  
  /*
   * イベント付与
   */
  $(tagsInputDom).on('blur', () => {
    let tagString = $(tagsInputDom).val();
    let tagArray  = (CU.parseTagStringToArray(tagString));
    
    let data = {
      key : image.key,
      tags: tagArray,
    };
    CU.callApiOnAjax(`/images/tag`, 'patch', {data: data})
      .done((r) => {
        $(tagsDom).text(tagArray);
        let index                   = this.thumbnails.findIndex((v) => {
          return v.key === image.key;
        });
        this.thumbnails[index].tags = tagArray;
      })
      .fail((e) => {
        console.error(e); // @DELETEME
      });
  });
  
  $(imageDom).on('click', () => {
    let wasSelected = ($(imageDom).attr('data-selected') === 'true');
    
    let isSelected = (wasSelected !== true);
    
    $(imageDom).attr('data-selected', isSelected);
    
    $(imageDom).parent('div').css({
      border: (isSelected) ? '1px solid teal' : 'none'
    });
    
    let index = this.thumbnails.findIndex((v) => {
      return v.key === image.key;
    });
    
    this.thumbnails[index].selected = isSelected;
  });
  
  this.thumbnails.push(image);
};

/**
 * 選択中の画像情報を返却する。複数の画像を選択している場合はfalseを返却する
 */
ImageManager.prototype.getSelectedImage = function() {
  /*
   * 選択中の画像
   */
  let imageInfoArray = this.thumbnails.filter((v) => {
    return v.selected;
  });
  
  if (imageInfoArray.length !== 1) {
    
    console.warn('画像を複数選択しているか、選択していません。');
    return false;
  }
  
  let imageInfo = imageInfoArray[0];
  
  return imageInfo;
}

module.exports = ImageManager;