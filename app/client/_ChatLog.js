"use strict";

const util  = require('./_util.js');
const trace = require('./_trace.js');
const mbo   = require('./_mbo.js');
const zango = require('zangodb');

let db   = new zango.Db(mbo.INDEXED_DB, [mbo.INDEXED_OBJECT_STORE]);
let chat = db.collection(mbo.INDEXED_OBJECT_STORE);

const scenarioId = util.getScenarioId();


let socket = undefined;
/**
 * チャットログウィンドウに対応するオブジェクト。
 * @param chatLogs
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
            "position"  : 'absolute',
            "top"       : '0px',
            "left"      : '0px',
            "height"    : '100%',
            "width"     : '100%',
            "overflow-y": 'scroll',
            "overflow-wrap": 'break-word'
        }
    });
    
    /*
     * チャットログ
     */
    this.logsDom = $(`<ul></ul>`, {
        "addClass": 'list-grou',
        css       : {
            "margin"     : '0em',
            "font-size"  : '0.9em',
            "line-height": '1.2'
        }
    });
    
    /*
     * DOM組み立て
     */
    $(this.scrollParentDom).append($(this.logsDom));
    $(this.dom).append($(this.scrollParentDom));
    
    // $(this.dom).dialog({
    //     autoOpen     : true,
    //     resizable    : true,
    //     position     : {at: "right bottom"},
    //     title        : '履歴',
    //     classes      : {
    //         "ui-dialog": "log"
    //     },
    //     buttons      : [],
    //     closeOnEscape: false,
    //     open         : (e) => {
    //         this.fit();
    //     },
    //     resize       : () => {
    //         this.fit();
    //     },
    //     resizeStop   : () => {
    //         this.fit();
    //     },
    //     dragStop     : (e, ui) => {
    //         this.fit();
    //     }
    // });
    
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
                util.callApiOnAjax(mbo.API_EP_LOGS, 'get', {data: {scenarioId: scenarioId}})
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
                    html += `<li class="small text-muted" style="border-left: solid darkgray 2px">&nbsp;&nbsp;${p}</li>`
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