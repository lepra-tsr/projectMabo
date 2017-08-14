"use strict";

const CU       = require('./commonUtil.js');
const Throttle = require('./_Throttle.js');
const command  = require('./_command.js');
const trace    = require('./_trace.js');

const scenarioId = CU.getScenarioId();

let socket = undefined;

/*
 * チャット入力フォーム、フキダシ表示に対応するオブジェクト。
 */
let TextForm = function(_socket) {
    socket          = _socket;
    this.socketId   = socket.id;
    this.scenarioId = '';
    this.newName    = '';
    this.alias      = '';
    this.text       = '';
    this.status     = 'blank';
    this.count      = 0;
    this.postscript = [];
    this.container  = {};
    this.getFormData();
}

TextForm.prototype.updateContainer = function() {
    this.container =
        {
            socketId  : this.socketId,
            scenarioId: this.scenarioId,
            alias     : this.alias,
            text      : this.text,
            status    : this.status,
            count     : this.count,
            postscript: this.postscript
        }
}

TextForm.prototype.getFormData = function() {
    this.socketId   = socket.id;
    this.scenarioId = scenarioId;
    this.alias      = CU.htmlEscape($('span.alias').text()) || socket.id;
    this.text       = $('#consoleText').val();
    this.postscript = [];
}

TextForm.prototype.ret = function() {
    this.getFormData();
    
    if (command.isSpell === true) {
        this.execCommand();
    } else {
        this.chat();
    }
    
    // チャットメッセージを空にして吹き出しを送信(吹き出しクリア)
    $('#consoleText').val('');
    this.onType();
    
    // autocompleteを閉じる
    $('#consoleText').autocomplete('close');
}

TextForm.prototype.execCommand = function() {
    // command.exec();
}

TextForm.prototype.chat = function() {
    let text = this.text;
    
    // 空文字のチャットは送信しない(スペースのみはOK)
    if (text === '') {
        trace.log('blank chat ignored.');
        return false;
    }
    
    // 置換文字列を解決して、データコンテナにpostScript要素を作成
    this.postscript = execPlaceholder(text);
    
    // HTMLエスケープ
    let _escaped = CU.htmlEscape(text);
    
    this.text = _escaped;
    
    this.updateContainer();
    
    // 送信
    socket.emit('chatMessage', this.container);
    return false;
}

TextForm.prototype.changeAlias = function() {
    /*
      * エイリアス変更処理。有効なエイリアスでない場合は、フォームの値を以前のエイリアスへ戻す。
      * エイリアスの変更を通知する。
      */
    let aliasDom      = $('span.alias');
    let aliasInputDom = $('input.alias');
    let input         = CU.htmlEscape($(aliasInputDom).val().trim());
    let alias         = this.alias;
    
    /*
     * 空文字はNG、maboもシステム用なのでNG
     */
    if (input === '' || input === 'mabo') {
        return false;
    }
    
    if (alias !== input) {
        trace.log(`[${scenarioId}] ${alias} changed to ${input}.`);
        this.alias = input;
        $(aliasDom).html(input);
        /*
         * ログイン時(空文字→socket.id)は通知しない
         */
        if (alias !== '') {
            socket.emit('changeAlias', {alias: alias, newAlias: input, scenarioId: scenarioId});
        }
        return false;
    }
}

TextForm.prototype.onType = function(force, text) {
    // チャットUIの入力値を取り込み
    this.getFormData();
    
    this.text = (typeof text === 'undefined')
        ? this.text
        : text;
    
    let rawText = this.text;
    command.parse(rawText.trim());
    
    let countBefore = this.count;
    
    if (command.isSpell === true) {
        /*
         * スラッシュコマンドの場合は送信しない
         */
        this.count = 0;
    } else {
        this.count = rawText.trim().length;
    }
    
    let beforeStatus = this.status;
    let gradient     = this.count - countBefore;
    
    if (countBefore === 0 && this.count > 0) {
        /*
         * 書き出し (start)
         */
        this.status = 'start';
    } else if (gradient > 0 && this.count !== 0) {
        /*
         * 書き足し (add)
         */
        this.status = 'add';
    } else if (gradient < 0 && this.count !== 0) {
        /*
         * 書き足し (delete)
         */
        this.status = 'delete';
    } else if (gradient !== 0 && this.count === 0) {
        /*
         * 削除/送信 (blank)
         */
        this.status = 'blank';
    } else if (gradient === 0) {
        /*
         * 文字数が変化しない場合は無視
         */
        // console.warn(`ignore onType - count: ${countBefore} → ${this.count}`);
        return false;
    }
    
    /*
     * statusが変化しなかった場合は無視
     */
    if (beforeStatus === this.status) {
        // console.warn(`ignore continuous - ${this.status}`);
        return false;
    }
    
    let type = {
        socketId  : this.socketId,
        scenarioId: this.scenarioId,
        alias     : this.alias,
        status    : this.status
    };
    
    socket.emit('onType', type);
}

/**
 * ccb、xDy、大括弧で括られた文字列を計算する。
 * その計算過程、計算結果を配列形式で返却する。
 *
 * execPlaceholder('可能:[2D6+2*(2Dccb+ccb)] シンタックスエラー[ccb++ccb] Bool[1==1>=ccb<=1]')
 *
 */
function execPlaceholder(text) {
    let postscript = [];
    
    // 大括弧でパースする
    let match = text.match(/\[([\s\d\+\-\*\/%\(\)<>=d]|ccb)+]/ig);
    if (match === null) {
        return [];
    }
    
    // 大括弧ごとの内容について処理
    match.forEach(function(v, i) {
        let exec  = v;
        let index = 0;
        let p     = [];
        
        // 置換可能なccb、またはxDyが存在する場合
        while (exec.match(/ccb/i) !== null || exec.match(/\d+d\d+/i)) {
            exec = exec
                .replace(/ccb/ig, function(v, i) {
                    /*
                     * ccbの置換。
                     */
                    let ccb   = Math.floor(Math.random() * 100) + 1;
                    let flags = '';
                    flags += ((ccb <= 5 && flags.indexOf('c') === -1) ? 'c' : '');
                    flags += ((ccb >= 96 && flags.indexOf('f') === -1) ? 'f' : '');
                    p.push(`  ccb[${index}]: ${ccb}${flags === '' ? '' : '(' + flags + ')'}`);
                    
                    index++;
                    return ccb;
                })
                .replace(/\d+d\d+/ig, function(v, i) {
                    /*
                     * xDyの置換。
                     * Dの前後の文字列から引数を取得し、置換を行う。
                     */
                    let array = v.split(/d/i);
                    let args  = array.map(function(v, i) {
                        try {
                            return eval(v);
                        } catch (e) {
                            // evalでxDyの引数が計算不可能だった場合
                            trace.warn(`『v』を計算できませんでした。`);
                            return null;
                        }
                    });
                    
                    if (args.some((v) => {
                            return v === null;
                        })) {
                        // evalで置換に失敗していたパターン
                        return 'ERROR';
                    }
                    let dies = [];
                    
                    for (i = 0; i < args[0]; i++) {
                        dies.push(Math.floor(Math.random() * args[1]) + 1);
                    }
                    let answer = dies.reduce((x, y) => {
                        return x + y;
                    });
                    
                    p.push(`  xDy[${index}]: ${args[0]}D${args[1]} → 【${dies}】 → ${answer}`);
                    index++;
                    return answer;
                })
            
        }
        
        /*
         * 大括弧の中をevalで計算
         */
        let r = function(exec) {
            try {
                return eval(exec);
            } catch (e) {
                // trace.warn(e);
                return 'SYNTAX ERROR!';
            }
        }(exec);
        p.push(`  ∴ ${exec} → ${r}`);
        postscript.push(p);
    });
    return postscript;
}

module.exports = TextForm;