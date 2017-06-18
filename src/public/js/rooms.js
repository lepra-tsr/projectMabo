"use strict";

let forms = {
    method  : '',
    info    : {
        'roomId'      : undefined,
        'scenarioName': undefined,
        'passPhrase'  : undefined,
        'synopsis'    : undefined
    },
    show    : function(method) {
        $('#createRoom').modal({show: true});
        forms.method = method;
    },
    call    : function() {
        $('button[name=createRoom]').attr('disabled', true);
        forms.getFromInput();
        callApiOnAjax('/rooms', forms.method, {data: forms.info})
            .done(function(r, status) {
                location.reload();
            })
            .fail(function(r) {
                forms.setError(r.responseText || '')
            })
            .always(function() {
                $('button[name=createRoom]').attr('disabled', false);
            })
    },
    setError: function(msg) {
        let alertDom = $('#modalErrorMsg');
        if (msg === '') {
            $(alertDom).addClass('d-none');
            return false;
        }
        $(alertDom).find('strong').text(msg);
        $(alertDom).removeClass('d-none');
    },
    getFromInput(selector){
        
        if (typeof selector === 'undefined') {
            ['scenarioName',
                'passPhrase',
                'synopsis'].forEach(function(v) {
                forms.getFromInput(v)
            });
            return false;
        }
        
        let error = false;
        let jq    = $(`#${selector}`);
        let val   = ($(jq).val() || '').trim();
        switch (selector) {
            case 'scenarioName':
                error = error || (val === '');
                error = error || (val.length > 40);
                break;
            case 'passPhrase':
                error = error || (val === '');
                error = error || !(/^[0-9a-z]{1,20}$/i.test(val));
                break;
            case 'synopsis':
                error     = error || (val.length > 1000);
                let count = $('#countSynopsis');
                $(count).text(val.length);
                if (val.length > 1000) {
                    $(count)
                        .addClass('text-danger')
                        .removeClass('text-muted');
                } else {
                    $(count)
                        .addClass('text-muted')
                        .removeClass('text-danger');
                }
                break;
        }
        forms.info[selector] = htmlEscape(val);
        
        if (error) {
            $(jq).parent().addClass('has-danger');
        } else {
            $(jq).parent().removeClass('has-danger');
        }
    }
};

let rooms = {
    list  : [],
    reload: function() {
        callApiOnAjax('/rooms', 'get', {})
            .done(function(r) {
                rooms.list = [];
                rooms.list = r;
                rooms.render();
            })
            .fail(function() {
            })
    },
    render: function() {
        let html = '';
        rooms.list.forEach(function(v) {
            html +=
                `<div class="mt-5 card col-md-8 offset-md-2 col-10 offset-1">` +
                `<div class="card-block">` +
                `  <h1 class="card-title">${v.name}</h1>` +
                `  <p class="card-text small text-muted">${v.synopsis}</p>` +
                `  <p class="card-text small text-muted">${(v.sessionCount !== 0) ? `${v.sessionCount}人接続中` : ''}</p>` +
                `  <p class="card-text small text-muted">${v.timestamp}</p>` +
                `  <button class="btn btn-sm btn-primary btn-outline-primary" title="参加する" type="button" data-room-id="${v._id}" name="player">` +
                `    <i class="fa fa-fw fa-2x fa-sign-in"></i>` +
                `  <button class="ml-2 btn btn-sm btn-primary btn-outline-primary" title="見学する" type="button" data-room-id="${v._id}" name="spectator">` +
                `    <i class="fa fa-fw fa-2x fa-eye"></i>` +
                `  <button class="pull-right btn btn-sm btn-danger btn-outline-danger" title="シナリオクローズ" type="button" data-room-id="${v._id}" name="close">` +
                `    <i class="fa fa-fw fa-2x fa-close"></i>` +
                `  <button class="mr-2 pull-right btn btn-sm btn-warning btn-outline-warning" title="編集" type="button" data-room-id="${v._id}" name="edit">` +
                `    <i class="fa fa-fw fa-2x fa-pencil"></i>` +
                `</button>` +
                `</div>` +
                `</div>`
        });
        
        $('#rooms').empty().append(html);
        
        /*
         * 参加ボタン
         */
        $('button[name=player]').on('click', function(e) {
            let roomId    = $(this).attr('data-room-id');
            location.href = `/rooms/${roomId}`;
        });
        
        /*
         * 内容編集
         */
        $('button[name=edit]').on('click', function(e) {
            let roomId = $(this).attr('data-room-id');
            rooms.edit(roomId);
        });
        
        /*
         * シナリオクローズ
         */
        $('button[name=close]').on('click', function(e) {
            let roomId = $(this).attr('data-room-id');
            rooms.close(roomId);
        });
    },
    close : function(roomId) {
        $('button').attr('disabled', true);
        let passPhrase = htmlEscape(
            (window.prompt('クローズ確認: パスフレーズを入力してください') || '').trim()
        );
        if (passPhrase === '') {
            $('button').attr('disabled', false);
            return false;
        }
        callApiOnAjax(`/rooms/close`, 'patch', {data: {roomId: roomId, passPhrase: passPhrase}})
            .done(function(r) {
                let roomName = rooms.list.find(function(v) {
                    return v._id.toString() === roomId;
                }).name;
                window.alert(`『${roomName}』をクローズしました。`);
            })
            .fail(function(r) {
                window.alert(r.responseText);
            })
            .always(function() {
                rooms.reload();
                $('button').attr('disabled', false);
            })
    },
    edit  : function(roomId) {
        
        /*
         * シナリオクローズボタンから呼び出す
         * シナリオの状態を表示したままモーダルを表示する。
         */
        let r = rooms.list.find(function(v) {
            return v._id.toString() === roomId;
        });
        
        forms.info.roomId = roomId;
        $('#scenarioName').val(r.name);
        $('#passPhrase').val('');
        $('#synopsis').val($(`<div>${r.synopsis}</div>`).text());
        forms.getFromInput();
        forms.show('patch');
    }
};

$(window).ready(function() {
    
    /*
     * モーダルのフォーム
     */
    ['scenarioName', 'passPhrase', 'synopsis']
        .forEach(function(v) {
            $(`#${v}`).on('change', function(e) {
                forms.getFromInput(v);
            }).on('focus', function(e) {
                $(e.target).on('keyup', function(e) {
                    forms.getFromInput(v);
                })
            });
        });
    
    /*
     * ルーム追加ボタン
     */
    $('#createRoomButton').on('click', function(e) {
        $('#scenarioName').val('');
        $('#passPhrase').val('');
        $('#synopsis').val('');
        forms.getFromInput();
        forms.show('post');
    });
    
    /*
     * モーダルの送信ボタン
     */
    $('#sendButton').on('click', function(e) {
        forms.call();
    });
    
    rooms.reload();
});