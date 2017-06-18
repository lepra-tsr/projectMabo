"use strict";

// socket.io connection

let socket                 = io('http://192.168.99.100:3000');
let chatMessage            = '';
let hot                    = undefined;
const FUKIDASHI_MAX_LENGTH = 30;
const FUKIDASHI_THROTTLE   = 300;
const GRID_THROTTLE        = 3000;

let Throttle            = function(callback, delay) {
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
/*
 * グリッドの更新処理用
 */
let gridThrottle = new Throttle(function() {
    return true;
}, GRID_THROTTLE);
/*
 * フキダシの送信頻度制御用
 */
let fukidashiThrottle = new Throttle(function() {
    return true;
}, FUKIDASHI_THROTTLE);

/**
 * Pawn:駒のプロトタイプ。draggableの付いたDOMを持つ。
 */
function Pawn(boardId, css, options) {
    this.boardId = boardId;
    this.title   = '';
    this.top     = 0;
    this.left    = 0;
    this.border  = '';
    this.src     = '';
    this.dom     = $('<div></div>', {
        width : '50px',
        height: '50px',
        css   : {
            "background-color": '#00B7FF',
            "position"        : 'absolute'
        },
    });
    
    $(this.dom)
        .draggable({
            grid: [5, 5],
        });
    $(playGround.boards[boardId].dom).append(this.dom);
    console.info(`Pawn spawned on board: ${this.boardId}`); // @DELETEME
}

/**
 * キャラクタのプロトタイプ。
 * キャラクタ表の行について複数ひも付き、dogTagで一意に定まる。
 * @param boardId
 * @param characterId
 * @param dogTag
 * @param css
 * @param options
 * @constructor
 */
function Character(boardId, characterId, dogTag, css, options) {
    Pawn.call(this, boardId, css, options);
    this.id     = characterId;
    this.dogTag = dogTag;
    $(this.dom)
        .attr('data-board-id', boardId)
        .attr('data-character-id', characterId)
        .attr('data-character-dog-tag', dogTag)
        .text(`${characterId}-${dogTag}`)
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
                            playGround.boards[boardId].destroyCharacter(characterId, dogTag);
                            
                            break;
                        case 'copy':
                            playGround.boards[boardId].deployCharacter(characterId);
                            break;
                    }
                }
            };
            contextMenu(e, menuProperties);
            e.stopPropagation();
        });
}
Character.prototype = Object.create(Pawn.prototype);


function Board(id) {
    this.id         = id;
    this.maps       = [];
    this.characters = [];
    
    this.dom =
        $('<div></div>', {
            width   : '500px',
            height  : '500px',
            addClass: 'board',
            css     : {
                "background-color": 'lightgray',
                "position"        : 'absolute',
                "top"             : '0px',
                "left"            : '0px',
                "z-index"         : '0',
                "cursor"          : 'move'
            },
        });
    $(this.dom)
        .attr('data-board-id', id)
        .text(`board:${id}`)
        .draggable({
            grid : [5, 5],
            start: function(e, ui) {
                playGround.popBoardUp(id);
            }
        })
        .resizable({
            ghost  : true,
            animate: true
        })
        .on('click', function(e) {
            playGround.popBoardUp(id);
        })
        .on('contextmenu', function(e) {
            let menuProperties = {
                items   : [
                    {
                        key : 'destroy',
                        name: 'このボードを削除'
                    }
                ],
                callback: function(e, key) {
                    switch (key) {
                        case 'destroy':
                            playGround.destroyBoard(id);
                            break;
                        default:
                            break;
                    }
                }
            };
            contextMenu(e, menuProperties);
            e.stopPropagation();
        });
    $('#playGround').append(this.dom);
    console.info(`board: ${this.id} spawned.`); // @DELETEME
}
Board.prototype.getDogTag        = function(characterId) {
    
    let characters = playGround.boards[this.id].characters.filter(function(v) {
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
Board.prototype.deployCharacter  = function(characterId) {
    
    let dogTag        = playGround.boards[this.id].getDogTag(characterId);
    let characterPawn = new Character(this.id, characterId, dogTag);
    playGround.boards[this.id].characters.push(characterPawn)
};
Board.prototype.destroyCharacter = function(characterId, dogTag) {
    
    let targetIndex = playGround.boards[this.id].characters.findIndex(function(v) {
        return (v.id === characterId) && (v.dogTag === dogTag)
    });
    $(playGround.boards[this.id].characters[targetIndex].dom).remove();
    playGround.boards[this.id].characters.splice(targetIndex, 1);
};

let playGround = {
        boards          : [],
        getActiveBoardId: function() {
            let activeBoard = $('.board.playground-front');
            if ($(activeBoard).length === 0) {
                return -1;
            }
            return $(activeBoard).attr('data-board-id');
        },
        popBoardUp      : function(boardId) {
            if (playGround.boards.length === 0) {
                return false;
            }
        
            playGround.boards.forEach(function(v) {
                if (v.id === boardId) {
                    $(v.dom).css('z-index', '10')
                        .addClass('playground-front');
                } else {
                    $(v.dom).css('z-index', '0')
                        .removeClass('playground-front');
                }
            });
    },
        deployBoard     : function() {
            let maxId = 0;
            if (playGround.boards.length !== 0) {
                maxId = playGround.boards.reduce(function(a, b) {
                        return (a.id >= b.id) ? a : b;
                    }).id + 1;
            }
        
            let board = new Board(maxId);
            playGround.boards.push(board);
            $('#addBoard')
                .before(
                    $(`<span></span>`,
                        {
                            "addClass"               : 'ml-3',
                            "data-board-indicator-id": maxId
                        })
                        .append(
                            $(`<i>${maxId}</i>`).addClass('fa fa-toggle-right')
                        ));
            playGround.popBoardUp(maxId);
        },
        destroyBoard    : function(id) {
            let targetIndex = playGround.boards.findIndex(function(v) {
                return v.id === id;
            });
            
            /*
             * Board上のすべての駒オブジェクトを削除
             */
            
            
            $(playGround.boards[targetIndex].dom).remove();
            playGround.boards.splice(targetIndex, 1);
            $(`span[data-board-indicator-id=${id}]`).remove();
        }
    }
;

let characterGrid = {
    header      : [],
    createHeader: function() {
        let h = [];
        characterGrid.data.forEach(function(v) {
            Object.keys(v).forEach(function(k) {
                if (h.indexOf(k) === -1) {
                    h.push(k);
                }
            })
        });

        characterGrid.header = h;
    },
    data        : [],
    deployPiece : function(characterId, css, options) {
        let activeBoardId = playGround.getActiveBoardId();
        if (typeof activeBoardId === 'undefined') {
            console.warn('選択中のBoardが存在しない'); // @DELETEME
            return false;
        }
        playGround.boards[activeBoardId].deployCharacter(characterId)
    },
    /*
     * ヘッダーを使用してデータ部を正規化
     */
    initData    : function() {
        characterGrid.header.forEach(function(v) {
            characterGrid.data.forEach(function(w, i) {
                if (!characterGrid.data[i].hasOwnProperty(v)) {
                    /*
                     * 各レコードにチェック列がない場合はboolで初期化
                     */
                    characterGrid.data[i][v] = (v.substring(0, 1) === '*') ? false : null;
                }
            });
        });
        characterGrid.data.forEach(function(v, i) {
            Object.keys(v).forEach(function(p) {
                if (p.substring(0, 1) === '*') {
                    if (typeof characterGrid.data[i][p] !== 'boolean' && characterGrid.data[i][p] !== 'true' && characterGrid.data[i][p] !== 'false') {
                        /*
                         * hotのcheckboxが読み込めないデータ形式はfalseへ変換
                         */
                        characterGrid.data[i][p] = false;
                    }
                    characterGrid.data[i][p] = (characterGrid.data[i][p] === 'true') ? true : characterGrid.data[i][p];
                    characterGrid.data[i][p] = (characterGrid.data[i][p] === 'false') ? false : characterGrid.data[i][p];
                }
            });
        });
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
                window.setTimeout(function() {
                    characterGrid.pushData();
                }, gridThrottle.delay);
                gridThrottle.queued = true;
            }
            return false;
        }
    
        let _data = characterGrid.data;
    
        callApiOnAjax(`/characters/0`, 'patch', {
            data: {
                data   : _data,
                _roomId: 0
            }
        })
            .done(function(r, code) {
                /*
                 * キューから削除
                 */
                gridThrottle.queued = false;

                /*
                 * 変更をbroadcastで通知
                 */
                socket.emit('reloadRequest',
                    {key: 'characters', from: socket.id})
            })
            .fail(function(r, code) {
                /*
                 * 失敗した場合は再度キューに入れる
                 */
                console.log('Data push failed... retry in 3 sec.'); // @DELETEME
                gridThrottle.queued = false;
                characterGrid.pushData();
            }).always(function() {

        })
    },
    /*
     * DBのデータを使用してhot再生成
     */
    reloadHot   : function() {
        callApiOnAjax('/characters/0', 'get')
            .done(function(r) {
                hot.destroy();
                characterGrid.data = r;
                characterGrid.makeHot();
            })
            .fail(function(r, code) {
                console.error(r); // @DELETEME
                console.error(code); // @DELETEME
            });
    },
    /*
     * ローカルのデータを使用してhot再生成
     */
    recreateHot : function() {
        hot.destroy();
        characterGrid.makeHot();
    },
    /*
     * ローカルのデータを使用してhot生成
     */
    makeHot     : function() {

        characterGrid.createHeader();
        characterGrid.initData();

        console.log('makehot'); // @DELETEME
        hot = new Handsontable(
            document.getElementById('resource-grid'), {
                colHeaders    : function(col) {
                    /*
                     * チェック列の場合は先頭のアスタリスクを取る
                     */
                    return characterGrid.header[col].replace('*', '');
                },
                cells         : function(row, col, prop) {
                    let cellProperty = {};
                    if (col === 0 || prop === 'id') {
                        cellProperty.readOnly = true;
                    }

                    return cellProperty;
                },
                columns       : function(column) {
                    let columnProperty = {};
                    /*
                     * カラム名がアスタリスクで始まる場合はチェックボックス
                     */
                    if ((characterGrid.header[column] || '').substring(0, 1) === '*') {
                        columnProperty.type = 'checkbox';
                    }
                    columnProperty.data = characterGrid.header[column];

                    return columnProperty
                },
                data              : characterGrid.data,
                manualColumnMove  : false,
                columnSorting     : true,
                sortIndicator     : true,
                manualColumnResize: true,
                autoRowSize       : false,
                autoColumnSize    : true,
                rowHeights        : 22,
                stretchH          : 'none',
                manualRowResize   : false,
                afterCreateRow    : function(i, n, source) {
                    if (source.indexOf('rowBelow') !== -1) {
                        /*
                         * 新しいidを採番して指定する
                         */
                        let _id = (characterGrid.data.reduce(function(_a, _b) {
                            let a = parseInt((_a.id || 0), 10);
                            let b = parseInt((_b.id || 0), 10);
                            return (a > b) ? _a : _b;
                        }).id || 0);

                        characterGrid.data[i]['id'] = parseInt(_id, 10) + 1;
                    }
                },
                afterRemoveRow: function(i, n, source) {
                    if (characterGrid.data.length === 0) {
                        characterGrid.data.push({id: 0});
                    }
                },
                beforeChange  : function(changes, source) {
                    changes.forEach(function(v, i) {
                        /*
                         * 変更内容が同じ場合は棄却
                         */
                        if (v[2] === v[3]) {
                            changes[i] = null;
                        }
                    })
                },
                afterChange   : function(changes) {
                    if (changes === null || changes.length === 0) {
                        return false;
                    }
                    console.log(changes);
                    characterGrid.pushData();
                },
                contextMenu   : {
                    items   : {
                        'deployCharacter': {
                            name    : 'コマを作成する',
                            disabled: function() {
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
                                return (hot.getSelected()[0] !== hot.getSelected()[2]);
                            }
                        },
                        'remove_row'     : {
                            name    : 'キャラクターを削除',
                            disabled: function() {
                                /*
                                 * 全員を削除することはできない
                                 */
                                return ((Math.abs(hot.getSelected()[0] - hot.getSelected()[2]) + 1) === hot.countRows())
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
                                // 1行目(id)、2行目(NAME)は消せない
                                return ((hot.getSelected()[1] || 0) <= 1 || (hot.getSelected()[3] || 0) <= 1)
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
                    callback: function(key, options) {
                        switch (key) {
                            case 'deployCharacter':
                                /*
                                 * オブジェクトが持つ情報:
                                 *  character.id
                                 *  character.roomId
                                 *  通し番号
                                 */
                                let _vRowStart = options.start.row;
                                let _vRowEnd   = options.end.row;
        
                                let vRowStart = (_vRowStart <= _vRowEnd) ? _vRowStart : _vRowEnd;
                                let vRowEnd   = (_vRowStart <= _vRowEnd) ? _vRowEnd : _vRowStart;
                                for (let i = vRowStart; i <= vRowEnd; i++) {
                                    let row = characterGrid.data[i];
            
                                    characterGrid.deployPiece(row.id, 0);
                                }
                                break;
                            case 'row_below':
                                characterGrid.pushData();
                                break;
                            case 'duplicateRow':
                                let row  = hot.toPhysicalRow(options.start.row);
                                let copy = {};
                                
                                Object.keys(characterGrid.data.slice(row)[0]).forEach(function(v,i){
                                    copy[v] = characterGrid.data[row][v];
                                });
                                /*
                                 * 新しいidを採番して指定する
                                 */
                                copy.id = parseInt(characterGrid.data.reduce(function(_a, _b) {
                                            let a = parseInt((_a.id || 0), 10);
                                            let b = parseInt((_b.id || 0), 10);
                                            return (a > b) ? _a : _b;
                                        }).id || 0, 10) + 1;
        
                                characterGrid.data.push(copy);
        
                                characterGrid.recreateHot();
                                characterGrid.pushData();
                                break;
                                
                            case 'remove_row':
                                characterGrid.pushData();
                                break;
                            case 'addParameter':
                                let alertMsg  =
                                        '追加するパラメータ名を10文字以内で指定してください。\n' +
                                        'チェックボックスを作る場合は先頭に*を付けてください。\n' +
                                        '半角カンマで区切ると、複数行を一気に作成できます。';
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
                                 * 半角カンマでパースしてバリデーション
                                 */
                                let paramArray = addTarget.split(',')
                                    .map(function(v) {
                                        return v.trim().replace(/^[＊]/, '*')
                                    }).filter(function(v) {
                                        return !(v === '')
                                    });

                                let error = paramArray.some(function(v) {
                                    if (characterGrid.header.indexOf(v) !== -1) {
                                        // 既に存在する名前もNG
                                        window.alert('『' + v + '』' + 'は既に存在するみたいです……');
                                        return true;
                                    }
                                    if (['_id', '_roomId'].indexOf(v) !== -1) {
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
                                        console.info(); // @DELETEME
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
                                paramArray.forEach(function(v) {
                                    characterGrid.header.push(v);
                                });
                                // データ部をヘッダに合わせて正規化
                                characterGrid.initData();
                                // hot再生成
                                characterGrid.recreateHot();
                                // 変更を通知
                                characterGrid.pushData();
                                return false;
                                break;
                            case 'removeParameter':
                                let start     = (options.start.col <= options.end.col) ? options.start.col : options.end.col;
                                let end       = (options.start.col <= options.end.col) ? options.end.col : options.start.col;
                                let colNames  = characterGrid.header.slice(start, end + 1);
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
                                characterGrid.header.splice(start, (end - start + 1));
                                characterGrid.data.forEach(function(v) {
                                    colNames.forEach(function(w) {
                                        if (v.hasOwnProperty(w)) {
                                            delete v[w];
                                        }
                                    })
                                });

                                hot.loadData(characterGrid.data);
                                characterGrid.pushData();
                                break;
                            case 'forceReload':
                                characterGrid.reloadHot();
                                break;
                            case 'pushData':
                                characterGrid.pushData();
                                break;
                            default:
                                console.error('該当するコンテキストメニューがありません');
                                break;
                        }
                    }
                }
        
            }
        );
        $('#resource-grid').height('100%');
    },
};

let imageManager = {
    commonTag        : [],
    initCommonTag    : function() {
        let tagHolder = $('#imageTags');
        $(tagHolder).empty();
        callApiOnAjax(`/images/tags`, 'get')
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
        imageManager.commonTag = [];
        $('[name=commonTags]:checked').each(function(i, v) {
            imageManager.commonTag.push($(v).attr('data-imagetag'))
        });
    },
    setTagState      : function() {
        imageManager.images.forEach(function(v, i) {
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
        console.log('initImages'); // @DELETEME
        imageManager.images = [];
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
        imageManager.initImages();
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
            
            fr.onload = function(e) {
                /*
                 * ファイルピッカーがファイルを読み込んだ時の処理
                 */
                let img = new Image();
                
                img.src    = fr.result;
                img.onload = function() {
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
                    imageManager.images.push({
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
                    $(`i[data-listindex=\"${i}\"]`).on('click', function() {
                        let li     = $(`li[data-listindex=\"${i}\"]`);
                        let ignore = ($(li).attr('data-ignore') === 'false' ? 'true' : 'false');
                        
                        $(li).attr('data-ignore', ignore)
                            .css('opacity', (ignore === 'false' ? '1.0' : '0.3'));
                        imageManager.images.map(function(v) {
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
                }
                ;
            }
            
        }
        if (extensionError) {
            console.error('extension error!'); // @DELETEME
        }
    },
    upload           : function() {
        imageManager.setCommonTagState();
        imageManager.setTagState();
        
        /*
         * 送信無視(ゴミ箱アイコン)のデータを無視してアップロード
         */
        imageManager.images
            .filter(function(v) {
                console.info('filter'); // @DELETEME
                console.info(v.ignore !== 'true'); // @DELETEME
                return v.ignore !== 'true'
            })
            .forEach(function(v) {
                /*
                 * 共通タグと個別タグをマージ
                 */
                v.tags       = v.tags
                    .concat(imageManager.commonTag)
                    .filter(function(v, i, a) {
                        return a.indexOf(v) === i
                    });
                let sendData = {
                    data: {
                        images: v,
                    }
                };
                callApiOnAjax('/images', 'post', sendData)
                    .done(function(r, status) {
                        console.info(r); // @DELETEME
                        $('#pickedImage').empty();
                    })
                    .fail(function(r, status) {
                        console.info(r); // @DELETEME
                    })
                    .always(function(r, status) {
                    
                    });
            });
        imageManager.initImages();
    },
};

// socket受信時の処理
socket.on('logIn', function(container) {
    // ログイン通知
    if (socket.id === container.socketId) {
        // 自分の場合
        $('#u').val('Anonymous');
        textForm.insertMessages({msg: 'ログインしました。 id = ' + socket.id});
        return false;
    }
    textForm.insertMessages({msg: container.socketId + ' がログインしました。'});
});
socket.on('chatMessage', function(container) {
    textForm.insertMessages(container.data)
});
socket.on('changeAlias', function(data) {
    textForm.insertMessages(data)
});
socket.on('logOut', function(data) {
    textForm.fukidashi.clear();
    textForm.insertMessages(data)
});
socket.on('onType', function(container) {
    textForm.fukidashi.add(container);
});
socket.on('reloadRequest', function(data) {
    if (data.from === socket.id) {
        return false;
    }
    switch (data.key) {
        case 'characters':
            characterGrid.reloadHot();
            break;
        default:
            break;
    }
});

let textForm = {
    container     : {
        socketId: '',
        data    : {
            newName   : '',
            alias     : '',
            text      : '',
            postScript: [],
        },
        update  : function() {
            this.socketId        = socket.id;
            this.data            = {};
            this.data.alias      = htmlEscape($('#u').val());
            this.data.text       = $('#m').val();
            this.data.postScript = [];
        }
    },
    fukidashi     : {
        /**
         * [
         *   {
         *     socketId
         *     alias
         *     thought
         *   },...
         * ]
         */
        list  : [],
        add   : function(container) {
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
        clear : function() {
            this.list = [];
            this.update();
        },
        update: function() {
            if (this.list.length === 0) {
                console.log('no one typing.'); // @DELETEME
                $('#t').find('> tbody').empty();
            } else {
                $('#t').find('> tbody').html(textForm.fukidashi.list.map(function(v) {
                    return (socket.id !== v.socketId) ? `<tr><td>${v.alias}</td><td style="white-space: nowrap;">${v.thought}</td></tr>` : '';
                }).join())
            }
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
            textForm.execCommand();
        } else {
            textForm.chat();
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
        console.log('textForm.chat'); // @DELETEME
    
        let text = this.getData('text');

        // 空文字のチャットは送信しない(スペースのみはOK)
        if (text === '') {
            console.log('blank chat ignored.');
            return false;
        }

        // 置換文字列を解決して、データコンテナにpostScript要素を作成
        execPlaceholder(text);

        // HTMLエスケープ
        let _escaped = htmlEscape(text);

        this.setData('text', _escaped);

        // 送信
        socket.emit('chatMessage', this.container);

        return false;
    },
    changeAlias   : function() {
        // ユーザ名の変更を通知し、グローバルのユーザ名を変更
        console.log('changeAlias'); // @DELETEME

        let newAlias = $('#u').val().trim();
        let alias    = this.getData('alias');
        if (newAlias === '') {
            // ユーザ名に空文字は設定できない
            $('#u').val(alias);
            return false;
        }

        if (alias !== newAlias) {
            console.log(alias + ' changed to ' + newAlias); // @DELETEME
            socket.emit('changeAlias', {alias: alias, newAlias: newAlias});
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
        textForm.container.update();
    
        textForm.container.data.text = (typeof text === 'undefined')
            ? textForm.container.data.text
            : text;

        // スラッシュコマンドの場合
        let rawText = textForm.getData('text');
        command.parse(rawText.trim());
        if (command.isSpell === true) {
            // commandへ入力値を格納し、吹き出しをクリアする
            textForm.setData('thought', '');
        } else {
            let thought = rawText.trim().substr(0, FUKIDASHI_MAX_LENGTH) + (rawText.length > FUKIDASHI_MAX_LENGTH ? '...' : '');
            textForm.setData('thought', thought);
            if (textForm.getData('thought').length >= (FUKIDASHI_MAX_LENGTH + 10)) {
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
                window.setTimeout(function() {
                    textForm.onType();
                }, fukidashiThrottle.delay);
                fukidashiThrottle.queued = true;
            }
            return false;
        }
        socket.emit('onType', this.container);
        fukidashiThrottle.queued = false;
    },
    insertMessages: (data)=> {
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
            .filter((v)=> {
                return v !== '';
            })
            .forEach((v)=> {
                if (v.match(/^[^-][\w\d]*/) !== null) {
                    command.arg.push(v);
                    return false;
                }
                if (v.match(/^-/) !== null) {
                    command.options.push(v.replace(/^-/, ''));
                    return false;
                }
            });
    },
    exec    : function() {
        let spell = spellBook.find(this.spell);
        if (spell === null) {
            textForm.insertMessages({msg: '無効なコマンドです。:' + command.spell});
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
        spellBook.spell.some((v)=> {
            if (v.re(spell) === true) {
                result = v;
                return true;
            }
            return false;
        });
        return result;
    },
    cast : (spellName)=> {
        console.log('exec: ' + spellName); // @DELETEME

    },
    /**
     * @param action 'add'
     */
    edit : (action)=> {

    }
};

function Spell(name, pattern, logic) {
    this.setName(name);
    this.setPattern(pattern);
    this.setLogic(logic);
    this.publish();
};
Spell.prototype = {

    setName(_name){
        this.name = _name;
    },
    getName() {
        return this.name;
    },
    setPattern(_pattern) {
        this.pattern = _pattern;
    },
    getPattern(){
        return this.pattern;
    },
    setLogic(_logic){
        this.logic = _logic;
    },
    getLogic(){
        return this.logic;
    },
    re(subject){
        let regexp = new RegExp(this.getPattern());
        return regexp.test(subject);
    },
    publish(){
        spellBook.spell.push(this);
    },
    cast(spellName, arg, options, rawSpell){
        this.logic(spellName, arg, options, rawSpell);
    },
    // ダイスクラス
    makeDice(faces){
        return new Dice(faces);
    },
    // spell内でのユーティリティメソッド
    disp(){
    },
    // tellに近い……？
    send(){
    },
    // Diceクラスのメソッドとして実装する？
    xDy(){
    },
    ccb(){
    },
    // evalのラッパー。
    _eval(){
    },
};

function Dice(faces) {
    this.faces = faces;
}
Dice.prototype = {};

/*
 * 数式処理を行うかの判定:
 * 1. 数字、四則演算+余算、半角括弧、等号(==)、否定等号(!=)、不等号(<,>,<=,>=)、ccb、d (ignore case)
 *  /^([\d-\+\*\/\%\(\)]|ccb|\d+d\d+)*$/i  @WIP
 * 方針:
 * 1. 予約演算子を置換する(有限回数ループ)
 *   1. xDy、ccb
 * 1. 正規表現でバリデートして_evalに突っ込む
 * 1. 表示する
 *   1. 処理する文字列(予約演算子置換前)
 *   1. 計算する数式  (予約演算子置換後)
 *   1. 結果
 */
let formula = new Spell('formula', /^aaa$/i, () => {
    console.info(this); // @DELETEME

});

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
            autoOpen     : false,
            resizable    : true,
            position     : {at: "left top"},
            title        : 'キャラクタ',
            classes      : {
                "ui-dialog": "character"
            },
            buttons      : [],
            closeOnEscape: false,
            minHeight    : 200,
            minWidth     : 400,
            create       : () => {
                killSpace('#characters');
                hot.render();
            },
            resizeStop   : () => {
                killSpace('#characters');
                hot.render();
            },
            dragStop     : (e, ui) => {
                killSpace('#characters');
                keepInWindow(ui, '#characters');
                hot.render();
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
                    console.log('onchange'); // @DELETEME
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
    
        $('.board').draggable({
            grid: [5, 5]
        });
    
        $('.map').draggable({
            grid: [5, 5]
        }).on('contextmenu', function(e) {
            let menuProperties = {
                items   : [
                    {
                        key : 'setImage',
                        name: 'このマップに画像を割り当てる'
                    }
                ],
                callback: function(e, key) {
                
                }
            };
            contextMenu(e, menuProperties);
            e.stopPropagation();
        });
    
        $('.character').draggable({
            grid: [5, 5]
        }).on('contextmenu', function(e) {
            let menuProperties = {
                items   : [
                    {
                        key : 'setImage',
                        name: 'このキャラクタに画像を割り当てる'
                    }
                ],
                callback: function(e, key) {
                }
            };
            contextMenu(e, menuProperties);
            e.stopPropagation();
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
                    p.push('  ccb[' + index + ']: ' + ccb + (flags === '' ? '' : '(' + flags + ')' ));

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
                            let a = eval(v) === null;
    
                            return a;
                        } catch (e) {
                            // evalでxDyの引数が計算不可能だった場合
                            return -1;
                        }
                    });

                    if (args.some((v)=> {
                            return v === -1
                        })) {
                        // evalで置換に失敗していたパターン
                        return 'ERROR';
                    }
                    let dies = [];

                    for (i = 0; i < args[0]; i++) {
                        dies.push(Math.floor(Math.random() * args[1]) + 1);
                    }
                    let answer = dies.reduce((x, y)=> {
                        return x + y;
                    });

                    p.push('  xDy[' + index + ']: ' + args[0] + 'D' + args[1] + ' -> [' + dies + '] -> ' + answer);
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
                // console.warn(e);
                return 'SYNTAX ERROR!';
            }
        }(exec);
        p.push('  ∴' + exec + ' -> ' + r);
        postscript.push(p);
    });
    textForm.setData('postscript', postscript);
}

/**
 * 右クリックメニューの制御
 */
function contextMenu(e, menuProperties) {
    
    if (!menuProperties.hasOwnProperty('items')) {
        console.warn('set items'); // @DELETEME
        return false;
    }
    if (!menuProperties.hasOwnProperty('callback')) {
        console.warn('set callback'); // @DELETEME
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
        console.log('window-click'); // @DELETEME
        $(contextMenu)
            .css('top', `-1000px`)
            .css('left', `-1000px`);
        $(window).off('click');
    });
    
    e.preventDefault();
}