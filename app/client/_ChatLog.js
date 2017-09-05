"use strict";

const CU = require('./commonUtil.js');
const trace = require('./_trace.js');
const zango = require('zangodb');

let db   = new zango.Db(process.env.INDEXED_DB, [process.env.INDEXED_OBJECT_STORE]);
let chat = db.collection(process.env.INDEXED_OBJECT_STORE);

const scenarioId = CU.getScenarioId();


let socket = undefined;
/**
 * チャットログウィンドウに対応するオブジェクト。
 * @param jqueryDom
 * @param _socket
 * @param id
 * @constructor
 */
let ChatLog = function(jqueryDom, _socket, id) {
    socket          = _socket;
    this.id         = id;
    this.tags       = [];
    this.tagFilter  = [];
    this.format     = '';
    this.timestamp  = false;
    this.stickToTop = true;
    this.dom = jqueryDom;
    
    /*
     * スクロール用のDiv。配下にulエレメントでチャットログを持つ。
     */
    this.scrollParentDom = $(`<div></div>`, {
        css: {
            "position"     : 'absolute',
            "top"          : '0px',
            "left"         : '0px',
            "height"       : '100%',
            "width"        : '100%',
            "overflow-y"   : 'scroll',
            "overflow-wrap": 'break-word'
        }
    });
    
    /*
     * フォーム設定ボタン
     */
    this.configButtonDom = $(`<a></a>`, {
        "href": '#',
        css   : {
            "float": 'right'
        }
    }).text('[設定]');
    
    /*
     * チャットログ
     */
    this.logsDom = $(`<ul></ul>`, {
        "addClass": 'list-group',
        css       : {
            "margin"     : '0em',
            "font-size"  : '0.9em',
            "line-height": '1.2'
        }
    });
    
    /*
     * オプションメニューの表示div
     */
    this.optionDom = $('<div></div>', {
        css: {
            "padding"      : '2px',
            "border-radius": '4px',
            "position"     : 'absolute',
            "right"        : '10px',
            "z-index"      : '100',
            "text-align"   : 'right',
            "background"   : 'rgba(255,255,255,0.8)',
        }
    })
    
    /*
     * 表示チャンネルの選択
     */
    this.channelSelectDom = $(`<select></select>`, {
        "addClass": 'browser-default',
        css       : {
            "width" : 'auto',
            "height": '2em'
        }
    });
    
    // @DUMMY
    this.optionDoms = [];
    this.optionDoms.push($(`<option></option>`, {"value": '1'}).text('1:ALL'));
    this.optionDoms.push($(`<option></option>`, {"value": '2'}).text('2:メイン'));
    this.optionDoms.push($(`<option></option>`, {"value": '3'}).text('3:雑談'));
    this.optionDoms.push($(`<option></option>`, {"value": '4'}).text('4:追加する'));
    
    
    /*
     * 選択チャンネルの内容のみ表示する
     */
    this.filterDom = $(`<i>insert_comment</i>`)
        .addClass('material-icons')
        .css({"float": 'right'});
    
    /*
     * DOM組み立て
     */
    $(this.scrollParentDom).append($(this.logsDom));
    $(this.dom).append($(this.scrollParentDom));
    

    $(this.optionDom).append($(this.channelSelectDom));
    this.optionDoms.forEach((v) => {
        $(this.channelSelectDom).append($(v))
    });
    $(this.optionDom).append($(this.configButtonDom));
    $(this.optionDom).append($(this.filterDom));
    
    $(this.dom).append($(this.optionDom));
    
    
    
    this.render();
    this.scrollToTop();
};

/**
 * IndexedDBにレコードを挿入する。
 * インスタンスからプロトタイプメソッドを使用すると、インスタンスの数だけレコードを挿入してしまうので
 * Staticなメソッドとして実装して呼び出す
 *
 * @param _lines
 * @static
 */
ChatLog._insert = function(_lines) {
    /*
     * 入力が配列でなかった場合は配列へ変換
     */
    let lines = _lines instanceof Array === false ? [_lines] : _lines;
    
    /*
     * IndexedDBに追加
     */
    chat.insert(lines)
        .then(
            () => {
                return false;
            },
            (error) => {
                console.error(error);
                return false;
            }
        )
};

/**
 * IndexedDBのレコードを削除した後、MongoDBからIndexedDBへレコードをコピーする。
 *
 * @param callback
 * @private
 */
ChatLog._reload = function(callback) {
    chat.remove({})
        .then(
            () => {
                /*
                 * IndexedDBの初期化(全削除)が完了
                 */
                CU.callApiOnAjax(process.env.API_EP_LOGS, 'get', {data: {scenarioId: scenarioId}})
                    .done((result) => {
                        /*
                         * DBからチャットログの取得に成功
                         */
                        if (result.length === 0) {
                            if (typeof callback === 'function') {
                                callback();
                            }
                            return false;
                        }
                        chat.insert(result)
                            .then(
                                () => {
                                    /*
                                     * IndexedDBへレコード挿入が正常終了
                                     * その後callbackを実行
                                     */
                                    if (typeof callback === 'function') {
                                        callback();
                                    }
                                    return false;
                                },
                                (error) => {
                                    console.error(error);
                                }
                            )
                    })
                    .fail((error) => {
                        console.error('DBからチャットログの取得に失敗しました。');
                        console.error(error)
                    })
            },
            (error) => {
                console.error('IndexedDBの初期化に失敗しました。');
                console.error(error);
            })
};

/**
 * 最下部(最新のログ)までスクロールする。
 */
ChatLog.prototype.scrollToTop = function() {
    $(this.scrollParentDom).scrollTop($(this.logsDom).height() - $(this.scrollParentDom).height());
};

/**
 * dialogをresizeした際に、それに合わせて内容のサイズも動的に変更する
 */
ChatLog.prototype.fit = function() {
    let titleBar       = $(this.dom).parent().find('.ui-dialog-titlebar');
    let titleBarHeight = $(titleBar).outerHeight(true);
    let dialogHeight   = $(this.dom).parent().outerHeight(true);
    
    /*
     * @TODO デザインが固まり次第、ハードコードしたパディングをデザインレイヤで吸収する
     */
    let scrollHeight = dialogHeight - titleBarHeight - 6.4;
    $(this.dom).css({
        "height": `${scrollHeight}px`,
        "width" : '100%',
    });
    $(this.scrollParentDom).css({
        "height" : '100%',
        "width"  : '100%',
        "padding": '3.2px'
    });
};

/*
 *
 */
ChatLog.prototype.renderTagfilter = function() {
};

/**
 * チャットを受信した際の処理。
 * チャットとしてDOMを追加。
 * 入力はチャットオブジェクト(chat)またはその配列。あるいは文字列。
 *
 * scenarioId : string
 * alias : string
 * socketId : string
 * text : string
 * postscript : Array | undefined
 *
 * @param _lines
 * @param isSystem
 * @returns {boolean}
 */
ChatLog.prototype.addLines = function(_lines) {
    
    if (typeof _lines !== 'object' && typeof _lines !== 'string') {
        console.warn('適切なデータ形式でなかったため、無視しました。');
        console.warn(_lines);
        return false;
    }
    
    let lines = [];
    if (typeof _lines === 'string') {
        /*
         * 入力が文字列だった場合はオブジェクトの配列へ
         */
        let l = {
            alias     : 'mabo',
            text      : _lines,
            postscript: [],
        };
        lines.push(l);
    } else if (_lines instanceof Array === false) {
        /*
         * 入力が配列でなかった場合は配列へ変換
         */
        lines.push(_lines);
    } else {
        _lines.forEach(function(v) {
            lines.push(v);
        })
    }
    
    /*
     * チャットログの下部に、フォーマットに従い順次追加
     */
    let html = '';
    lines.forEach(function(l) {
        let name       = l.alias || l.socketId || '[null]';
        let text       = l.text;
        let postscript = l.postscript;
        let hexColor   = `#${(l.hexColor || '000000').replace('#', '')}`;
        let fontWeight = name === 'mabo' ? '' : 'font-weight:600;';
        /*
         * DOMの追加
         */
        html += `<li><span style="color: ${hexColor};${fontWeight}">${name}</span>:&nbsp;${text}</li>`;
        if (postscript instanceof Array && postscript.length !== 0) {
            postscript.forEach(function(pp) {
                pp.forEach(function(p) {
                    html += `<li class="" style="margin-left:10px;border-left: solid darkgray 2px">&nbsp;&nbsp;${p}</li>`
                })
            })
        }
    });
    $(this.logsDom).append(html);
    
    /*
     * 最下部へスクロール
     */
    this.scrollToTop();
};

/**
 * IndexedDBのデータを使用し、チャット内容のDOMを作成する
 */
ChatLog.prototype.render = function() {
    chat.find({scenarioId: {$eq: scenarioId}})
        .toArray((error, result) => {
            if (error) {
                console.error(error);
            }
            /*
             * チャット履歴DOMを全てクリアして再挿入
             */
            this.addLines(result);
        })
};

/**
 * チャットのフォーマットを変更する
 */
ChatLog.prototype.changeFormat = function() {
};

/**
 * タグフィルタを変更する
 */
ChatLog.prototype.changeTagFilter = function() {
};


module.exports = ChatLog;