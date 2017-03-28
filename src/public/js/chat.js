"use strict";

// socket.io connection

var socket = io('http://192.168.99.100:3000');
var chatMessage = '';
var focusOnChatBar = false;

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
    whoTypes: {
        name: [],
        update: function() {
            if (this.name.length === 0) {
                console.log('no one typing.'); // @DELETEME
                $('span#t').text('');
            } else {
                $('span#t').text('someone typing.');
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

        // チャットメッセージを空に
        $('input#m').val('');

        return false;
    },
    changeUserName: function() {
        // ユーザ名の変更を通知し、グローバルのユーザ名を変更
        console.info('changeUserName'); // @DELETEME

        this.setData('newName', $('#u').val());

        var name = this.getData('name');
        var newName = this.getData('newName');
        if (name !== newName) {
            console.info(name + ' changedTo ' + newName); // @DELETEME
            socket.emit('userNameChange', {name: name, newName: newName});
            this.setData('name', newName);
        }
    },
    onType: function() {
        // setTimeoutで1秒おきとかにしたい
        console.info('onType'); // @DELETEME

        textForm.container.update();
        var thought =
            textForm.getData('text').trim().substr(0, 10)
            + (textForm.getData('text').length > 10 ? '...' : '');
        textForm.setData('thought', thought);

        socket.emit('typingStatus', this.container);

    }
};


$(window).ready(function() {

    // データコンテナの初期化
    textForm.container.update();

    // typing……の判別用に、チャットバーにフォーカスが当たったタイミングの入力内容を保持する
    $('input#m').on('change', function() {
        console.info('change'); // @DELETEME
        textForm.onType();
    }).on('keypress', function() {
        console.info('keypress'); // @DELETEME
        textForm.onType();
    });

});

// socket受信時の処理
socket.on('logIn', function(data) {
    insertMessages(data.msg)
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
socket.on('typingStatus', function(container) {
    console.log(container); // @DELETEME
    console.log(container.data); // @DELETEME
    insertMessages(container.data.msg);
});

function insertMessages(data) {
    $('#messages').prepend($('<li>').text(data));
}




