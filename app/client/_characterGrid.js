"use strict";

const CU       = require('./commonUtil.js');
const trace    = require('./_trace.js');
const Throttle = require('./_Throttle.js');
const Dialog   = require('./_Dialog.js');

const scenarioId = CU.getScenarioId();

const GRID_THROTTLE = process.env.GRID_THROTTLE;

let hot;

let gridThrottle = new Throttle(function() {
    return true;
}, GRID_THROTTLE);

let socket     = undefined;
let playGround = undefined;

/**
 * リソース表に対応したクラス
 *
 * @param _socket
 * @param _playGround
 * @constructor
 */
let CharacterGrid = function(_socket, _playGround) {
    socket     = _socket;
    playGround = _playGround;
    this.dom   = undefined;
    
    Dialog.call(this);
    
    this.gridDom = $(`<div></div>`, {
        id: 'resource-grid'
    });
    
    $(this.dom).append($(this.gridDom));
    
    
    this.header = [];
    this.data   = [];
    
    this.dialog({
        title: 'キャラクター表',
        width: '500px'
    })
    
    this.makeHot();
    this.reloadHot();
    
    /*
     * キャラクタ表の更新リクエストを受信した際の処理
     */
    socket.on('reloadCharacters', (data) => {
        /*
         * 自分が発信したものについては無視
         */
        if (data.from === socket.id) {
            return false;
        }
        this.reloadHot();
    });
    
};

CharacterGrid.prototype.createHeader = function() {
    let h = [];
    this.data.forEach(function(v) {
        Object.keys(v).forEach(function(k) {
            if (h.indexOf(k) === -1) {
                h.push(k);
            }
        })
    });
    
    this.header = h;
};

/**
 * 選択中のボードへコマを配置する
 *
 * @param characterId
 * @param css
 * @param options
 * @returns {boolean}
 */
CharacterGrid.prototype.deployPiece  = function(characterId, css, options) {
    /*
     * キャラクター表からコマを作成する。
     * 現在アクティブなボードを取得する。
     * アクティブなボードが存在しない場合は何もしない。
     */
    let activeBoardId = playGround.getActiveBoardId();
    if (typeof activeBoardId === 'undefined') {
        trace.warn('選択中のBoardが存在しません');
        return false;
    }
    
    /*
     * アクティブなボードにキャラクターのコマを登録し、全員へ通知。
     */
    playGround.getBoardById(activeBoardId).registerCharacter(characterId)
};

CharacterGrid.prototype.initData     = function() {
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
                if (typeof this.data[i][p] !== 'boolean' && this.data[i][p] !== 'true' && this.data[i][p] !== 'false') {
                    /*
                     * hotのcheckboxが読み込めないデータ形式はfalseへ変換
                     */
                    this.data[i][p] = false;
                }
                this.data[i][p] = (this.data[i][p] === 'true') ? true : this.data[i][p];
                this.data[i][p] = (this.data[i][p] === 'false') ? false : this.data[i][p];
            }
        });
    });
};

/**
 * characterId(id列)を参照し、キャラクタ表から行を削除する。
 *
 * @param characterId
 */
CharacterGrid.prototype.deleteRow = function(characterId) {
    let deleteRowIndex = this.data.findIndex((v) => {
        return parseInt(v.id) === parseInt(characterId);
    });
    if (deleteRowIndex === -1) {
        trace.warn(`削除対象が見つかりませんでした。 id: ${id}`);
        return false;
    }
    this.data.splice(deleteRowIndex, 1);
};

CharacterGrid.prototype.pushData = function() {
    /*
     * ディレイ中の場合は実行しないでキューに入れる
     */
    if (gridThrottle.exec() !== true) {
        /*
         * キューに入っていない場合はキューに入れる
         */
        if (gridThrottle.queued === false) {
            setTimeout(() => {
                this.pushData();
            }, gridThrottle.delay);
            gridThrottle.queued = true;
        }
        return false;
    }
    
    let _data = this.data;
    
    CU.callApiOnAjax(`/characters/${scenarioId}`, 'patch', {
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
};

/**
 * DBのデータを使用してhot再生成
 */
CharacterGrid.prototype.reloadHot = function() {
    CU.callApiOnAjax(`/characters/${scenarioId}`, 'get')
        .done((r) => {
            hot.destroy();
            this.data = r;
            this.makeHot();
        })
        .fail((r, code) => {
            trace.error(r); // @DELETEME
            trace.error(code); // @DELETEME
        });
};

CharacterGrid.prototype.renderHot   = function() {
    if (typeof hot === 'undefined') {
        return false;
    }
    hot.render();
};

CharacterGrid.prototype.recreateHot = function() {
    hot.destroy();
    this.makeHot();
};

/**
 * パラメータを追加する
 *
 * @param addTarget
 * @returns {boolean}
 */
CharacterGrid.prototype.addParam    = function(addTarget) {
    /*
 * キャンセルボタンを押した場合、空文字を入力した場合はそのまま閉じる
 */
    if (typeof addTarget !== 'string' || addTarget === '') {
        return false;
    }
    
    /*
     * 空白を半角カンマへ変換、半角カンマでパースしてバリデーション
     */
    let paramArray = addTarget.replace(/\s/g, ',').split(',')
        .map(function(v) {
            return v.trim().replace(/^[＊]/, '*')
        }).filter(function(v) {
            return !(v === '')
        });
    
    let error = paramArray.some((v) => {
        if (this.header.indexOf(v) !== -1) {
            // 既に存在する名前もNG
            alert('『' + v + '』' + 'は既に存在するみたいです……');
            return true;
        }
        if (['_id', 'scenarioId'].indexOf(v) !== -1) {
            // 予約語もNG
            alert('ごめんなさい、' + '『' + v + '』' + 'はMaboが使うIDなんです。');
            return true;
        }
        if (v.length > 10) {
            // 10文字以上はNG
            alert('『' + v + '』' + 'は長過ぎるようです。10文字以内に短縮してみてください。');
            return true;
        }
        if ((v.indexOf(' ') !== -1) || (v.indexOf('　') !== -1)) {
            // 半角空白、全角空白はNG
            alert('『' + v + '』' + 'の中にスペースが混じっていませんか？');
            return true;
        }
        if (v.substring(0, 1) === '_') {
            // 先頭にアンダースコアはNG
            alert('『' + v + '』' + 'の先頭のアンダースコアを取ってみてください。');
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
};

CharacterGrid.prototype.makeHot     = function() {
    
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
    
    trace.info('キャラクター表を再構成。');
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
            autoRowSize       : true,
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
                            let confirm       = confirm(
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
                            
                            let modalAddParam      = $('#modalAddParam');
                            let modalAddParamInput = $(modalAddParam).find('input');
                            $(modalAddParamInput).val('');
                            $(modalAddParam).modal('open');
                            $(modalAddParam).find('.modal-action')
                                .on('click', () => {
                                    let addTarget = $(modalAddParamInput).val().trim();
                                    this.addParam(addTarget);
                                })
                            return false;
                            break;
                        case 'removeParameter':
                            let start     = (options.start.col <= options.end.col) ? options.start.col : options.end.col;
                            let end       = (options.start.col <= options.end.col) ? options.end.col : options.start.col;
                            let colNames  = this.header.slice(start, end + 1);
                            let removeCol = (confirm('『' + colNames + '』' + 'を削除します。'));
                            
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
};

Object.assign(CharacterGrid.prototype, Dialog.prototype);

module.exports = CharacterGrid;