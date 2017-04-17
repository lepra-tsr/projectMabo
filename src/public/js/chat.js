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

    var grabOffset = {x: 0, y: 0};
    var client = {x: 0, y: 0};
    $('[draggable=true]')
        .on('dragstart', function(e) {
            console.log('dragstart'); // @DELETEME
            var target = e.target;
            var w = e.target.parentNode;
            $(w).css('opacity', 0.2);
            switch ($(target).attr('data-dragtype')) {
                case 'move':
                    console.log('move!'); // @DELETEME
                    grabOffset.x = e.offsetX;
                    grabOffset.y = e.offsetY;
                    client.x = e.clientX;
                    client.Y = e.clientY;

                    e.originalEvent.dataTransfer.setData("text/plain", e.target.id);
                    e.originalEvent.dataTransfer.setDragImage(w, grabOffset.x, grabOffset.y);
                    break;
                case 'resize':
                    console.log('resize!'); // @DELETEME
                    // if resize できる then クロスヘア？
                    // else pointer->disabled
                    break;
            }
        })
        .on('drag', function(e) {
            if (e.clientY !== 0) {
                client.y = e.clientY;
            }
        })
        .on('dragend', function(e) {
            console.log('dragend'); // @DELETEME


            var target = e.target;
            var w = $(target).parent();

            var _x = parseInt($(w).css('left').replace(/px$/, ''), 10);
            var _y = parseInt($(w).css('top').replace(/px$/, ''), 10);
            var _w = parseInt($(w).css('width').replace(/px$/, ''), 10);
            var _h = parseInt($(w).css('height').replace(/px$/, ''), 10);

            var newX = e.clientX + 20;
            var newY = client.y - grabOffset.y + 10;

            switch ($(target).attr('data-dragtype')) {
                case 'move':
                    $(w)
                        .css('opacity', 1)
                        .css('left', newX)
                        .css('top', newY);
                    break;
                case 'resize':

                    if (newX < 100) {
                        newX = 100;
                    }
                    if (newY < 100) {
                        newY = 100;
                    }
                    $(w)
                        .css('opacity', 1)
                        .css('width', newX - _x)
                        .css('height', newY - _y + 10);
                    break;


            }

            // console.info('x: ' + e.clientX + ', y: ' + client.y + ', offsetY:' + grabOffset.y); // @DELETEME
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
        .on('wheel', function(e) {

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
            height: function() {
                return (status.length + 1) * 24;
            },
            data: status,
            colHeaders: function(col) {
                return ['#', 'name', 'DEX', 'HP/', 'HP', 'MP/', 'MP', 'SAN/', 'SAN'][col]
            },
            manualColumnMove: false,
            columnSorting: true,
            manualColumnResize: true,
            stretchH: 'all',
        }
    );
});





