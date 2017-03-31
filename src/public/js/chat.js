"use strict";

// socket.io connection

var socket = io('http://192.168.99.100:3000');
var chatMessage = '';

// socket受信時の処理
socket.on('logIn', function(container) {
    if (socket.id === container.socketId) {
        $('#u').val(socket.id);
        insertMessages('you logged in as ' + socket.id);
        return false;
    }
    insertMessages('someone logged in as ' + container.socketId);
});
socket.on('chatMessage', function(container) {
    insertMessages(container.data.msg)
});
socket.on('userNameChange', function(data) {
    insertMessages(data.msg)
});
socket.on('logOut', function(data) {
    insertMessages(data)
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
            var newList = this.list.filter(function(v, i) {
                if (v.socketId !== container.socketId) {
                    return v;
                }
            });

            this.list = newList;
            if (container.data.thought.trim() !== '') {
                this.list.push({
                    socketId: container.socketId,
                    name: container.data.name,
                    thought: container.data.thought
                });
            }
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
};


$(window).ready(function() {

    // データコンテナの初期化
    textForm.container.update();

    // typing……の判別用に、チャットバーにフォーカスが当たったタイミングの入力内容を保持する
    $('#m')
        .on('change', function() {
            console.log('change'); // @DELETEME
            textForm.onType();
        })
        .on('keypress', function(e) {
            console.log('keypress'); // @DELETEME
            if (e.keyCode === 13 || e.key === 'Enter') {
                textForm.chat();
                return false;
            }
            textForm.onType();
        })
        .on('keyup', function() {
            console.log('keyup'); // @DELETEME
            textForm.onType();
        })
        .on('blur', function() {
            console.log('blur'); // @DELETEME
            textForm.onType();
    });

});

function insertMessages(data) {
    $('#messages').prepend($('<li>').text(data));
}




