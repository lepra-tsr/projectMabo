"use strict";

const CU              = require('./commonUtil.js');
const ChannelSelector = require('./_ChannelSelector');
const Dialog          = require('./_Dialog.js');

const scenarioId = CU.getScenarioId();


let socket  = undefined;
let log     = undefined;

/**
 * チャットログウィンドウに対応するオブジェクト。
 * @param _socket
 * @param _log
 * @constructor
 */
let ChatLog = function(_socket, _log) {
    this.dom = undefined;
    
    /*
     * Dialog基底クラスのコンストラクタ
     */
    Dialog.call(this);
    
    socket               = _socket;
    log                  = _log;
    this.format          = '';
    this.timestamp       = false;
    this.stickToTop      = true;
    this.channelSelector = new ChannelSelector(socket);
    
    /*
     * 指定外のチャンネルの表示方法
     * ignore: 表示しない
     * mute  : グレーアウト
     * indent: インデント表示
     */
    this.channelFilterStyle = 'indent';
    
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
    });
    
    /*
     * イベント付与
     */
    
    /*
     * チャンネルセレクトボックスを変更したら再読込
     */
    $(this.channelSelector.channelSelectDom).on('change',()=>{
        this.render();
    })
    
    /*
     * 表示チャンネルの選択
     */
    this.channelSelectDom = this.channelSelector.dom;
    
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
    
    /*
     * 設定パネル
     */
    $(this.optionDom).append($(this.channelSelectDom));
    $(this.optionDom).append($(this.configButtonDom));
    $(this.optionDom).append($(this.filterDom));
    $(this.dom).append($(this.optionDom));
    
    this.dialog({
        title : 'チャット履歴',
        width : '450px',
    });
    
    this.render();
    this.scrollToTop();
    
    socket.on('logIn', (container) => {
        /*
         * ログイン通知
         */
        if (socket.id === container.socketId) {
            // 自分の場合はエイリアスをsocket.idで初期化して終了
            $('#u').val(socket.id);
            return false;
        }
        
        let msg = `${container.socketId} がログインしました。`;
        this.addLines(msg);
    });
    
    socket.on('chatMessage', (container)=> {
        /*
         * チャットを受信した際の処理
         */
        this.addLines(container);
    });
    
    socket.on('changeAlias', (container)=> {
        /*
         * チャットを受信した際の処理
         */
        this.addLines(container);
    });
    
    socket.on('logOut', (container)=> {
        /*
         * 他ユーザのログアウト通知を受信した際の処理
         */
            this.addLines(container);
    });
};

/**
 * 最下部(最新のログ)までスクロールする。
 */
ChatLog.prototype.scrollToTop = function() {
    if (this.stickToTop === true) {
        $(this.scrollParentDom).scrollTop($(this.logsDom).height() - $(this.scrollParentDom).height());
    }
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
     * チャットログの下部に、フォーマットしたチャットログのDOMを順次追加
     */
    let html = '';
    
    let channel = this.channelSelector.getSelectedName();
    lines.forEach((l) => {
        if (this.channelFilterStyle === 'ignore' && l.channel !== channel) {
            return;
        }
        html += this.formatLine(l);
    });
    $(this.logsDom).append(html);
    
    /*
     * 最下部へスクロール
     */
    this.scrollToTop();
};

/**
 * フォーマット
 * @param line
 * @returns {string}
 */
ChatLog.prototype.formatLine = function(line) {
    let html = '';
    
    let name       = line.alias || line.socketId || '[null]';
    let text       = line.text;
    let channel    = (typeof line.channel === 'undefined') ? '' : `[${line.channel}]`;
    let channelFilter = this.channelSelector.getSelectedName();
    let postscript = line.postscript;
    let hexColor   = `#${(line.hexColor || '000000').replace('#', '')}`;
    let fontWeight = name === 'mabo' ? '' : 'font-weight:600;';
    /*
     * @TODO ハードコーディングしているマークアップを、クラスで吸収する
     */
    let indent = (line.channel !== channelFilter && channel !=='' && this.channelFilterStyle ==='indent')?'padding-left:20px;':'';
    
    /*
     * DOMの追加
     */
    html +=
        `<li style="${indent}">`+
        `<span>${channel}</span><span style="color: ${hexColor};${fontWeight}">${name}</span>:&nbsp;${text}`+
        `</li>`;
    if (postscript instanceof Array && postscript.length !== 0) {
        postscript.forEach(function(pp) {
            pp.forEach(function(p) {
                html += `<li class="" style="margin-left:10px;border-left: solid darkgray 2px">&nbsp;&nbsp;${p}</li>`
            })
        })
    }
    
    return html;
};

/**
 * Logインスタンスのデータを使用し、チャット内容のDOMを作成する
 */
ChatLog.prototype.render = function() {
    /*
     * チャット履歴DOMを全てクリアして再挿入
     */
    $(this.logsDom).empty();
    log.list.forEach((v) => {
        this.addLines(v);
    });
};

Object.assign(ChatLog.prototype, Dialog.prototype);

module.exports = ChatLog;