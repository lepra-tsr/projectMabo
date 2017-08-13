"use strict";

const BrowserWindow = require('electron').remote.BrowserWindow;

let win;

let forms = {
    method  : '',
    info    : {
        'scenarioId'  : undefined,
        'scenarioName': undefined,
        'passPhrase'  : undefined,
        'synopsis'    : undefined
    },
    show    : function(method) {
        let modal = $('#createScenario');
        $(modal).modal({
            dismissible: true,
            ready      : function() {
            
            },
            complete   : function() {
            }
        });
        $(modal).modal('open');
        forms.method = method;
    },
    call    : function() {
        $('button[name=createScenario]').attr('disabled', true);
        forms.getFromInput();
        callApiOnAjax('/scenarios', forms.method, {data: forms.info})
            .done(function(r, status) {
                location.reload();
            })
            .fail(function(r) {
                forms.setError(r.responseText || '')
            })
            .always(function() {
                $('button[name=createScenario]').attr('disabled', false);
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
    getFromInput(selector) {
        
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

let scenarios = {
    list  : [],
    reload: function() {
        callApiOnAjax('/scenarios', 'get', {})
            .done(function(r) {
                scenarios.list = [];
                scenarios.list = r;
                scenarios.render();
            })
            .fail(function() {
            })
    },
    render: function() {
        let html = '';
        scenarios.list.forEach(function(v) {
            html +=
                `<div class="card">` +
                `<div class="card-content">` +
                `  <span class="card-title">${v.name}</span>` +
                `  <p class="card-text small text-muted">${v.synopsis}</p>` +
                `  <p class="card-text small text-muted">${(v.sessionCount !== 0) ? `${v.sessionCount}人接続中` : ''}</p>` +
                `  <p class="card-text small text-muted">${v.timestamp}</p>` +
                `  <button class="btn" title="参加する" type="button" data-scenario-id="${v._id}" data-scenario-name="${v.name}" name="player">` +
                `    <i class="fa fa-fw fa-2x fa-sign-in"></i>参加</button>` +
                `  <button class="btn" title="シナリオクローズ" type="button" data-scenario-id="${v._id}" name="close">` +
                `    <i class="fa fa-fw fa-2x fa-close"></i>終了</button>` +
                `  <button class="btn btn-sm btn-warning btn-outline-warning" title="編集" type="button" data-scenario-id="${v._id}" name="edit">` +
                `    <i class="fa fa-fw fa-2x fa-pencil"></i>編集</button>` +
                `</div>` +
                `</div>`
        });
        
        $('#scenarios').empty().append(html);
        
        /*
         * 参加ボタン
         */
        $('button[name=player]').on('click', function(e) {
            let scenarioId = $(this).attr('data-scenario-id');
            let scenarioName = $(this).attr('data-scenario-name');
            // @TODO パスフレーズ処理
            // location.href  = `./playGround.pug`;
    
            let query = getQueryString({
                id  : scenarioId,
                name: scenarioName
            });
            let path  = `file://${__dirname}/playGround.pug${query}`;
    
            /*
             * シナリオプレイ画面の設定
             */
            win = new BrowserWindow({width: 1200, height: 800, frame: true});
            /*
             *
             */
            win.webContents.openDevTools();
            
            win.on('focus', () => {
                /*
                 *
                 */
            });
            win.on('blur', () => {
                /*
                 *
                 */
            });
            win.on('close', () => {
        
            });
            win.loadURL(path);
            win.show();
    
            // window.open(path, scenarioName);
        });
        
        /*
         * 内容編集
         */
        $('button[name=edit]').on('click', function(e) {
            let scenarioId = $(this).attr('data-scenario-id');
            scenarios.edit(scenarioId);
        });
        
        /*
         * シナリオクローズ
         */
        $('button[name=close]').on('click', function(e) {
            let scenarioId = $(this).attr('data-scenario-id');
            scenarios.close(scenarioId);
        });
    },
    close : function(scenarioId) {
        
        let button = $('button');
        $(button).attr('disabled', true);
        let passPhrase = htmlEscape(
            /*
             * パスフレーズ
             */
            (prompt('クローズ確認: パスフレーズを入力してください') || '').trim()
        );
        if (passPhrase === '') {
            $(button).attr('disabled', false);
            return false;
        }
        callApiOnAjax(`/scenarios/close`, 'patch', {data: {scenarioId: scenarioId, passPhrase: passPhrase}})
            .done(function(r) {
                let scenarioName = scenarios.list.find(function(v) {
                    return v._id.toString() === scenarioId;
                }).name;
                window.alert(`『${scenarioName}』をクローズしました。`);
            })
            .fail(function(r) {
                window.alert(r.responseText);
            })
            .always(function() {
                scenarios.reload();
                $('button').attr('disabled', false);
            })
    },
    edit  : function(scenarioId) {
        
        /*
         * シナリオクローズボタンから呼び出す
         * シナリオの状態を表示したままモーダルを表示する。
         */
        let r = scenarios.list.find(function(v) {
            return v._id.toString() === scenarioId;
        });
        
        forms.info.scenarioId = scenarioId;
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
     * シナリオ追加ボタン
     */
    $('#createScenarioButton').on('click', function(e) {
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
    
    scenarios.reload();
});