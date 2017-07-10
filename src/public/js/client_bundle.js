/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 12);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


let trace = {
    
    isOn  : false,
    
    log    : function(args) {
        this.console(args, 'log');
    },
    info   : function(args) {
        this.console(args, 'info');
    },
    warn   : function(args) {
        this.console(args, 'warn');
    },
    error  : function(args) {
        this.console(args, 'error');
    },
    table  : function(args) {
        this.console(args, 'table');
    },
    console: function(args, _severity) {
        
        if (this.isOn !== true) {
            return false;
        }
        
        let severity = 'log';
        if (typeof _severity !== 'undefined' || ['log', 'info', 'warn', 'error', 'table'].indexOf(_severity) !== -1) {
            severity = _severity;
        }
        
        console[severity](args);
    }
};

module.exports = trace;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


let def = {
    FUKIDASHI_MAX_LENGTH: 30,
    FUKIDASHI_THROTTLE  : 300,
    GRID_THROTTLE       : 3000,
    SOCKET_EP       : 'http://192.168.99.100:3000',
};

module.exports = def;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


let trace = __webpack_require__(0);

let util = {
    /**
     * HTMLタグをエスケープする
     * @param _text
     * @returns {*}
     */
    htmlEscape: function(_text) {
        return _text.replace(/[&'`"<>]/g, function(match) {
            return {
                '&': '&amp;',
                "'": '&#x27;',
                '`': '&#x60;',
                '"': '&quot;',
                '<': '&lt;',
                '>': '&gt;',
            }[match]
        });
    },
    
    /**
     * ajaxでAPIをコールする
     * paramsの要素は以下。
     * url: コールするurl
     * method: httpメソッド
     *
     * $.Deferredでajax処理を監視する。
     * var resultSample = call_api_in_ajax(args..)の形式でコールする。
     * resultSample.state() : 処理状態[pending, resolve, reject]
     * resultSample.done(result,statusCode)   : 処理完了時のコールバック
     * resultSample.fail(result,statusCode)   : 処理失敗時のコールバック
     * resultSample.always : 処理完了、処理失敗時 = 処理終了時に常に実行するコールバック
     *
     * @param endPoint /apiendpoint/hoge/fuga
     * @param method [get|post|patch|put|delete]
     * @param params {data:array ,[async:boolean]}
     *
     */
    callApiOnAjax: function(endPoint, method, params) {
        
        // コールするエンドポイントのhost部分
        let __HOST_NAME = '';
        
        // レスポンスを格納
        let result;
        
        // 非同期通信に使用するデータ
        let ajax_obj = {};
        
        // url、http-methodをセット
        ajax_obj.url    = __HOST_NAME + endPoint;
        ajax_obj.method = method;
        
        // 非同期フラグはデフォルトでtrue
        ajax_obj.async = true;
        
        // csrfトークン埋め込み
        ajax_obj.headers = {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        };
        
        if (typeof params !== 'undefined' && params !== null && params !== '') {
            if (typeof params.data !== 'undefined' && params.data !== null && params.data !== '') {
                // params.dataが値を持つ(以下に該当しない)場合はajax_objにセット
                // ｢未定義｣｢null｣｢空文字｣
                ajax_obj.data = params.data;
            }
        }
        
        // deferredオブジェクトを作成
        let d = new $.Deferred;
    
        trace.log(ajax_obj);
        
        $.ajax(ajax_obj)
            .then(
                function(response, textStatus, jqXHR) {
                    // logging
                    trace.log(`[Ajax] :${textStatus}`);
                    trace.log(response);
                    d.resolve(response, textStatus);
                },
                function(error, textStatus, jqXHR) {
                    // 400, 500 など 200 以外
                    
                    // logging
                    trace.log(`[Ajax] :${textStatus}`);
                    trace.error(error);
                    
                    d.reject(error, jqXHR.status);
                });
        
        return d.promise();
    },
    
    /**
     * オブジェクトを投げ込むとURIに付けるクエリパラメータを吐き出すメソッド
     * {'keyA':['valueA1', 'valueA2'], 'keyB':['valueB1', 'valueB2']}
     * -> ?keyA=valueA1,valueA2&keyB=valueB1,valueB2
     *
     * valueが空文字、空配列の場合、そのvalueを無効と判断し無視する。
     * keyの持つvalueが全て無効な場合、そのkeyを削除する。
     *
     * valueごとにurlエンコードを実行した上で連結する。
     *
     * @param object
     * @returns {*}
     */
    getQueryString: function(object) {
        
        let query = '?';
        
        let keyStr = '';
        
        // 入力したobjectについて全てのkeyをループ
        for (let key in object) {
            
            keyStr = key.toString() + '=';
            
            // value が配列かどうか判定
            if (Array.isArray(object[key])) {
                
                // valueが配列の場合
                for (let i = 0; i < object[key].length; i++) {
                    
                    // valueが空文字、nullの場合は無視する
                    if (object[key][i] === '' || object[key][i] === null) continue;
                    
                    //URLエンコードして追加
                    keyStr += encodeURIComponent(object[key][i]) + ',';
                }
                
                // 末尾に連続する半角カンマを全て削除 key=x,,, -> key=x
                keyStr = keyStr.replace(/,+$/, '');
                
            } else {
                
                // valueが配列ではない場合
                
                // valueが空文字、nullの場合は無視する
                if (object[key] === '' || object[key] === null) continue;
                
                // URLエンコードして追加
                keyStr += encodeURIComponent(object[key]);
            }
            
            // 末尾が key= のように終わっていた場合はそのKeyを削除
            if (keyStr.match(/=$/) !== null) {
                trace.log('empty key detected and ignored: ' + key.toString());
                continue;
            }
            
            query += keyStr + '&';
        }
        
        // 末尾の半角アンパサンドを削除 key=x& -> key=x
        query = query.replace(/&$/, '');
        
        return query !== '?' ? query : '';
    },
    
    /**
     * 右クリックメニューの制御
     */
    contextMenu: function(e, menuProperties) {
        
        if (!menuProperties.hasOwnProperty('items')) {
            trace.warn('set items');
            return false;
    }
        if (!menuProperties.hasOwnProperty('callback')) {
            trace.warn('set callback');
            return false;
        }
        
        let contextMenu = $('#contextMenu');
        let tdHtmlArray = '';
        menuProperties.items.forEach(function(v) {
            tdHtmlArray += `<tr data-contextkey="${v.key}"><td>${v.name}</td></tr>`;
        });
        
        $(contextMenu).find('tbody').empty()
            .append(tdHtmlArray);
        $(contextMenu).find('tr').each(function(i, v) {
            $(v).on('click', function() {
                menuProperties.callback(e, $(this).attr('data-contextkey'))
            })
        });
        
        /*
         * 右クリックしたらメニューを表示する。
         * 右クリックメニューを選ぶか、画面をクリックしたら非表示に戻す
         */
        $(contextMenu)
            .css('top', `${e.clientY}px`)
            .css('left', `${e.clientX}px`)
            .css('cursor', 'pointer')
            .on('click', function(e) {
                $(contextMenu)
                    .css('top', `-1000px`)
                    .css('left', `-1000px`);
                $(window).off('click');
            });
        $(window).on('click', function() {
            trace.log('window-click'); // @DELETEME
            $(contextMenu)
                .css('top', `-1000px`)
                .css('left', `-1000px`);
            $(window).off('click');
        });
        
        e.preventDefault();
    }
    
};

module.exports = util;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const util       = __webpack_require__(2);
const _def       = __webpack_require__(1);
const scenarioId = /\/scenarios\/([a-f0-9]+)/.exec(window.location.href)[1];
const trace      = __webpack_require__(0);
const Board      = __webpack_require__(9);

let socket = undefined;

let playGround              = {};
playGround.setSocket        = function(_socket) {
    socket = _socket;
};
playGround.boards           = [];
playGround.getBoardById     = function(boardId) {
    return this.boards.find(function(v) {
        return v.id === boardId;
    })
};
playGround.getActiveBoardId = function() {
    let activeBoard = $('.board.playground-front');
    if ($(activeBoard).length === 0) {
        return -1;
    }
    return $(activeBoard).attr('data-board-id');
};
playGround.popBoardUp       = function(boardId) {
    if (this.boards.length === 0) {
        return false;
    }
    
    this.boards.forEach(function(v) {
        if (v.id === boardId) {
            $(v.dom).css('z-index', '10')
                .addClass('playground-front');
        } else {
            $(v.dom).css('z-index', '0')
                .removeClass('playground-front');
        }
    });
};
playGround.loadBoard        = function(scenarioId, boardId) {
    /*
     * 指定したボードをDBから取得し、playGround.boardsに反映する。
     * boardIdを指定しない場合は、このシナリオに紐付く全てのボードを対象に取る。
     */
    let getAll = (typeof boardId === 'undefined');
    let data   = {
        scenarioId: scenarioId,
        boardId   : boardId,
        getAll    : getAll
    };
    let query  = util.getQueryString(data);
    util.callApiOnAjax(`/boards${query}`, 'get')
        .done((r) => {
            
            /*
             * boardsに反映
             */
            r.forEach((v) => {
                let boardId = v._id;
                let option  = {
                    name: v.name
                };
                let board = new Board(socket, this, boardId, option);
                this.boards.push(board);
                this.popBoardUp(boardId);
                
            });
        })
    
};
playGround.deployBoard      = function() {
    /*
     * ボードを新しく作成する。
     * Objectsコレクションの_idをユニークなボードIDに使用する。
     *
     * 新しいボードをObjectsコレクションに追加した後、
     * 他ユーザへボードIDを通知し、deployBoardsを送信する。
     */
    let boardName = window.prompt('追加するボードに名前を付けてください。\nマウスポインタを乗せた際の注釈などに使用します。').trim();
    if (!boardName || boardName === '') {
        trace.warn('無効'); // @DELETEME
        return false;
    }
    
    let data = {
        scenarioId: scenarioId,
        name      : boardName
    };
    
    /*
     * ボード追加時にAPI叩いて登録、ID受け取ってsocketで通知
     * 作成したボードのidをAPIから取得する
     */
    util.callApiOnAjax('/boards', 'post', {data: data})
        .done(function(r) {
            
            /*
             * 接続ユーザ全員にボードをリロードさせる
             */
            let data = {
                scenarioId: scenarioId,
                boardId   : r.boardId,
            };
            socket.emit('deployBoards', data);
        })
        .fail(function(r) {
        
        });
};
/**
 * ボードをDBから削除する処理。
 * 削除成功時は、該当するボードのDOMの削除リクエストを通知する。
 *
 * (ボード上のコマはAPIが削除する)
 */
playGround.removeBoard = function(boardId) {
    let q     = {
        scenarioId: scenarioId,
        boardId   : boardId,
    };
    let query = util.getQueryString(q);
    util.callApiOnAjax(`/boards${query}`, 'delete')
        .done((r) => {
            
            /*
             * ボード削除通知
             */
            let data = {
                scenarioId: scenarioId,
                boardId   : boardId
            };
            socket.emit('destroyBoards', data);
            
            /*
             * ボードその他を削除
             */
            this.destroyBoard(boardId);
        })
        .fail((r) => {
            alert('ボードの削除に失敗しました。オブジェクトを全てリロードします。');
            this.loadBoard(scenarioId);
        })
};
/**
 * ナビメニューのアイコン、ボードのインスタンスとDOMを削除する。
 * (ボードのインスタンスの削除と同時に、コマのインスタンスも削除する)
 *
 * @param boardId
 */
playGround.destroyBoard = function(boardId) {
    let targetIndex = this.boards.findIndex(function(v) {
        return v.id === boardId;
    });
    if (targetIndex !== -1) {
        $(this.boards[targetIndex].dom).remove();
        $(`span[data-board-indicator-id=${boardId}]`).remove();
        this.boards.splice(targetIndex, 1);
    }
};
/**
 * キャラクタ表からキャラクタを削除した際に呼び出す。キャラクタIDが等しいコマを全て削除する。
 * 全てのボードに対して実施し、ドッグタグは参照しない。
 *
 * @param characterId
 */
playGround.removePawnByAllBoard = function(characterId) {
    this.boards.forEach((v) => {
        let criteria = {
            scenarioId : scenarioId,
            boardId    : v.id,
            characterId: characterId
        };
        v.deleteCharacter(criteria);
    })
};

module.exports = playGround;



/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const util     = __webpack_require__(2);
const _def     = __webpack_require__(1);
const Throttle = __webpack_require__(5);
const command  = __webpack_require__(11);
const trace = __webpack_require__(0);

const scenarioId = /\/scenarios\/([a-f0-9]+)/.exec(window.location.href)[1];

const FUKIDASHI_THROTTLE = _def.FUKIDASHI_THROTTLE;
let fukidashiThrottle    = new Throttle(function() {
    return true;
}, FUKIDASHI_THROTTLE);

const FUKIDASHI_MAX_LENGTH = _def.FUKIDASHI_MAX_LENGTH;

let socket = undefined;

/*
 * チャット入力フォーム、フキダシ表示に対応するオブジェクト。
 */
let textForm = {
    setSocket : function(_socket){
        socket = _socket;
    },
    container     : {
        socketId  : '',
        scenarioId: '',
        data      : {
            newName   : '',
            alias     : '',
            text      : '',
            postScript: [],
        },
        update    : function() {
            this.socketId        = socket.id;
            this.scenarioId      = scenarioId;
            this.data            = {};
            this.data.alias      = util.htmlEscape($('#u').val());
            this.data.text       = $('#m').val();
            this.data.postScript = [];
        }
    },
    getData       : function(key) {
        // 汎用getter
        if (!this.container.data.hasOwnProperty(key)) {
            return undefined;
        }
        return this.container.data[key];
        
    },
    setData       : function(key, value) {
        // 汎用setter
        this.container.data[key] = value;
        return this.getData(key);
    },
    ret           : function() {
        // データコンテナを現在の状態で更新
        this.container.update();
        
        if (command.isSpell === true) {
            this.execCommand();
        } else {
            this.chat();
        }
        
        // チャットメッセージを空にして吹き出しを送信(吹き出しクリア)
        $('#m').val('');
        this.onType();
        
        // autocompleteを閉じる
        $('#m').autocomplete('close');
    },
    execCommand   : function() {
        command.exec();
    },
    chat          : function() {
        let text = this.getData('text');
        
        // 空文字のチャットは送信しない(スペースのみはOK)
        if (text === '') {
            trace.log('blank chat ignored.');
            return false;
        }
        
        // 置換文字列を解決して、データコンテナにpostScript要素を作成
        execPlaceholder(text);
        
        // HTMLエスケープ
        let _escaped = util.htmlEscape(text);
        
        this.setData('text', _escaped);
        
        // 送信
        socket.emit('chatMessage', this.container);
        
        return false;
    },
    changeAlias   : function() {
        /*
         * エイリアス変更処理。有効なエイリアスでない場合は、フォームの値を以前のエイリアスへ戻す。
         * エイリアスの変更を通知する。
         */
        let newAlias = $('#u').val().trim();
        let alias    = this.getData('alias');
        if (newAlias === '') {
            $('#u').val(alias);
            return false;
        }
        
        if (alias !== newAlias) {
            trace.log(`[${scenarioId}] ${alias} changed to ${newAlias}.`); // @DELETEME
            socket.emit('changeAlias', {alias: alias, newAlias: newAlias, scenarioId: scenarioId});
            this.setData('alias', newAlias);
        }
    },
    /**
     * チャットフォーム上でキー入力した際に発火する。
     * フォームから値を取得して変数へ格納、パースしてスラッシュコマンドか判別する。
     * スラッシュコマンドではない場合のみ、フキダシを行う。
     */
    onType        : function(force, text) {
        
        // チャットUIの入力値を取り込み
        this.container.update();
        
        this.container.data.text = (typeof text === 'undefined')
            ? this.container.data.text
            : text;
        
        // スラッシュコマンドの場合
        let rawText = this.getData('text');
        command.parse(rawText.trim());
        if (command.isSpell === true) {
            // commandへ入力値を格納し、吹き出しをクリアする
            this.setData('thought', '');
        } else {
            let thought = rawText.trim().substr(0, FUKIDASHI_MAX_LENGTH) + (rawText.length > FUKIDASHI_MAX_LENGTH ? '...' : '');
            this.setData('thought', thought);
            if (this.getData('thought').length >= (FUKIDASHI_MAX_LENGTH + 10)) {
                /*
                 * フキダシ文字数がFUKIDASHI_MAX_LENGTHを超えてたら送信しない
                 */
                return false;
            }
        }
        
        /*
         * ディレイ中の場合は送信しないでキューに入れる
         */
        if (fukidashiThrottle.exec() !== true && force !== true) {
            /*
             * キューに入っていない場合は入れる
             */
            if (fukidashiThrottle.queued === false) {
                window.setTimeout(() => {
                    this.onType();
                }, fukidashiThrottle.delay);
                fukidashiThrottle.queued = true;
            }
            return false;
        }
        socket.emit('onType', this.container);
        fukidashiThrottle.queued = false;
    },
    insertMessages: (data) => {
        let m = $('#messages');
        $(m).append($('<li class="">').html(data.msg));
        if (typeof data.postscript !== 'undefined' && data.postscript.length !== 0) {
            data.postscript.forEach(function(_p) {
                _p.forEach(function(v) {
                    $(m).append($('<li class="text-muted">').text(v));
                })
            });
        }
        
        $('#messages-scroll').scrollTop($('#messages-scroll')[0].scrollHeight);
    },
};

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
        return false;
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
                    
                    p.push(`  xDy[${index}]: ${args[0]}D${args[1]} -> 【${dies}】 -> ${answer}`);
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
        p.push(`  ∴ ${exec} -> ${r}`);
        postscript.push(p);
    });
    textForm.setData('postscript', postscript);
}

module.exports = textForm;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * 処理の間隔を一定以上に固定するための補助オブジェクト。
 * ディレイをミリ秒で指定してcallbackから実行して使用する。
 *
 * @param callback
 * @param delay
 * @private
 */
let Throttle           = function(callback, delay) {
    this.callback = callback;
    this.prevTime = new Date().getTime();
    this.delay    = delay;
    this.queued   = false;
};
Throttle.prototype.exec = function() {
    let now = new Date().getTime();
    if ((now - this.prevTime) >= this.delay) {
        
        this.prevTime = now;
        return this.callback.apply(null, arguments);
    } else {
        // console.log('  in delay.');
    }
};

module.exports = Throttle;

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const _def       = __webpack_require__(1);
const util       = __webpack_require__(2);
const trace      = __webpack_require__(0);
const Throttle   = __webpack_require__(5);
const playGround = __webpack_require__(3);

const scenarioId    = /\/scenarios\/([a-f0-9]+)/.exec(window.location.href)[1];
const GRID_THROTTLE = _def.GRID_THROTTLE;

let hot;

let gridThrottle = new Throttle(function() {
    return true;
}, GRID_THROTTLE);

let socket = undefined;

let characterGrid = {
    setSocket   : function(_socket) {
        socket = _socket;
    },
    header      : [],
    createHeader: function() {
        let h = [];
        this.data.forEach(function(v) {
            Object.keys(v).forEach(function(k) {
                if (h.indexOf(k) === -1) {
                    h.push(k);
                }
            })
        });
        
        this.header = h;
    },
    data        : [],
    deployPiece : function(characterId, css, options) {
        /*
         * キャラクター表からコマを作成する。
         * 現在アクティブなボードを取得する。
         * アクティブなボードが存在しない場合は何もしない。
         */
        let activeBoardId = playGround.getActiveBoardId();
        if (typeof activeBoardId === 'undefined') {
            trace.warn('選択中のBoardが存在しない'); // @DELETEME
            return false;
        }
        
        /*
         * アクティブなボードにキャラクターのコマを登録し、全員へ通知。
         */
        playGround.getBoardById(activeBoardId).registerCharacter(characterId)
    },
    /*
     * ヘッダーを使用してデータ部を正規化
     */
    initData    : function() {
        this.header.forEach((v) => {
            this.data.forEach((w, i) => {
                if (!this.data[i].hasOwnProperty(v)) {
                    /*
                     * 各レコードにチェック列がない場合はboolで初期化
                     */
                    this.data[i][v] = (v.substring(0, 1) === '*') ? false : null;
                }
            });
        });
        this.data.forEach((v, i) => {
            Object.keys(v).forEach((p) => {
                if (p.substring(0, 1) === '*') {
                    if (typeof this.data[i][p] !== 'boolean' && characterGrid.data[i][p] !== 'true' && characterGrid.data[i][p] !== 'false') {
                        /*
                         * hotのcheckboxが読み込めないデータ形式はfalseへ変換
                         */
                        this.data[i][p] = false;
                    }
                    this.data[i][p] = (this.data[i][p] === 'true') ? true : this.data[i][p];
                    this.data[i][p] = (this.data[i][p] === 'false') ? false : characterGrid.data[i][p];
                }
            });
        });
    },
    /**
     * characterId(id列)を参照し、キャラクタ表から行を削除する。
     *
     * @param characterId
     */
    deleteRow   : function(characterId) {
        let deleteRowIndex = this.data.findIndex((v) => {
            return parseInt(v.id) === parseInt(characterId);
        });
        if (deleteRowIndex === -1) {
            trace.warn(`削除対象が見つかりませんでした。 id: ${id}`);
            return false;
        }
        this.data.splice(deleteRowIndex, 1);
    },
    pushData    : function() {
        
        /*
         * ディレイ中の場合は実行しないでキューに入れる
         */
        if (gridThrottle.exec() !== true) {
            /*
             * キューに入っていない場合はキューに入れる
             */
            if (gridThrottle.queued === false) {
                window.setTimeout(() => {
                    this.pushData();
                }, gridThrottle.delay);
                gridThrottle.queued = true;
            }
            return false;
        }
        
        let _data = this.data;
        
        util.callApiOnAjax(`/characters/${scenarioId}`, 'patch', {
            data: {
                data      : _data,
                scenarioId: scenarioId
            }
        })
            .done((r, code) => {
                /*
                 * キューから削除
                 */
                gridThrottle.queued = false;
                
                /*
                 * 変更をbroadcastで通知
                 */
                socket.emit('reloadCharacters',
                    {from: socket.id, scenarioId: scenarioId})
            })
            .fail((r, code) => {
                /*
                 * 失敗した場合は再度キューに入れる
                 */
                trace.log('Data push failed... retry in 3 sec.'); // @DELETEME
                gridThrottle.queued = false;
                this.pushData();
            }).always(function() {
            
        })
    },
    /**
     * DBのデータを使用してhot再生成
     */
    reloadHot   : function() {
        util.callApiOnAjax(`/characters/${scenarioId}`, 'get')
            .done((r) => {
                hot.destroy();
                this.data = r;
                this.makeHot();
            })
            .fail((r, code) => {
                trace.error(r); // @DELETEME
                trace.error(code); // @DELETEME
            });
    },
    renderHot   : function() {
        if (typeof hot === 'undefined') {
            return false;
        }
        hot.render();
    },
    /*
     * ローカルのデータを使用してhot再生成
     */
    recreateHot : function() {
        hot.destroy();
        this.makeHot();
    },
    /*
     * ローカルのデータを使用してhot生成
     */
    makeHot     : function() {
        
        /*
         * ローカルのデータが空の場合はダミーデータを挿入
         */
        if (this.data.length === 0) {
            this.data = [{
                id  : 0,
                DEX : 9,
                NAME: 'WALTER CORBITT',
            }];
        }
        
        this.createHeader();
        this.initData();
        
        trace.log('キャラクター表を再構成。'); // @DELETEME
        hot = new Handsontable(
            document.getElementById('resource-grid'), {
                colHeaders        : (col) => {
                    /*
                     * チェック列の場合は先頭のアスタリスクを取る
                     */
                    return this.header[col].replace('*', '');
                },
                cells             : function(row, col, prop) {
                    let cellProperty = {};
                    if (col === 0 || prop === 'id') {
                        cellProperty.readOnly = true;
                    }
                    
                    return cellProperty;
                },
                columns           : (column) => {
                    let columnProperty = {};
                    /*
                     * カラム名がアスタリスクで始まる場合はチェックボックス
                     */
                    if ((this.header[column] || '').substring(0, 1) === '*') {
                        columnProperty.type = 'checkbox';
                    }
                    columnProperty.data = this.header[column];
                    
                    return columnProperty
                },
                data              : this.data,
                manualColumnMove  : false,
                columnSorting     : true,
                sortIndicator     : true,
                manualColumnResize: true,
                autoRowSize       : false,
                autoColumnSize    : true,
                rowHeights        : 22,
                stretchH          : 'none',
                manualRowResize   : false,
                afterCreateRow    : (i, n, source) => {
                    if (source.indexOf('rowBelow') !== -1) {
                        /*
                         * 新しいidを採番して指定する
                         */
                        let _id = (this.data.reduce(function(_a, _b) {
                            let a = parseInt((_a.id || 0), 10);
                            let b = parseInt((_b.id || 0), 10);
                            return (a > b) ? _a : _b;
                        }).id || 0);
                        
                        this.data[i]['id'] = parseInt(_id, 10) + 1;
                    }
                },
                afterRemoveRow    : (i, n, source) => {
                    if (this.data.length === 0) {
                        this.data.push({id: 0});
                    }
                },
                beforeChange      : function(changes, source) {
                    changes.forEach(function(v, i) {
                        /*
                         * 変更内容が同じ場合は棄却
                         */
                        if (v[2] === v[3]) {
                            changes[i] = null;
                        }
                    })
                },
                afterChange       : (changes) => {
                    if (changes === null || changes.length === 0) {
                        return false;
                    }
                    this.pushData();
                },
                contextMenu       : {
                    items   : {
                        'deployCharacter': {
                            name    : 'コマを作成する',
                            disabled: () => {
                                return playGround.getActiveBoardId() === -1
                            }
                        },
                        /*
                         * Defaults are @SEE http://docs.handsontable.com/0.29.2/demo-context-menu.html
                         */
                        'row_below'      : {
                            name: 'キャラクターを追加'
                        },
                        'duplicateRow'   : {
                            name    : 'キャラクターを複製',
                            disabled: function() {
                                /*
                                 * 複製対象は1人まで
                                 */
                                return (typeof hot.getSelected() === 'undefined') ||
                                    (hot.getSelected()[0] !== hot.getSelected()[2]);
                            }
                        },
                        'deleteRow'      : {
                            name    : 'キャラクターを削除',
                            disabled: function() {
                                /*
                                 * 削除対象は1人まで
                                 * 全員を削除することはできない
                                 */
                                return (
                                    typeof hot.getSelected() === 'undefined') ||
                                    (hot.getSelected()[0] !== hot.getSelected()[2]) ||
                                    ((Math.abs(hot.getSelected()[0] - hot.getSelected()[2]) + 1) === hot.countRows()
                                    )
                            }
                        },
                        /*
                         * 列の追加
                         */
                        'addParameter'   : {
                            name: 'パラメータを追加する'
                        },
                        /*
                         * 列の削除
                         */
                        'removeParameter': {
                            name    : 'パラメータを削除する',
                            disabled: function() {
                                // 1列目(id)、2列目(DEX)、3列目(NAMESPACE)は消せない
                                return (
                                    typeof hot.getSelected() === 'undefined') ||
                                    (
                                        (hot.getSelected()[1] || 0) <= 2 ||
                                        (hot.getSelected()[3] || 0) <= 2
                                    )
                            }
                        },
                        /*
                         * 強制的にコレクションの内容と同期
                         */
                        'forceReload'    : {
                            name: 'リロードする',
                        },
                        /*
                         * コレクションの内容を、現在のテーブルデータで上書きする
                         */
                        'pushData'       : {
                            name: 'この内容で上書き',
                        },
                    },
                    callback: (key, options) => {
                        switch (key) {
                            case 'deployCharacter':
                                /*
                                 * オブジェクトが持つ情報:
                                 *  character.id
                                 *  character.scenarioId
                                 *  通し番号
                                 */
                                let _vRowStart = options.start.row;
                                let _vRowEnd   = options.end.row;
                                
                                let vRowStart = (_vRowStart <= _vRowEnd) ? _vRowStart : _vRowEnd;
                                let vRowEnd   = (_vRowStart <= _vRowEnd) ? _vRowEnd : _vRowStart;
                                for (let i = vRowStart; i <= vRowEnd; i++) {
                                    let row = this.data[i];
                                    
                                    this.deployPiece(row.id, 0);
                                }
                                break;
                            case 'row_below':
                                this.pushData();
                                break;
                            case 'duplicateRow':
                                let row  = hot.toPhysicalRow(options.start.row);
                                let copy = {};
                                
                                Object.keys(this.data.slice(row)[0]).forEach((v, i) => {
                                    copy[v] = this.data[row][v];
                                });
                                /*
                                 * 新しいidを採番して指定する
                                 */
                                copy.id = parseInt(this.data.reduce(function(_a, _b) {
                                            let a = parseInt((_a.id || 0), 10);
                                            let b = parseInt((_b.id || 0), 10);
                                            return (a > b) ? _a : _b;
                                        }).id || 0, 10) + 1;
                                
                                this.data.push(copy);
                                
                                this.recreateHot();
                                this.pushData();
                                break;
    
                            case 'deleteRow':
                                let characterName = hot.getDataAtProp('NAME')[options.start.row];
                                let characterId   = hot.getDataAtProp('id')[options.start.row];
                                let confirm       = window.confirm(
                                    `キャラクタ『${characterName}』を削除してもよろしいですか？\n`
                                    + `この操作は、関連する駒も全て削除します。`
                                );
                                if (confirm !== true) {
                                    return false;
                                }
                                playGround.removePawnByAllBoard(characterId);
                                this.deleteRow(characterId);
                                this.pushData();
                                break;
                            case 'addParameter':
                                let alertMsg  =
                                        '追加するパラメータ名を10文字以内で指定してください。\n' +
                                        'チェックボックスを作る場合は先頭に*を付けてください。\n' +
                                        '半角カンマか空白で区切ると、複数行を一気に作成できます。';
                                let addTarget = (window.prompt(
                                        alertMsg, 'こうげき, ぼうぎょ, *どく') || ''
                                ).trim();
                                
                                /*
                                 * キャンセルボタンを押した場合、空文字を入力した場合はそのまま閉じる
                                 */
                                if (typeof addTarget !== 'string' || addTarget === '') {
                                    return false;
                                }
                                
                                /*
                                 * 空白を半角カンマへ変換、半角カンマでパースしてバリデーション
                                 */
                                let paramArray = addTarget.replace(/\s/g,',').split(',')
                                    .map(function(v) {
                                        return v.trim().replace(/^[＊]/, '*')
                                    }).filter(function(v) {
                                        return !(v === '')
                                    });
                                
                                let error = paramArray.some((v) => {
                                    if (this.header.indexOf(v) !== -1) {
                                        // 既に存在する名前もNG
                                        window.alert('『' + v + '』' + 'は既に存在するみたいです……');
                                        return true;
                                    }
                                    if (['_id', 'scenarioId'].indexOf(v) !== -1) {
                                        // 予約語もNG
                                        window.alert('ごめんなさい、' + '『' + v + '』' + 'はMaboが使うIDなんです。');
                                        return true;
                                    }
                                    if (v.length > 10) {
                                        // 10文字以上はNG
                                        window.alert('『' + v + '』' + 'は長過ぎるようです。10文字以内に短縮してみてください。');
                                        return true;
                                    }
                                    if ((v.indexOf(' ') !== -1) || (v.indexOf('　') !== -1)) {
                                        // 半角空白、全角空白はNG
                                        window.alert('『' + v + '』' + 'の中にスペースが混じっていませんか？');
                                        return true;
                                    }
                                    if (v.substring(0, 1) === '_') {
                                        // 先頭にアンダースコアはNG
                                        window.alert('『' + v + '』' + 'の先頭のアンダースコアを取ってみてください。');
                                        return true;
                                    }
                                });
                                
                                if (error) {
                                    return false;
                                }
                                
                                // ヘッダに項目を追加
                                paramArray.forEach((v) => {
                                    this.header.push(v);
                                });
                                // データ部をヘッダに合わせて正規化
                                this.initData();
                                // hot再生成
                                this.recreateHot();
                                // 変更を通知
                                this.pushData();
                                return false;
                                break;
                            case 'removeParameter':
                                let start     = (options.start.col <= options.end.col) ? options.start.col : options.end.col;
                                let end       = (options.start.col <= options.end.col) ? options.end.col : options.start.col;
                                let colNames  = this.header.slice(start, end + 1);
                                let removeCol = (window.confirm('『' + colNames + '』' + 'を削除します。'));
                                
                                /*
                                 * OKボタンを押さなかった場合はなにもしない
                                 */
                                if (!removeCol) {
                                    return false;
                                }
                                
                                /*
                                 * ヘッダから項目を削除、データを正規化
                                 */
                                this.header.splice(start, (end - start + 1));
                                this.data.forEach(function(v) {
                                    colNames.forEach(function(w) {
                                        if (v.hasOwnProperty(w)) {
                                            delete v[w];
                                        }
                                    })
                                });
                                
                                this.pushData();
                                this.recreateHot();
                                break;
                            case 'forceReload':
                                this.reloadHot();
                                break;
                            case 'pushData':
                                this.pushData();
                                break;
                            default:
                                trace.error('該当するコンテキストメニューがありません');
                                break;
                        }
                    }
                }
                
            }
        );
        $('#resource-grid').height('100%');
    },
};

module.exports = characterGrid;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const _def       = __webpack_require__(1);
const trace      = __webpack_require__(0);
const scenarioId = /\/scenarios\/([a-f0-9]+)/.exec(window.location.href)[1];

let socket = undefined;

let fukidashi = {
    setSocket: function(_socket) {
        socket = _socket;
    },
    /**
     * [
     *   {
         *     socketId
         *     alias
         *     thought
         *   },...
     * ]
     */
    list     : [],
    add      : function(container) {
        this.list = this.list.filter((v, i) => {
            if (v.socketId !== container.socketId) {
                return v;
            }
        });
        
        if (container.data.thought.trim() !== '') {
            this.list.push({
                socketId: container.socketId,
                alias   : container.data.alias,
                thought : container.data.thought
            });
        }
        this.update();
    },
    clear    : function() {
        this.list = [];
        this.update();
    },
    update   : function() {
        /*
         * thought の状態でtableを更新する
         */
        if (this.list.length === 0) {
            $('#t').find('> tbody').empty();
        } else {
            $('#t').find('> tbody').html(this.list.map(function(v) {
                return (socket.id !== v.socketId) ? `<tr><td>${v.alias}</td><td style="white-space: nowrap;">${v.thought}</td></tr>` : '';
            }).join())
        }
    }
};


module.exports = fukidashi;

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const util       = __webpack_require__(2);
const scenarioId = /\/scenarios\/([a-f0-9]+)/.exec(window.location.href)[1];
const trace      = __webpack_require__(0);

let imageManager = {
    commonTag        : [],
    initCommonTag    : function() {
        let tagHolder = $('#imageTags');
        $(tagHolder).empty();
        util.callApiOnAjax(`/images/tags`, 'get')
            .done(function(r, status) {
                /*
                 * 共通タグ作成
                 */
                r.forEach(function(v) {
                    $('#imageTags').append(
                        `<label class="form-check form-check-inline form-check-label" style="font-size:12px">` +
                        `<input name="commonTags" data-imagetag="${v}" class="form-check-input" type="checkbox">` +
                        `${v}</label>`
                    )
                });
            })
            .fail(function(r, status) {
            
            })
    },
    setCommonTagState: function() {
        this.commonTag = [];
        $('[name=commonTags]:checked').each((i, v) => {
            this.commonTag.push($(v).attr('data-imagetag'))
        });
    },
    setTagState      : function() {
        this.images.forEach(function(v, i) {
            v.tags = [];
            $(`input[data-listindex=\"${i}\"]:checked`).each(function(j, w) {
                v.tags.push($(w).attr('data-imagetag'));
            })
        })
    },
    images           : [],
    initImages       : function() {
        /*
         * ローカルから読み取った画像について、送信用データ、DOMを全て削除し初期化
         */
        trace.log('initImages'); // @DELETEME
        this.images = [];
        $('#pickedImage').empty();
        $('#imageUploader').val('');
    },
    onImagePick      : function(files) {
        /*
         * ファイルピッカーのchangeイベントが呼ぶメソッド
         */
        if (!files.length) {
            return false;
        }
        this.initImages();
        let extensionError = false;
        for (let i = 0; i < files.length; i++) {
            if (!/(\.png|\.jpg|\.jpeg|\.gif)$/i.test(files[i].name)) {
                extensionError = true;
                $('#pickedImage').append(
                    `<li class="media">` +
                    `<span>${files[i].name}</span><span class="text-muted">&nbsp;-&nbsp;読み込めませんでした。</span>` +
                    `</li>`
                );
                continue;
            }
            
            let fr = new FileReader();
            fr.readAsDataURL(files[i]);
            
            fr.onload = (e) => {
                /*
                 * ファイルピッカーがファイルを読み込んだ時の処理
                 */
                let img = new Image();
                
                img.src    = fr.result;
                img.onload = () => {
                    /*
                     * サムネイルと情報、個別タグ編集フォームの追加
                     */
                    $('#pickedImage').append(
                        `<li data-listindex="${i}" data-ignore="false" class="media mt-1">` +
                        `<img class="d-flex mr-3" src="${fr.result}" width="150" height="150">` +
                        `<div class="media-body">` +
                        `<h5 class="mt-0 mb-1">${files[i].name}</h5>` +
                        `<h6 class="${(files[i].size > 3 * 1024 * 1024 ) ? 'text-danger' : 'text-muted'}">` +
                        `${img.width}x${img.height},&nbsp;${Math.round(files[i].size / 1024)}kbytes` +
                        `&nbsp;<i data-listindex="${i}" class="fa fa-trash"></i>` +
                        `</h6>` +
                        `<input type="text" name="imageTagForm" placeholder="立ち絵 笑顔,日本人 女性" style="font-size:11px;"/>` +
                        `</div>` +
                        `</li>`
                    );
                    
                    /*
                     * base64(バイナリを文字列で扱う形式)をBlob(バイナリ)へ変換
                     */
                    this.images.push({
                        index   : i,
                        name    : files[i].name,
                        fileSize: files[i].size,
                        width   : img.width,
                        height  : img.height,
                        base64  : fr.result,
                        tags    : []
                    });
                    
                    /*
                     * ゴミ箱アイコンをクリックするとサムネイル一覧から削除
                     */
                    $(`i[data-listindex=\"${i}\"]`).on('click', () => {
                        let li     = $(`li[data-listindex=\"${i}\"]`);
                        let ignore = ($(li).attr('data-ignore') === 'false' ? 'true' : 'false');
                        
                        $(li).attr('data-ignore', ignore)
                            .css('opacity', (ignore === 'false' ? '1.0' : '0.3'));
                        this.images.map(function(v) {
                            if (v.index === i) {
                                v['ignore'] = ignore;
                            }
                            return v;
                        })
                    });
                    
                    /*
                     * 個別タグの編集フォームにイベント付与
                     */
                    $('input[name=imageTagForm]').on('blur', function(e) {
                        let that = e.target;
                        let tags = $(that).val().trim()
                            .split(' ').join(',').split(',')
                            .filter(function(v, j, a) {
                                return a.indexOf(v) === j && v !== '';
                            });
                        if (tags.length === 0) {
                            return false;
                        }
                        tags.forEach(function(v) {
                            /*
                             * 既に同名のタグが存在する場合は作成しない
                             */
                            if ($(`input[data-listindex=\"${i}\"][data-imagetag=\"${v}\"]`).length === 0) {
                                $(that).after(
                                    `<label class="form-check form-check-inline form-check-label">` +
                                    `<input name="imageTags" data-listindex="${i}" data-imagetag="${v}" class="form-check-input" type="checkbox" checked>` +
                                    `${v}</label>`
                                );
                            }
                        });
                        
                        $(that).val('');
                    })
                };
            }
        }
        if (extensionError) {
            trace.error('extension error!'); // @DELETEME
        }
    },
    upload           : function() {
        /*
         * 共通タグ、個別タグ、シナリオ限定フラグ
         */
        this.setCommonTagState();
        this.setTagState();
        let thisScenarioOnly = $('#thisScenarioOnly').prop('checked');
        if (thisScenarioOnly === true) {
            this.images.map(function(v) {
                let w = v.scenarioId = scenarioId;
                return w;
            });
        }
        
        /*
         * 送信無視(ゴミ箱アイコン)のデータを無視してアップロード
         */
        this.images
            .filter(function(v) {
                trace.info('filter'); // @DELETEME
                trace.info(v.ignore !== 'true'); // @DELETEME
                return v.ignore !== 'true'
            })
            .forEach((v) => {
                /*
                 * 共通タグと個別タグをマージ
                 */
                v.tags       = v.tags
                    .concat(this.commonTag)
                    .filter(function(v, i, a) {
                        return a.indexOf(v) === i
                    });
                let sendData = {
                    data: {
                        images: v,
                    }
                };
                util.callApiOnAjax('/images', 'post', sendData)
                    .done(function(r, status) {
                        trace.info(r); // @DELETEME
                        $('#pickedImage').empty();
                    })
                    .fail(function(r, status) {
                        trace.info(r); // @DELETEME
                    })
                    .always(function(r, status) {
                    
                    });
            });
        this.initImages();
    },
};

module.exports = imageManager;

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const util       = __webpack_require__(2);
const _def       = __webpack_require__(1);
const scenarioId = /\/scenarios\/([a-f0-9]+)/.exec(window.location.href)[1];
const trace      = __webpack_require__(0);
const Pawn       = __webpack_require__(10);

let socket     = undefined;
let playGround = undefined;

let Board                        = function(_socket, _playGround, id, option) {
    this.id         = id;
    this.characters = [];
    socket          = _socket;
    playGround      = _playGround;
    this.dom        =
        $('<div></div>', {
            width   : '200px',
            height  : '200px',
            addClass: 'board',
            css     : {
                "background-color": 'lightgray',
                "position"        : 'absolute',
                "top"             : '0px',
                "left"            : '0px',
                "z-index"         : '0',
                "cursor"          : 'move',
                "font-size"       : '10px'
            },
        });
    
    if (playGround.boards.some(function(v) {
            return v.id === id
        })) {
        trace.warn('同じBoardが既に存在しています。'); // @DELETEME
        return
    }
    
    $(this.dom)
        .attr('data-board-id', id)
        .attr('title', `board: ${option.name}`)
        .text(`[board] ${option.name}:${id}`)
        .draggable({
            grid : [5, 5],
            start: () => {
                playGround.popBoardUp(id);
            }
        })
        .resizable({
            ghost  : true,
            animate: true
        })
        .on('click', () => {
            playGround.popBoardUp(id);
        })
        .on('contextmenu', (e) => {
            let menuProperties = {
                items   : [
                    {
                        key : 'destroy',
                        name: 'このボードを削除'
                    }
                ],
                callback: (e, key) => {
                    switch (key) {
                        case 'destroy':
                            let confirm = window.confirm(`ボード『${option.name}』を削除しますか？`);
                            if (confirm !== true) {
                                return false;
                            }
                            playGround.removeBoard(id);
                            break;
                        default:
                            break;
                    }
                }
            };
            util.contextMenu(e, menuProperties);
            e.stopPropagation();
        });
    $('#playGround').append(this.dom);
    
    /*
     * ナビにボタンを追加
     */
    $('#addBoard')
        .before(
            $(`<span></span>`,
                {
                    "addClass"               : 'ml-3',
                    "data-board-indicator-id": id
                })
                .append(
                    $(`<i>${option.name}</i>`).addClass('fa fa-toggle-right')
                ));
    trace.log(`ボード: ${option.name}を作成しました！`);
    
    /*
     * ボードに紐づくコマを読み込んで表示する
     */
    let criteria = {boardId: this.id};
    this.loadPawn(criteria);
};
Board.prototype.getCharacterById = function(characterId, dogTag) {
    let character = this.characters.find(function(v) {
        return (v.id === characterId && v.dogTag === dogTag);
    });
    return character;
};
Board.prototype.getDogTag        = function(characterId) {
    
    if (typeof characterId === 'undefined') {
        return undefined;
    }
    
    let characters = this.characters.filter(function(v) {
        return v.id === characterId;
    });
    if (characters.length === 0) {
        return 0
    }
    
    let dogTagMax = parseInt(characters.reduce(function(a, b) {
        return (a.dogTag >= b.dogTag) ? a : b
    }).dogTag, 10);
    
    return dogTagMax + 1
};
/**
 * キャラクタの駒のDOMを作成する。
 * @param _characterId
 * @param _dogTag
 * @param meta
 */
Board.prototype.deployCharacter = function(_characterId, _dogTag, meta) {
    trace.log(`コマ作成。 characterId:${_characterId}, dogTag:${_dogTag}`);
    let that    = this;
    let boardId = this.id;
    let pawn    = new Pawn(socket, playGround, boardId, _characterId, _dogTag, meta);
    that.characters.push(pawn)
};
/**
 * シナリオとボードに紐づく駒を、新しくDBへ登録する。
 * ドッグタグはDB側で採番する。
 * 登録成功時は自分を含め、全員へ通知。
 *
 * @param characterId
 */
Board.prototype.registerCharacter = function(characterId) {
    let data = {
        scenarioId : scenarioId,
        boardId    : this.id,
        characterId: characterId,
        top        : 0,
        left       : 0
    };
    util.callApiOnAjax('/pawns', 'post', {data: data})
        .done(function(r) {
            /*
             * 登録したpawnの情報を受け取る
             */
            let payLoad = {
                scenarioId : scenarioId,
                pawnId     : r.pawnId,
                boardId    : r.boardId,
                characterId: r.characterId,
                dogTag     : r.dogTag,
            };
            trace.log(`DBへコマを新しく登録しました。`);
            socket.emit('deployPawns', payLoad);
        })
        .fail(function(r) {
        });
};
/**
 * DBから、シナリオとボードに紐づく駒の情報を取得する。
 * キャラクタIDを指定した場合、その条件で絞り込む。
 *
 * @param characterId
 */
Board.prototype.loadCharacter = function(characterId) {
    
    let dogTag  = this.getDogTag(characterId);
    let boardId = this.id;
    let data    = {
        scenarioId : scenarioId,
        boardId    : boardId,
        characterId: characterId,
        dogTag     : dogTag,
        top        : 0,
        left       : 0
    };
    util.callApiOnAjax('/pawns', 'get', {data: data})
        .done(function(r) {
            return r;
        })
        .fail(function() {
            return undefined;
        })
};
/**
 * ボード上の駒のDOMを削除する。指定方法はキャラクターIDとドッグタグ。
 * ドッグタグのみの指定はできない。
 * 指定しない場合、その条件については絞り込まず、該当する全ての駒を削除する。
 *
 * @param characterId
 * @param dogTag
 */
Board.prototype.destroyCharacter = function(characterId, dogTag) {
    trace.info(`ボード:${this.id} から、コマ ${characterId} - ${dogTag} を削除。`);
    /*
     * charactersへのポインタ
     */
    let characters = playGround.getBoardById(this.id).characters;
    for (let i = 0; i < characters.length; i++) {
        let character = characters[i];
        if (character.id === characterId && character.dogTag === dogTag) {
            /*
             * DOMから削除し、ボードのキャラクタ配列からも削除する。
             */
            $(characters[i].dom).remove();
            characters.splice(i, 1);
        }
    }
};
/**
 * DBから対象のコマを削除する。
 * 削除成功時はdestroyPawns=コマのDOM削除リクエストを送信する。
 *
 * @param criteria
 */
Board.prototype.deleteCharacter = function(criteria) {
    let query = util.getQueryString(criteria);
    util.callApiOnAjax(`/pawns${query}`, 'delete')
        .done(function(deletedDocs) {
            /*
             * DOM削除リクエストの送信
             */
            trace.log('DBからコマ情報を削除しました。');
            if (deletedDocs.length === 0) {
                return false;
            }
            deletedDocs.forEach(function(d) {
                socket.emit('destroyPawns', d);
            })
        })
        .fail(function(r) {
            trace.warn('DBからコマを削除しようとしましたが、失敗しました。');
            trace.error(r);
        })
};
/**
 * deployPawnsからコールする。
 * コマをDBへ登録した通知を受け取った際のDOM作成処理。
 *
 * @param criteria
 */
Board.prototype.loadPawn = function(criteria) {
    trace.log('DBからコマの情報を取得中です。');
    let query = util.getQueryString(criteria);
    util.callApiOnAjax(`/pawns${query}`, 'get')
        .done(function(result) {
            for (let i = 0; i < result.length; i++) {
                let r           = result[i];
                let boardId     = r.boardId;
                let characterId = r.characterId;
                let dogTag      = r.dogTag;
                let meta        = r.meta;
                playGround.getBoardById(boardId).deployCharacter(characterId, dogTag, meta);
            }
        })
        .fail(function() {
            trace.warn('DBからコマ情報を取得する際にエラーが発生しました。');
        })
};

module.exports = Board;



/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const util       = __webpack_require__(2);
const _def       = __webpack_require__(1);
const scenarioId = /\/scenarios\/([a-f0-9]+)/.exec(window.location.href)[1];
const trace      = __webpack_require__(0);

let socket     = undefined;
let playGround = undefined;

/**
 * コマのプロトタイプ。
 * ボード(boardId)、キャラクタ表の行(characterId)、dogTagとの組み合わせで一意に定まる。
 * @param _socket
 * @param _playGround
 * @param boardId
 * @param characterId
 * @param dogTag
 * @param meta
 * @constructor
 */
let Pawn               = function(_socket, _playGround, boardId, characterId, dogTag, meta) {
    this.boardId = boardId;
    this.id      = characterId;
    this.dogTag  = dogTag;
    socket       = _socket;
    playGround   = _playGround;
    this.style   = ( typeof  meta !== 'undefined' && meta.hasOwnProperty('style') )
        ? meta.style
        : {};
    this.attr    = ( typeof  meta !== 'undefined' && meta.hasOwnProperty('attr') )
        ? meta.attr
        : {};
    
    /*
     * DOM初期設定
     */
    this.dom = $('<div></div>', {
        width : '50px',
        height: '50px',
        css   : {
            "background-color": '#00B7FF',
            "position"        : 'absolute'
        },
    })
        .attr('data-board-id', boardId)
        .attr('data-character-id', characterId)
        .attr('data-character-dog-tag', dogTag)
        .html(`${characterId}-${dogTag}</br>${boardId}`);
    
    /*
     * styleの指定があった場合は上書き
     */
    let styleKeys = Object.keys(this.style).filter(function(v) {
        return v.trim() !== ''
    });
    if (styleKeys.length !== 0) {
        $(this.dom).css(this.style);
    }
    
    /*
     * attrの指定があった場合は上書き
     */
    let attrKeys = Object.keys(this.attr).filter(function(v) {
        return v.trim() !== ''
    });
    if (attrKeys.length !== 0) {
        for (let i = 0; i < attrKeys.length; i++) {
            let key   = attrKeys[i];
            let value = this.attr[key];
            $(this.dom).attr(key, value);
        }
    }
    
    /*
     * jQuery-UI のdraggableウィジェット設定
     */
    $(this.dom)
        .draggable({
            grid : [1, 1],
            start: function(e, ui) {
            },
            stop : function(e) {
                /*
                 * ドラッグ終了時、座標を取得してsocketで通知する
                 */
                let axis = {
                    top : $(e.target).css('top'),
                    left: $(e.target).css('left')
                };
                let data = {
                    scenarioId : scenarioId,
                    boardId    : boardId,
                    characterId: characterId,
                    dogTag     : dogTag,
                    axis       : axis
                };
                socket.emit('movePawns', data);
            },
        });
    
    /*
     * 右クリック時の処理をオーバーライド
     */
    $(this.dom)
        .on('contextmenu', function(e) {
            let menuProperties = {
                items   : [
                    {
                        key : 'setImage',
                        name: 'この駒に画像を割り当てる'
                    },
                    {
                        key : 'destroy',
                        name: 'この駒を削除'
                    },
                    {
                        key : 'copy',
                        name: 'このキャラクタの駒を1個増やす'
                    }
                ],
                callback: function(e, key) {
                    switch (key) {
                        case 'setImage':
                            break;
                        case 'destroy':
                            let confirm = window.confirm(`この駒を削除してもよろしいですか？`);
                            if (confirm !== true) {
                                return false;
                            }
                            let criteria = {
                                scenarioId : scenarioId,
                                boardId    : boardId,
                                characterId: characterId,
                                dogTag     : dogTag
                            };
                            playGround.getBoardById(boardId).deleteCharacter(criteria);
                            
                            break;
                        case 'copy':
                            playGround.getBoardById(boardId).loadCharacter(characterId);
                            break;
                    }
                }
            };
            util.contextMenu(e, menuProperties);
            e.stopPropagation();
        });
    
    /*
     * DOMツリーに追加
     */
    $(playGround.getBoardById(boardId).dom).append(this.dom);
    trace.info(`Pawnをボード:${this.boardId}に作成。`);
};
Pawn.prototype.getMeta = function() {
    let styles     = [
        'top',
        'left',
        'width',
        'height',
        'background-color',
        'opacity'
    ];
    let attributes = [
        'title',
    ];
    
    let meta = {
        style: {},
        attr : {}
    };
    for (let i = 0; i < styles.length; i++) {
        let style = styles[i].trim();
        if (style === '') {
            continue;
        }
        meta.style[style] = $(this.dom).css(style);
    }
    for (let j = 0; j < attributes.length; j++) {
        let attribute = attributes[j].trim();
        if (attribute === '') {
            continue;
        }
        meta.attr[attribute] = $(this.dom).attr(attribute);
    }
    
    return meta
};
Pawn.prototype.setMeta = function(_meta) {
    /*
     * 要素にstyleもattrも持っていない場合は終了
     */
    if ((!_meta.hasOwnProperty('style')) && (!_meta.hasOwnProperty('attr'))) {
        return false;
    }
    let meta = {};
    /*
     * 要素の指定があった場合は、それぞれについてコマに適用
     */
    meta.style    = _meta.hasOwnProperty('style') ? _meta.style : {};
    meta.attr     = _meta.hasOwnProperty('attr') ? _meta.attr : {};
    let keysStyle = Object.keys(meta.style);
    for (let i = 0; i < keysStyle.length; i++) {
        let key   = keysStyle[i].trim();
        let value = meta.style[key];
        if (key === '') {
            continue;
        }
        $(this.dom).css(key, value);
    }
    let keysAttr = Object.keys(meta.attr);
    for (let i = 0; i < keysAttr.length; i++) {
        let key   = keysAttr[i].trim();
        let value = meta.style[key];
        if (key === '') {
            continue;
        }
        $(this.dom).attr(key, value);
    }
    return false;
};

module.exports = Pawn;

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const _def       = __webpack_require__(1);
const trace      = __webpack_require__(0);
const textForm   = __webpack_require__(4);
const scenarioId = /\/scenarios\/([a-f0-9]+)/.exec(window.location.href)[1];

let command = {
    /**
     * spell: trimしたスラッシュコマンド全文
     */
    rawSpell: '',
    isSpell : false,
    spell   : '',
    arg     : [],
    options : [],
    _init   : function() {
        this.rawSpell = '';
        this.isSpell  = false;
        this.spell    = '';
        this.arg      = [];
        this.options  = [];
    },
    /**
     * 入力内容をパースし、/^\// にマッチした場合はtrueを返却、それ以外の場合はfalseを返す。
     *
     * @param rawSpell
     */
    parse   : function(rawSpell) {
        
        let result = rawSpell.match(/^\/([^ ]+)/);
        
        this._init();
        if (result === null) {
            this.isSpell = false;
            return false;
        }
        this.isSpell  = true;
        this.rawSpell = rawSpell;
        this.spell    = result[1];
        rawSpell.replace(/^\/([^ ]+)/, '').trim().split(' ')
            .filter((v) => {
                return v !== '';
            })
            .forEach((v) => {
                if (v.match(/^[^-][\w\d]*/) !== null) {
                    this.arg.push(v);
                    return false;
                }
                if (v.match(/^-/) !== null) {
                    this.options.push(v.replace(/^-/, ''));
                    return false;
                }
            });
    },
    exec    : function() {
        let spell = spellBook.find(this.spell);
        if (spell === null) {
            textForm.insertMessages({msg: '無効なコマンドです。:' + this.spell});
            return false;
        }
        spell.cast(this.spell, this.arg, this.options, this.rawSpell);
    },
};


let spellBook = {
    /**
     * D 1 100 は 1D100 のエイリアスにする？
     */
    spell: [],
    /**
     * スラッシュ直後のコマンド名から、該当するSpellクラスを返却する
     * 該当するコマンドが見つからなかった場合はnullを返却する
     *
     * @param spell
     */
    find : (spell) => {
        let result = null;
        spellBook.spell.some((v) => {
            if (v.re(spell) === true) {
                result = v;
                return true;
            }
            return false;
        });
        return result;
    },
    cast : (spellName) => {
        trace.log('exec: ' + spellName); // @DELETEME
        
    },
    /**
     * @param action 'add'
     */
    edit : (action) => {
    
    }
};

module.exports = command;

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/*
 * 各モジュール読み込み
 */

/*
 * 定数
 */
const _def = __webpack_require__(1);

/*
 * 共通関数など
 */
const util = __webpack_require__(2);

const trace = __webpack_require__(0);

/*
 * 画像アップローダ
 */
const imageManager  = __webpack_require__(8);

/*
 * ボードとコマ
 */
const playGround    = __webpack_require__(3);

/*
 * キャラクタ表
 */
const characterGrid = __webpack_require__(6);

/*
 * チャット
 */
const textForm = __webpack_require__(4);

/*
 * 入力中通知
 */
const fukidashi = __webpack_require__(7);

/*
 * 使うsocketを統一するため、socket managerを作成してモジュールへ渡す
 */
const SOCKET_EP = _def.SOCKET_EP;
const socket    = io(SOCKET_EP);

playGround.setSocket(socket);
characterGrid.setSocket(socket);
textForm.setSocket(socket);
fukidashi.setSocket(socket);

let hot;

const scenarioId = /\/scenarios\/([a-f0-9]+)/.exec(window.location.href)[1];

socket.on('connect', function() {
    /*
     * 接続確立後、シナリオIDごとのsocket.roomへjoinするようサーバへ要請する
     */
    trace.info('接続しました！');
    socket.emit('join', scenarioId);
});
socket.on('welcome', function() {
    /*
     * socket.roomへ正常にjoinした際のウェルカムメッセージ
     */
    trace.info(`シナリオID:${scenarioId}のsocket.roomへjoinしました！`);
    textForm.insertMessages({msg: 'チャットへ接続しました！'})
});
socket.on('logIn', function(container) {
    // ログイン通知
    if (socket.id === container.socketId) {
        // 自分の場合
        $('#u').val('Anonymous');
        textForm.insertMessages({msg: `ログインしました。 id = ${socket.id}`});
        return false;
    }
    textForm.insertMessages({msg: `${container.socketId} がログインしました。`});
});

socket.on('chatMessage', function(container) {
    textForm.insertMessages(container.data)
});

socket.on('changeAlias', function(data) {
    textForm.insertMessages(data)
});
socket.on('logOut', function(data) {
    fukidashi.clear();
    textForm.insertMessages(data)
});
socket.on('onType', function(container) {
    fukidashi.add(container);
});

/**
 * キャラクタ表の更新リクエストを受信した際の処理
 */
socket.on('reloadCharacters', function(data) {
    /*
     * 自分が発信したものについては無視
     */
    if (data.from === socket.id) {
        return false;
    }
    characterGrid.reloadHot();
});

/**
 * 新規ボードをDBへ登録した後、他のユーザにそのボードを読み込み、DOMを作成させるリクエストを受信した際の処理
 */
socket.on('deployBoards', function(data) {
    let criteria = {};
    playGround.loadBoard(scenarioId);
});

/**
 * ボードをDBから削除した際、他のユーザにそのボードをDOMから削除させるリクエストを受信した際の処理
 */
socket.on('destroyBoards', function(data) {
    playGround.destroyBoard(data.boardId);
});

/**
 * 新規コマをDBへ登録した後、他のユーザにそのコマを読み込み、DOMを作成させるリクエストを受信した際の処理
 */
socket.on('deployPawns', function(data) {
    /*
     * キャラクタのコマをDBへ登録した後にコールする。
     * DBから指定した条件でコマをロードし、DOMとして配置する。
     */
    let boardId = data.boardId;
    playGround.getBoardById(boardId).loadPawn(data);
});

/**
 * コマの移動、名前、画像情報の変更の通知があった際、それらを反映する
 */
socket.on('movePawns', function(data) {
    let boardId     = data.boardId;
    let characterId = data.characterId;
    let dogTag      = data.dogTag;
    let meta        = {style: data.axis};
    
    let board     = playGround.getBoardById(boardId);
    let character = board.getCharacterById(characterId, dogTag);
    character.setMeta(meta);
});

/**
 * コマをDBから削除した際、他のユーザにそのコマをDOMから削除させるリクエストを受信した際の処理
 */
socket.on('destroyPawns', function(data) {
    let boardId = data.boardId;
    playGround.getBoardById(boardId).destroyCharacter(data.characterId, data.dogTag);
});


// function Spell(name, pattern, logic) {
//     this.setName(name);
//     this.setPattern(pattern);
//     this.setLogic(logic);
//     this.publish();
// };
// Spell.prototype = {
//
//     setName(_name){
//         this.name = _name;
//     },
//     getName() {
//         return this.name;
//     },
//     setPattern(_pattern) {
//         this.pattern = _pattern;
//     },
//     getPattern(){
//         return this.pattern;
//     },
//     setLogic(_logic){
//         this.logic = _logic;
//     },
//     getLogic(){
//         return this.logic;
//     },
//     re(subject){
//         let regexp = new RegExp(this.getPattern());
//         return regexp.test(subject);
//     },
//     publish(){
//         spellBook.spell.push(this);
//     },
//     cast(spellName, arg, options, rawSpell){
//         this.logic(spellName, arg, options, rawSpell);
//     },
//     // ダイスクラス
//     makeDice(faces){
//         return new Dice(faces);
//     },
//     // spell内でのユーティリティメソッド
//     disp(){
//     },
//     // tellに近い……？
//     send(){
//     },
//     // Diceクラスのメソッドとして実装する？
//     xDy(){
//     },
//     ccb(){
//     },
//     // evalのラッパー。
//     _eval(){
//     },
// };
//
// function Dice(faces) {
//     this.faces = faces;
// }
// Dice.prototype = {};
//
// /*
//  * 数式処理を行うかの判定:
//  * 1. 数字、四則演算+余算、半角括弧、等号(==)、否定等号(!=)、不等号(<,>,<=,>=)、ccb、d (ignore case)
//  *  /^([\d-\+\*\/\%\(\)]|ccb|\d+d\d+)*$/i  @WIP
//  * 方針:
//  * 1. 予約演算子を置換する(有限回数ループ)
//  *   1. xDy、ccb
//  * 1. 正規表現でバリデートして_evalに突っ込む
//  * 1. 表示する
//  *   1. 処理する文字列(予約演算子置換前)
//  *   1. 計算する数式  (予約演算子置換後)
//  *   1. 結果
//  */
// let formula = new Spell('formula', /^aaa$/i, () => {
//     console.info(this); // @DELETEME
//
// });

$(window)
    .ready(() => {
        
        /*
         * ブラウザバックの向き先をこのページにする(厳密なブラウザバックの禁止ではない)
         */
        history.pushState(null, null, null);
        window.addEventListener("popstate", function() {
            history.pushState(null, null, null);
        });
        
        // データコンテナの初期化
        textForm.container.update();
        
        // typing……の判別用に、チャットバーにフォーカスが当たったタイミングの入力内容を保持する
        $('#m')
            .on('change', () => {
                textForm.onType();
            })
            .on('keypress', (e) => {
                if (e.keyCode === 13 || e.key === 'Enter') {
                    textForm.ret();
                    return false;
                }
                textForm.onType();
            })
            .on('keyup', () => {
                textForm.onType();
            })
            .on('blur', () => {
                textForm.onType();
            })
            .autocomplete({
                /**
                 * コマンド実行履歴も追加する？
                 */
                source  : ['/ccb', '/1D100', '/1D20'],
                position: {at: 'left bottom'},
                
            });
        $('.ui-autocomplete').css('z-index', '200');
        
        $('#u')
            .on('blur', () => {
                textForm.changeAlias();
            })
            .on('keypress', (e) => {
                if (e.keyCode === 13 || e.key === 'Enter') {
                    $('#m').focus();
                }
            });
        
        $('#addBoard').on('click', function() {
            playGround.deployBoard()
        });
        
        characterGrid.makeHot();
        characterGrid.reloadHot();
        
        playGround.loadBoard(scenarioId);
        
        function switcher(key) {
            switch (key) {
                case 'on':
                    $('#u')
                        .autocomplete({
                            source  : characterGrid.data.map(function(v) {
                                return v.NAME || '';
                            }).filter(function(v) {
                                return v !== '';
                            }),
                            position: {at: 'left bottom'},
                        });
                    $('#m')
                        .autocomplete({
                            source  : ['/ccb', '/1D100', '/1D20'],
                            position: {at: 'left bottom'},
                        });
                    break;
                case 'off':
                    $('#u')
                        .autocomplete('destroy');
                    $('#m')
                        .autocomplete('destroy');
                    break;
            }
        }
        
        function killSpace(selector) {
            $(selector)
                .css('margin', '0px')
                .css('padding', '0px')
                .css('width', '100%')
                .css('height');
        }
        
        function fitMessage() {
            killSpace('#chatLog');
            $('#messages-scroll').css('height', $('#chatLog').parent().height() - 45);
        }
        
        function keepInWindow(ui, selector) {
            if (ui.position.top < 30) {
                $(selector).parent().css('top', '30px');
            } else if (ui.position.bottom < 50) {
                $(selector).parent().css('bottom', '50px');
            } else if (ui.position.left < 0) {
                $(selector).parent().css('left', '0px');
            } else if (ui.position.right < 0) {
                $(selector).parent().css('right', '0px');
            }
        }
        
        $('#chatLog').dialog({
            autoOpen     : true,
            resizable    : true,
            position     : {at: "right bottom"},
            title        : '履歴',
            classes      : {
                "ui-dialog": "log"
            },
            buttons      : [],
            closeOnEscape: false,
            create       : function() {
                fitMessage();
                setTimeout(fitMessage, 1000)
            },
            resizeStop   : function() {
                fitMessage();
            },
            dragStop     : function(e, ui) {
                fitMessage();
                keepInWindow(ui, '#chatLog');
            }
        });
        
        $('#consoleBase').dialog({
            autoOpen     : true,
            resizable    : true,
            position     : {at: "left bottom"},
            minWidth     : 350,
            minHeight    : 180,
            title        : 'コンソール',
            classes      : {
                "ui-dialog": "console"
            },
            buttons      : [],
            closeOnEscape: false,
            create       : function() {
                killSpace('#consoleBase');
                switcher('on');
            },
            resizeStart  : () => {
                switcher('off');
            },
            resizeStop   : () => {
                killSpace('#consoleBase');
                switcher('on');
            },
            dragStart    : () => {
                switcher('off');
            },
            dragStop     : (e, ui) => {
                keepInWindow(ui, '#consoleBase');
                switcher('on');
            },
        });
        
        $('#characters').dialog({
            autoOpen     : true,
            resizable    : true,
            position     : {at: "right"},
            title        : 'キャラクタ',
            classes      : {
                "ui-dialog": "character"
            },
            buttons      : [],
            closeOnEscape: false,
            minHeight    : 100,
            minWidth     : 400,
            create       : () => {
                killSpace('#characters');
                characterGrid.renderHot();
            },
            resizeStop   : () => {
                killSpace('#characters');
                characterGrid.renderHot();
            },
            dragStop     : (e, ui) => {
                killSpace('#characters');
                keepInWindow(ui, '#characters');
                characterGrid.renderHot();
            }
        });
        
        $('#imageUploader').dialog({
            autoOpen : false,
            resizable: true,
            position : {at: 'center center'},
            title    : '画像登録',
            classes  : {
                "ui-dialog": "imageUploader"
            },
            buttons  : [],
            width    : 600,
            height   : 400,
            dragStop : function(e, ui) {
                keepInWindow(ui, '#imageUploader');
            },
            create   : function() {
                /*
                 * input要素を秘匿しておき、triggerで発火させる
                 */
                $('button[name=imagePicker]').on('click', function(e) {
                    $('input[name=image]').trigger('click');
                });
                /*
                 * ファイルを選択した時の処理
                 */
                $('input[name=image]').change(function() {
                    imageManager.onImagePick(this.files);
                });
                /*
                 * アップロードボタン、クリックイベントと秘匿
                 */
                $('button[name=imageUpload]').click(function() {
                    imageManager.upload()
                });
            },
            open     : function() {
                /*
                 * 共通タグを取得
                 */
                imageManager.initCommonTag();
                
            },
            close    : function() {
                /*
                 * 画像登録ウィンドウを閉じたら初期化する
                 */
                imageManager.initImages()
            }
        });
        
        $('#imageManager').dialog({
            autoOpen : false,
            resizable: true,
            position : {at: 'center center'},
            title    : '画像管理',
            classes  : {
                "ui-dialog": "imageManager"
            },
            buttons  : [],
            width    : 600,
            height   : 400,
            dragStop : function(e, ui) {
                keepInWindow(ui, '#imageManager');
            },
            create   : function() {
            },
            open     : function() {
            },
            close    : function() {
            }
        });
        
        $('.ui-dialog-titlebar-close').each((i, v) => {
            // $(v).css('display', 'none');
        });
        
        $('[role=dialog]').each((i, v) => {
            $(v).css('position', 'fixed');
        });
    })
    .focus(() => {
        /*
         * ウィンドウがアクティブに戻ったらプロンプトにフォーカスを当てる
         */
        $('#m').focus();
        textForm.onType();
    })
    .blur(() => {
        /*
         * ウィンドウからフォーカスが外れたらフキダシを更新
         */
        textForm.onType(true, 'Mabo: ウィンドウを非アクティブにしてます。');
    });



/***/ })
/******/ ]);