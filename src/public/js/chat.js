"use strict";

// socket.io connection

var socket = io('http://192.168.99.100:3000');
var chatMessage = '';

// socket受信時の処理
socket.on('logIn', function(container) {
    if (socket.id === container.socketId) {
        $('#u').val(socket.id);
        textForm.insertMessages('you logged in as ' + socket.id);
        return false;
    }
    textForm.insertMessages('someone logged in as ' + container.socketId);
});
socket.on('chatMessage', function(container) {
    textForm.insertMessages(container.data.msg)
});
socket.on('userNameChange', function(data) {
    textForm.insertMessages(data.msg)
});
socket.on('logOut', function(data) {
    textForm.fukidashi.clear();
    textForm.insertMessages(data)
});
socket.on('onType', function(container) {
    textForm.fukidashi.add(container);
});

var textForm = {
    container: {
        socketId: '',
        data: {
            newName: '',
            name: '',
            text: '',
        },
        update: function() {
            this.socketId = socket.id;
            this.data = {};
            this.data.name = $('#u').val();
            this.data.text = $('#m').val();
        }
    },
    fukidashi: {
        /**
         * [
         *   {
         *     socketId
         *     name
         *     thought
         *   },...
         * ]
         */
        list: [],
        add: function(container) {
            console.log('fukidashi.add'); // @DELETEME
            this.list = this.list.filter(function(v, i) {
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
        clear: function() {
            this.list = [];
            this.update();
        },
        update: function() {
            if (this.list.length === 0) {
                console.log('no one typing.'); // @DELETEME
                $('span#t').text('');
            } else {
                var text = '';
                this.list.forEach(function(v, i) {
                    if (v === undefined) return true;
                    text += v.name + ': ' + v.thought + ',';
                });
                $('span#t').text(text);
            }
        }
    },
    getData: function(key) {
        // 汎用getter
        if (!this.container.data.hasOwnProperty(key)) {
            return undefined;
        }
        return this.container.data[key];

    },
    setData: function(key, value) {
        // 汎用setter
        console.log(value + ' -> ' + key); // @DELETEME
        this.container.data[key] = value;
        return this.getData(key);
    },
    chat: function() {
        console.log('textForm.chat'); // @DELETEME

        // データコンテナを現在の状態で更新
        this.container.update();

        // 送信
        socket.emit('chatMessage', this.container);

        // チャットメッセージを空にして吹き出しを送信(吹き出しクリア)
        $('#m').val('');
        this.onType();

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
    onType: function() {
        console.log('onType'); // @DELETEME

        textForm.container.update();
        var thought =
            textForm.getData('text').trim().substr(0, 10)
            + (textForm.getData('text').length > 10 ? '...' : '');
        textForm.setData('thought', thought);
        socket.emit('onType', this.container);
    },
    insertMessages: function(text) {
        $('#messages').append($('<li>').text(text));
        var messagesScroll = $('#messages-scroll');
        $(messagesScroll).scrollTop($(messagesScroll)[0].scrollHeight);
    },
};


$(window).ready(function() {

    // データコンテナの初期化
    textForm.container.update();

    // typing……の判別用に、チャットバーにフォーカスが当たったタイミングの入力内容を保持する
    $('#m')
        .on('change', function() {
            textForm.onType();
        })
        .on('keypress', function(e) {
            if (e.keyCode === 13 || e.key === 'Enter') {
                textForm.chat();
                return false;
            }
            textForm.onType();
        })
        .on('keyup', function() {
            textForm.onType();
        })
        .on('blur', function() {
            textForm.onType();
    });

    $('#u')
        .on('blur', function() {
            textForm.changeUserName();
        })
        .on('keypress', function(e) {
            if (e.keyCode === 13 || e.key === 'Enter') {
                $('#m').focus();
            }
        });

    $('#s')
        .on('click', function() {
            textForm.chat();
        });

    $(window)
        .on('keydown keyup keypress', function(e) {

            // alt(option) キーでウィンドウの表示切替
            if (e.keyCode === 18 || e.key === 'Alt') {
                e.preventDefault();
                if (e.type === 'keyup' || e.type === 'keypress') {
                    // デフォルトの挙動をさせない
                    $('#tools').toggle('d-none');
                    $('#chat').toggle('d-none');
                }
            }
        })
});





