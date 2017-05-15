"use strict";

// socket.io connection

var socket = io('http://192.168.99.100:3000');
var chatMessage = '';

// socket受信時の処理
socket.on('logIn', function(container) {
    if (socket.id === container.socketId) {
        $('#u').val(socket.id);
        textForm.insertMessages({msg: 'you logged in as ' + socket.id});
        return false;
    }
    textForm.insertMessages({msg: 'someone logged in as ' + container.socketId});
});
socket.on('chatMessage', function(container) {
    textForm.insertMessages(container.data)
});
socket.on('userNameChange', function(data) {
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
    container     : {
        socketId: '',
        data: {
            newName   : '',
            name      : '',
            text      : '',
            postScript: [],
        },
        update: function() {
            this.socketId        = socket.id;
            this.data            = {};
            this.data.name       = $('#u').val();
            this.data.text       = $('#m').val();
            this.data.postScript = [];
        }
    },
    fukidashi     : {
        /**
         * [
         *   {
         *     socketId
         *     name
         *     thought
         *   },...
         * ]
         */
        list  : [],
        add   : function(container) {
            // console.log('fukidashi.add'); // @DELETEME
            this.list = this.list.filter((v, i)=> {
                if (v.socketId !== container.socketId) {
                    return v;
                }
            });

            if (container.data.thought.trim() !== '') {
                this.list.push({
                    socketId: container.socketId,
                    name: container.data.name,
                    thought: container.data.thought
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
                    text += v.name + ': ' + v.thought + ',';
                });
                $('span#t').text(text);
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
    changeUserName: function() {
        // ユーザ名の変更を通知し、グローバルのユーザ名を変更
        console.log('changeUserName'); // @DELETEME

        this.setData('newName', $('#u').val());

        var name = this.getData('name');
        var newName = this.getData('newName');
        if (name !== newName) {
            console.log(name + ' changedTo ' + newName); // @DELETEME
            socket.emit('userNameChange', {name: name, newName: newName});
            this.setData('name', newName);
        }
    },
    /**
     * チャットフォーム上でキー入力した際に発火する。
     * フォームから値を取得して変数へ格納、パースしてスラッシュコマンドか判別する。
     * スラッシュコマンドではない場合のみ、フキダシを行う。
     */
    onType        : function() {

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
        })
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
            textForm.changeUserName();
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

    var hotDom = document.getElementById('resource-grid');
    var status = [
        [1, 'Rock', 15, 10, 10, 11, 11, 60, 60],
        [2, 'Tina', 12, 10, 10, 11, 11, 60, 60],
        [3, 'Celice', 11, 10, 10, 11, 11, 60, 60],
        [4, 'Gau', 15, 10, 10, 11, 11, 60, 60],
        [5, 'Kien', 9, 10, 10, 11, 11, 60, 60]
    ];

    var hot = new Handsontable(
        hotDom, {
            height            : ()=> {
                return (status.length + 1) * 24;
            },
            data              : status,
            colHeaders        : (col)=> {
                return ['#', 'name', 'DEX', 'HP/', 'HP', 'MP/', 'MP', 'SAN/', 'SAN'][col]
            },
            manualColumnMove  : false,
            columnSorting     : true,
            manualColumnResize: true,
            stretchH          : 'all',
        }
    );

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
        position     : {at: "right top"},
        title        : 'Tools',
        buttons      : [],
        closeOnEscape: false,
        minHeight    : 200,
        minWidth     : 400,
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