"use strict";

const CU        = require('./commonUtil.js');
const timestamp = require('./_timestamp.js');
const toast     = require('./_toast.js');
const Modal     = require('./_Modal.js');
const Mediator  = require('./_Mediator.js');

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
  
  this.$modalContent = undefined;
  this.$modal        = undefined;
  
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
  
  this.$condition = $(`<div></div>`);
  this.$thumbnail = $(`<div></div>`, {css: {'max-height': '400px', overflow: 'scroll'}});
  this.$editTag   = $(`<div></div>`);
  this.$action    = $(`<div></div>`);
  
  /*
   * 検索部品
   */
  
  /*
   * フリーワード検索
   */
  this.$textSearchForm = $(`<input>`, {
    type       : 'form',
    placeholder: 'タグ検索に使用する文字列'
  });
  
  /*
   * 検索ボタン
   */
  this.$searchButton = $(`<input>`, {
    type : 'button',
    value: '検索',
    name : 'imageManager-search',
  });
  
  /*
   * 既存タグで使用率が高いタグ
   */
  this.$popularTags = $(`<div>使用率 222222 3333333</div>`);
  
  /*
   * シナリオ内の画像のみ検索するフラグ
   */
  this.$scenarioOnly     = $(`<div></div>`);
  let $scenarioOnlyLabel = $(`<label></label>`, {
    for: 'imageManager-scenarioOnly',
  }).text('同じシナリオの画像のみ表示する');
  let $scenarioOnlyCheck = $(`<input>`, {
    id     : 'imageManager-scenarioOnly',
    type   : 'checkbox',
    checked: this.inScenarioOnly
  });
  
  /*
   * 隠し画像を検索するフラグ
   */
  this.$showHidden     = $(`<div></div>`);
  let $showHiddenLabel = $(`<label></label>`, {
    for: 'imageManager-showHidden'
  }).text('隠し画像を表示');
  let $showHiddenCheck = $(`<input>`, {
    id     : 'imageManager-showHidden',
    name   : 'showHiddenCheckBox',
    type   : 'checkbox',
    checked: this.usePassPhrase
  });
  let $showHiddenInput = $(`<input>`, {
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
  this.$editTag      = $(`<div></div>`);
  let $editTagInput  = $(`<input>`, {
    type       : 'form',
    placeholder: 'タグをスペース区切りで入力'
  });
  let $editTagButton = $(`<input>`, {
    type : 'button',
    value: 'タグ更新',
    name : 'imageManager-tagUpdater'
  });
  
  /*
   * 削除ボタン
   */
  this.$deleteButton = $('<input>', {
    type : 'button',
    value: '削除',
    name : 'imageManager-delete'
  });
  
  /*
   * 割当ボタン
   */
  this.$attachButton = $('<input>', {
    type : 'button',
    value: '割り当て',
    name : 'imageManager-assign'
  });
  
  /*
   * DOM組み立て
   */
  this.$condition.append(this.$textSearchForm);
  this.$condition.append(this.$searchButton);
  this.$condition.append(this.$popularTags);
  this.$modalContent.append(this.$condition);
  
  this.$scenarioOnly.append($scenarioOnlyCheck);
  this.$scenarioOnly.append($scenarioOnlyLabel);
  this.$condition.append(this.$scenarioOnly);
  
  this.$showHidden.append($showHiddenCheck);
  this.$showHidden.append($showHiddenLabel);
  this.$showHidden.append($showHiddenInput);
  this.$condition.append($(this.$showHidden));
  
  this.$editTag.append($editTagInput);
  this.$editTag.append($editTagButton);
  this.$modalContent.append(this.$editTag);
  
  this.$action.append(this.$deleteButton);
  
  /*
   * コールバック関数をコンストラクタに渡した場合のみ割当ボタンを表示
   */
  if (this.callback) {
    this.$action.append(this.$attachButton);
  }
  this.$modalContent.append(this.$action);
  
  this.$modalContent.append(this.$thumbnail);
  
  this.show();
  
  this.$textSearchForm[0].focus();
  
  /*
   * イベントリスナ付与
   */
  
  this.$searchButton.on('click', () => {
    this.fetchImages();
  });
  
  this.$deleteButton.on('click', () => {
    this.deleteImages();
  });
  
  this.$attachButton.on('click', () => {
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
  let tagString = this.$textSearchForm.val();
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
  this.inScenarioOnly = this.$scenarioOnly.find('input').prop('checked');
};

/**
 * パスフレーズ入力フォームとチェックボックスの状態から、パスフレーズ使用フラグとパスフレーズの設定を行う。
 * 無効なパスフレーズだった場合は、パスフレーズ使用フラグをfalseへ設定する。
 *
 * @returns {boolean}
 */
ImageManager.prototype.getPassPhrase = function() {
  
  let usePassPhrase = this.$showHidden.find('input[name=showHiddenCheckBox]').prop('checked');
  let passPhrase    = this.$showHidden.find('input[name=passPhraseInput]').val().trim();
  
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
    toast.warn('タグを指定してください。');
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
  this.$thumbnail.empty();
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
  image.$dom     = $(`<div></div>`, {
    addClass: 'z-depth-1',
    css     : {
      display       : 'inline-block',
      "margin-right": '0.4em',
      padding       : '0.2em'
    }
  });
  let $image     =
        $('<img>', {
          width : '150px',
          height: 'auto'
        }).attr('src', image.src);
  let $form      = $('<div></div>');
  let $fileName  = $('<h6></h6>').text(image.name);
  let $tags      = $('<p></p>').text(image.tags);
  let $tagsInput = $('<input>', {type: 'form', placeholder: '個別タグを入力'}).val(image.tags);
  $form.append($fileName);
  $form.append($tags);
  $form.append($tagsInput);
  image.$dom.append($form);
  image.$dom.append($image);
  this.$thumbnail.append(image.$dom);
  
  
  /*
   * イベント付与
   */
  $tagsInput.on('blur', () => {
    let tagString = $tagsInput.val();
    let tagArray  = (CU.parseTagStringToArray(tagString));
    
    let data = {
      key : image.key,
      tags: tagArray,
    };
    CU.callApiOnAjax(`/images/tag`, 'patch', {data: data})
      .done((r) => {
        $($tags).text(tagArray);
        let index                   = this.thumbnails.findIndex((v) => {
          return v.key === image.key;
        });
        this.thumbnails[index].tags = tagArray;
      })
      .fail((e) => {
        console.error(e); // @DELETEME
      });
  });
  
  $image.on('click', () => {
    let wasSelected = ($image.attr('data-selected') === 'true');
    
    let isSelected = (wasSelected !== true);
    
    $image.attr('data-selected', isSelected);
    
    $image.parent('div').css({
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
};

module.exports = ImageManager;