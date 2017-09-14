"use strict";

const CU         = require('./commonUtil.js');
const trace      = require('./_trace.js');
const timestamp  = require('./_timestamp.js');
const Dialog     = require('./_Dialog.js');
const scenarioId = CU.getScenarioId();

/**
 * 画像管理ダイアログに対応するクラス。
 *
 * アップロードした画像の検索、論理削除、タグ変更、マップ上のオブジェクトへの割当を行う。
 *
 * @param target
 * @returns {boolean}
 * @constructor
 */
let ImageManager = function(target) {
    
    /*
     * シングルトン処理
     */
    let predecessor        = $('.ui-dialog.image-manager');
    let predecessorDisplay = $(predecessor).css('display');
    if (predecessor.length !== 0 && predecessorDisplay !== 'none') {
        /*
         * 既に表示している場合
         */
        this.setTarget(target);
        return false;
    } else if (predecessor.length !== 0 && predecessorDisplay === 'none') {
        /*
         * 表示して閉じたあとの場合
         */
    } else {
        /*
         * DOM上に存在しない場合
         */
    }
    
    this.dom = undefined;
    
    Dialog.call(this);
    
    this.thumbnails     = [];
    this.searchTag      = [];
    this.inScenarioOnly = true;
    this.usePassPhrase  = false;
    this.passPhrase     = '';
    
    this.conditionDom = $(`<div></div>`);
    this.thumbnailDom = $(`<div></div>`);
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
    this.assignButtonDom = $('<input>', {
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
    $(this.dom).append($(this.conditionDom));
    
    $(this.scenarioOnlyDom).append($(scenarioOnlyCheckDom));
    $(this.scenarioOnlyDom).append($(scenarioOnlyLabelDom));
    $(this.conditionDom).append($(this.scenarioOnlyDom));
    
    $(this.showHiddenDom).append($(showHiddenCheckDom));
    $(this.showHiddenDom).append($(showHiddenLabelDom));
    $(this.showHiddenDom).append($(showHiddenInputDom));
    $(this.conditionDom).append($(this.showHiddenDom));
    
    $(this.editTagDom).append($(editTagInputDom));
    $(this.editTagDom).append($(editTagButtonDom));
    $(this.dom).append($(this.editTagDom));
    
    $(this.actionDom).append($(this.deleteButtonDom));
    $(this.actionDom).append($(this.assignButtonDom));
    $(this.dom).append($(this.actionDom));
    
    $(this.dom).append($(this.thumbnailDom));
    
    this.dialog({
        title   : '画像管理',
        width   : '500px',
        position: 'right center',
    });
    
    /*
     * イベントリスナ付与
     */
    
    $(this.searchButtonDom).on('click', () => {
        this.fetchImages();
    })
};

Object.assign(ImageManager.prototype, Dialog.prototype);

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
    this.searchTag =
        (tagString || '' )
            .replace(/\s|、|，/g, ',')
            .split(',')
            .filter((v, i, a) => {
                return i === a.indexOf(v) && v !== '';
            });
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
    }
    
    /*
     * シナリオ限定
     */
    this.getScenarioOnly();
    if (this.inScenarioOnly === true) {
        param.scenarioId = scenarioId
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
    
    CU.callApiOnAjax(`/images/keys${query}`, 'get')
        .done((results) => {
            
            results.forEach((result) => {
                let param = {
                    key        : result.key,
                    contentType: result.contentType
                };
                let query = CU.getQueryString(param);
                
                CU.callApiOnAjax(`/images/signedURI/getObject${query}`, 'get')
                    .done((signedUri) => {
            
                        let image = {};
                        image.src = signedUri;
                        this.pushImage(image);
                    })
                    .fail((r) => {
                        trace.error(r);
                        return false;
                    })
            })
        })
        .fail((r) => {
            trace.error(r);
            return false;
        })
    
};

/**
 * サムネイルを挿入する。
 *
 * @param image
 */
ImageManager.prototype.pushImage = function(image) {
    image.dom = $(`<div></div>`, {});
    $(image.dom).append($('<img>').attr('src', image.src));
    
    $(this.thumbnailDom).append($(image.dom));
    this.thumbnails.push(image);
};

module.exports = ImageManager;