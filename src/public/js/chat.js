"use strict";

// socket.io connection

var socket        = io('http://192.168.99.100:3000');
var chatMessage   = '';
var hot           = undefined;
var characterGrid = {
    header      : [],
    createHeader: function() {
        var h = [];
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
                    characterGrid.data[i][v] = (v.substring(0, 1) === '*') ? 'false' : null;
                }
            });
        });
        characterGrid.data.forEach(function(v, i) {
            Object.keys(v).forEach(function(p) {
                console.info(p); // @DELETEME
                console.info(typeof characterGrid.data[i][p]); // @DELETEME
                if (p.substring(0, 1) === '*') {
                    if (typeof characterGrid.data[i][p] === 'undefined' || characterGrid.data[i][p] === null || characterGrid.data[i][p] === '')
                        /*
                         * hotのcheckboxが読み込めないデータ形式はfalseへ変換
                         */
                        characterGrid.data[i][p] = 'false';
                }
            });
        });
    },
    pushData    : function() {
        var _data = characterGrid.data;

        callApiOnAjax('/characters/0', 'patch', {
            data: {
                data   : _data,
                _roomId: 0
            }
        })
            .done(function(r, code) {
                
            })
            .fail(function(r, code) {
                
            }).always(function() {
            
        })
    },
    /*
     * DBのデータを使用してhot再生成
     */
    reloadHot   : function() {
        callApiOnAjax('/characters/0', 'get')
            .done(function(r, code) {
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
                colHeaders        : function(col) {
                    /*
                     * チェック列の場合は先頭のアスタリスクを取る
                     */
                    return characterGrid.header[col].replace('*', '');
                },
                cells             : function(row, col, prop) {
                    var cellProperty = {};
                    if (col === 0 || prop === 'id') {
                        cellProperty.readOnly = true;
                    }

                    return cellProperty;
                },
                columns           : function(column) {
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
                manualRowResize   : true,
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
                afterRemoveRow    : function(i, n, source) {
                    if (characterGrid.data.length === 0) {
                        characterGrid.data.push({id: 0});
                    }
                },
                contextMenu       : {
                    items   : {
                        /*
                         * defaults @SEE http://docs.handsontable.com/0.29.2/demo-context-menu.html
                         */
                        'row_below'  : {
                            name: 'キャラクターを追加'
                        },
                        'remove_row' : {
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
                        'forceReload': {
                            name: 'リロードする',
                        },
                        /*
                         * コレクションの内容を、現在のテーブルデータで上書きする
                         */
                        'pushData'   : {
                            name: 'この内容で上書き',
                        },
                    },
                    callback: function(key, options) {
                        switch (key) {
                            case 'row_below':
                            case 'remove_row':
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

var textForm = {
    container  : {
        socketId: '',
        data: {
            newName   : '',
            alias     : '',
            text      : '',
            postScript: [],
        },
        update: function() {
            this.socketId        = socket.id;
            this.data            = {};
            this.data.alias      = $('#u').val();
            this.data.text       = $('#m').val();
            this.data.postScript = [];
        }
    },
    fukidashi  : {
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
            this.list = this.list.filter((v, i)=> {
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
                $('span#t').text('');
            } else {
                var text = '';
                this.list.forEach((v, i)=> {
                    if (v === undefined) return true;
                    text += v.alias + ': ' + v.thought + ',';
                });
                $('span#t').text(text);
            }
        }
    },
    getData    : function(key) {
        // 汎用getter
        if (!this.container.data.hasOwnProperty(key)) {
            return undefined;
        }
        return this.container.data[key];

    },
    setData    : function(key, value) {
        // 汎用setter
        this.container.data[key] = value;
        return this.getData(key);
    },
    ret        : function() {
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
    execCommand: function() {
        command.exec();
    },
    chat       : function() {
        console.log('textForm.chat'); // @DELETEME

        var text = this.getData('text');

        // 空文字のチャットは送信しない(スペースのみはOK)
        if (text === '') {
            console.log('blank chat ignored.');
            return false;
        }

        // 置換文字列を解決して、データコンテナにpostScript要素を作成
        execPlaceholder(text);

        // HTMLエスケープ
        var _escaped = htmlEscape(text);

        this.setData('text', _escaped);

        // 送信
        socket.emit('chatMessage', this.container);

        return false;
    },
    changeAlias: function() {
        // ユーザ名の変更を通知し、グローバルのユーザ名を変更
        console.log('changeAlias'); // @DELETEME

        var newAlias = $('#u').val().trim();
        var alias    = this.getData('alias');
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
    onType     : function() {

        // チャットUIの入力値を取り込み
        textForm.container.update();

        // スラッシュコマンドの場合
        var rawText = textForm.getData('text');
        command.parse(rawText.trim());
        if (command.isSpell === true) {
            // commandへ入力値を格納し、吹き出しをクリアする
            textForm.setData('thought', '');
        } else {
            var thought = rawText.trim().substr(0, 10) + (rawText.length > 10 ? '...' : '');
            textForm.setData('thought', thought);
        }

        socket.emit('onType', this.container);
    },
    insertMessages: (data)=> {
        var m = $('#messages');
        $(m).append($('<li class="">').html(data.msg));
        if (typeof data.postscript !== 'undefined' && data.postscript.length !== 0) {
            data.postscript.forEach(function(_p) {
                _p.forEach(function(v) {
                    $(m).append($('<li class="text-muted">').text(v));
                })
            });
        }

        var messagesScroll = $('#messages-scroll');
        $(messagesScroll).scrollTop($(messagesScroll)[0].scrollHeight);
    },
};

var command = {
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

        var result = rawSpell.match(/^\/([^ ]+)/);

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
        var spell = spellBook.find(this.spell);
        if (spell === null) {
            textForm.insertMessages({msg: '無効なコマンドです。:' + command.spell});
            return false;
        }
        spell.cast(this.spell, this.arg, this.options, this.rawSpell);
    },
};

var spellBook = {
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
        var result = null;
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
        var regexp = new RegExp(this.getPattern());
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

// コマンドライン群の読み込み
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
var formula = new Spell('formula', /^aaa$/i, ()=> {
    console.info(this); // @DELETEME

});

$(window).ready(()=> {

    // データコンテナの初期化
    textForm.container.update();

    // typing……の判別用に、チャットバーにフォーカスが当たったタイミングの入力内容を保持する
    $('#m')
        .on('change', ()=> {
            textForm.onType();
        })
        .on('keypress', (e)=> {
            if (e.keyCode === 13 || e.key === 'Enter') {
                textForm.ret();
                return false;
            }
            textForm.onType();
        })
        .on('keyup', ()=> {
            textForm.onType();
        })
        .on('blur', ()=> {
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
        .on('blur', ()=> {
            textForm.changeAlias();
        })
        .on('keypress', (e)=> {
            if (e.keyCode === 13 || e.key === 'Enter') {
                $('#m').focus();
            }
        });

    $(window)
        .on('keydown keyup keypress', (e)=> {

            // // alt(option) キーでウィンドウの表示切替
            // if (e.keyCode === 18 || e.key === 'Alt') {
            //     e.preventDefault();
            //     if (e.type === 'keyup' || e.type === 'keypress') {
            //         // デフォルトの挙動をさせない
            //         $('#tools').toggle('d-none');
            //         $('#chat').toggle('d-none');
            //     }
            // }
        })
        .on('wheel', (e)=> {

            //
            // console.info(e); // @DELETEME
        })
    ;
    
    
    characterGrid.makeHot();
    characterGrid.reloadHot();
    pop();

});

/**
 * ccb、xDy、大括弧で括られた文字列を計算する。
 * その計算過程、計算結果を配列形式で返却する。
 *
 * execPlaceholder('可能:[2D6+2*(2Dccb+ccb)] シンタックスエラー[ccb++ccb] Bool[1==1>=ccb<=1]')
 *
 */
function execPlaceholder(text) {

    var postscript = [];

    // 大括弧でパースする
    var match = text.match(/\[([\s\d\+\-\*\/%\(\)<>=d]|ccb)+]/ig);
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
                    var array = v.split(/d/i);
                    var args  = array.map(function(v, i) {
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
 * HTMLタグをエスケープする
 * @param _text
 * @returns {*}
 */
function htmlEscape(_text) {
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
}

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
function callApiOnAjax(endPoint, method, params) {
    
    // logging
    console.info('[ajax] start - ' + method + ' : ' + endPoint);
    
    // コールするエンドポイントのhost部分
    var __HOST_NAME = '';
    
    // レスポンスを格納
    var result;
    
    // 非同期通信に使用するデータ
    var ajax_obj = {};
    
    // url、http-methodをセット
    ajax_obj.url    = __HOST_NAME + endPoint;
    ajax_obj.method = method;
    
    // 非同期フラグはデフォルトでtrue
    ajax_obj.async = true;
    
    // csrfトークン埋め込み
    ajax_obj.headers = {
        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
    };
    
    if (typeof params != 'undefined' && params !== null && params !== '') {
        if (typeof params.data != 'undefined' && params.data !== null && params.data !== '') {
            // params.dataが値を持つ(以下に該当しない)場合はajax_objにセット
            // ｢未定義｣｢null｣｢空文字｣
            ajax_obj.data = params.data;
        }
    }
    
    // deferredオブジェクトを作成
    var d = new $.Deferred;
    
    console.log(ajax_obj);
    
    $.ajax(ajax_obj)
        .then(
            function(response, textStatus, jqXHR) {
                // logging
                console.info('  result: ' + textStatus);
                console.log(response);
                d.resolve(response, textStatus);
            },
            function(error, textStatus, jqXHR) {
                // 400, 500 など 200 以外
                
                // logging
                console.error('  result: ' + textStatus);
                console.error(error);
                
                d.reject(error, jqXHR.status);
            });
    
    return d.promise();
}

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
function getQueryString(object) {
    
    var query = '?';
    
    var keyStr = '';
    
    // 入力したobjectについて全てのkeyをループ
    for (var key in object) {
        
        keyStr = key.toString() + '=';
        
        // value が配列かどうか判定
        if (Array.isArray(object[key])) {
            
            // valueが配列の場合
            for (var i = 0; i < object[key].length; i++) {
                
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
            console.log('empty key detected and ignored: ' + key.toString());
            continue;
        }
        
        query += keyStr + '&';
    }
    
    // 末尾の半角アンパサンドを削除 key=x& -> key=x
    query = query.replace(/&$/, '');
    
    if (query === '?') console.log('no keys detected');
    console.info('generates uri: ' + query); //@DELETEM
    
    return query !== '?' ? query : '';
    
}

function pop() {
    $('#chat-base').dialog({
        autoOpen     : true,
        resizable    : true,
        position     : {at: "right bottom"},
        title        : 'Logs',
        classes      : {
            "ui-dialog": "highlight"
        },
        buttons      : [],
        closeOnEscape: false,
        minHeight    : 300,
        minWidth     : 600,
        resizeStart  : ()=> {
            $('#m')
                .autocomplete('destroy');
        },
        resizeStop   : ()=> {
            $('#m')
                .autocomplete({
                    source  : ['/ccb', '/1D100', '/1D20'],
                    position: {at: 'left bottom'},
                });
        },
        dragStart    : ()=> {
            $('#m')
                .autocomplete('destroy');
        },
        dragStop     : ()=> {
            $('#m')
                .autocomplete({
                    source  : ['/ccb', '/1D100', '/1D20'],
                    position: {at: 'left bottom'},
                });
        },
    });

    $('#tools-base').dialog({
        autoOpen     : true,
        resizable    : true,
        position     : {at: "left top"},
        title        : 'Tools',
        buttons      : [],
        closeOnEscape: false,
        minHeight    : 200,
        minWidth     : 400,
        create       : ()=> {
            $('#tools-base').width('100%')
        },
        resizeStop   : ()=> {
            $('#tools-base').width('100%')
        },
        dragStop     : ()=> {
            $('#tools-base').width('100%')
        }
    });

    $('.mat').draggable({
        grid: [5, 5]
    });

    $('.tit').draggable({
        grid: [5, 5]
    });

    $('.ui-dialog-titlebar-close').each((i, v)=> {
        $(v).css('display', 'none');
    });

    $('[role=dialog]').each((i, v)=> {
        $(v).css('position', 'fixed');
    });
}