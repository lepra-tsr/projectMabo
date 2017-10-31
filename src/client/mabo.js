"use strict";

/*
 * materialize-css
 */
require('materialize-css');

/*
 * jquery-ui
 */
require('webpack-jquery-ui');

const CU           = require('./commonUtil.js');
const toast        = require('./_toast.js');
const prompt       = require('./_prompt.js');
const alert        = require('./_alert.js');
const Modal        = require('./_Modal.js');
const Scenario     = require('./_Scenario.js');
const ScenarioInfo = require('./_ScenarioInfo.js');
const Mediator     = require('./_Mediator.js');
const mediator     = new Mediator();

let modal      = undefined;

/*
 * ユーザエージェントの簡易チェック
 * Chrome以外は警告
 */
(() => {
    let ua       = (navigator.userAgent || '').toLowerCase();
    let isChrome = (ua.indexOf('chrome') !== -1) && (ua.indexOf('edge') === -1);
    if (!isChrome) {
      window.alert('Google Chromeでのみ動作確認をしています。');
    }
  })();

/*
 * websocket接続開始
 */
const sInfo        = new ScenarioInfo();
const socket       = sInfo.socket;

socket.on('connect', () => {
  toast('接続成功');
});
socket.on('joinFailed', (error) => {
  toast(`ログイン失敗 ${error.msg}`);
});
socket.on('joinedAsPlayer', (container) => {
  toast(`ログイン成功: ${container.scenarioId}`);
  sInfo.id    = container.scenarioId;
  sInfo.name  = container.scenarioName;
  sInfo.users = container.users;
  
  let s = new Scenario({
    scenarioId  : sInfo.id,
    scenarioName: sInfo.name,
  });
  if (typeof modal !== 'undefined' && typeof modal.hide === 'function') {
    modal.hide();
  }
});
socket.on('joinNotify', (container) => {
  sInfo.users = container.users;
  toast(`ログイン通知: ${container.socketId}`);
  mediator.emit('sideNav.updateUserList');
});
socket.on('userNameChanged', (container) => {
  sInfo.users = container.users;
  toast(`名前変更通知: ${container.newName}`);
  mediator.emit('sideNav.updateUserList');
});
socket.on('logOut', (container) => {
  let msg = `${container.leftId}がログアウトしました`;
  toast(msg);
  
  sInfo.users = container.users;
  mediator.emit('sideNav.updateUserList');
});

$(window).ready(() => {
  
  /*
   * ブラウザバックの向き先をこのページにする(厳密なブラウザバックの禁止ではない)
   */
  history.pushState(null, null, null);
  window.addEventListener("popstate", function() {
    history.pushState(null, null, null);
  });
  
  modal = new Modal({
    id           : 'channelList',
    type         : '',
    title        : 'シナリオ一覧',
    removeOnClose: true,
    dismissible  : false,
    'overflow-y' : 'hidden',
    ready        : directLogin.bind(this)
  });
  
  modal.tableContainer = $('<div></div>', {css: {height: '300px', 'overflow-y': 'scroll'}});
  $(modal.modalContent).append($(modal.tableContainer));
  
  let createScenarioButton = $('<a></a>', {
    type    : 'button',
    addClass: 'btn btn-flat waves-effectwaves-light'
  }).text('シナリオ作成');
  $(modal.modalFooter).append($(createScenarioButton));
  $(createScenarioButton).on('click', createScenario.bind(this));
  
  CU.callApiOnAjax('/scenarios', 'get')
    .then(renderTable.bind(this))
    .catch((e) => {
      toast.error('シナリオ一覧の取得に失敗しました。');
      console.error(e);
    });
  
  modal.show();
  
  function directLogin() {
    let dataDom      = $('#scenarioData');
    let _scenarioId  = ($(dataDom).attr('data-scenarioId') || '').trim();
    let scenarioName = ($(dataDom).attr('data-scenarioName') || '').trim();
    $(dataDom).remove();
    if (_scenarioId !== '') {
      scenarioLoginPrompt({id: _scenarioId, name: scenarioName})
        .catch(() => {
          sInfo.name = '';
          return false;
        });
    }
  }
  
  /**
   * シナリオ一覧テーブルの作成
   * @param r
   */
  function renderTable(r) {
    
    toast('シナリオ一覧を取得');
    let table    = $('<table></table>', {addClass: 'centered striped', css: {'table-layout': 'auto'}});
    let header   = $('<thead></thead>');
    let headerTr = $('<tr></tr>');
    $(table).append($(header));
    $(header).append($(headerTr));
    ['シナリオ名', '接続人数', ''].forEach((v) => {
      let th = $('<th></th>').text(v);
      $(headerTr).append($(th));
    });
    let body = $('<tbody></tbody>');
    $(table).append($(body));
    
    r.forEach((scenario) => {
      let tr           = $('<tr></tr>');
      let scnearioName = $('<td></td>', {css: {width: 'auto'}}).text(scenario.name);
      let sessionCount = $('<td></td>', {css: {width: '20%'}}).text(scenario.sessionCount);
      let buttonCell   = $('<td></td>', {css: {width: '30%'}});
      let joinButton   = $('<a></a>', {
        type    : 'button',
        addClass: 'btn waves-effect waves-light btn-flat',
        css     : {
          padding: '0em 1em',
          margin : '0em 0.25em'
        }
      }).text('参加');
      $(joinButton).on('click', () => {
        scenarioLoginPrompt.call(this, {id: scenario._id, name: scenario.name}, undefined)
          .catch(() => {
          
          })
      });
      
      let observeButton = $('<a></a>', {
        type    : 'button',
        addClass: 'btn waves-effect waves-light btn-flat',
        css     : {
          padding: '0em 1em',
          margin : '0em 0.25em'
        }
      }).text('見学');
      
      $(tr).append($(scnearioName));
      $(tr).append($(sessionCount));
      $(tr).append($(buttonCell));
      $(buttonCell).append($(joinButton));
      $(buttonCell).append($(observeButton));
      $(body).append($(tr));
    });
    
    $(modal.tableContainer).empty();
    $(modal.tableContainer).append(table)
  }
  
  /**
   * socket越しにシナリオへの参加認証を行う
   * promiseを返却する。
   *  ログイン成功 -> resolve
   *
   * @param scenario
   */
  function scenarioLoginPrompt(scenario) {
    let id, name;
    ({id, name} = scenario);
    
    return prompt(`ログイン認証`, `『${name}』のパスフレーズ`, {
      id: 'loginPrompt',
    }).then(sendLoginSocket);
    
    function sendLoginSocket(_input) {
      if (typeof _input !== 'string' || _input === '') {
        return false;
      }
      
      socket.emit('joinAsPlayer', {
        scenarioId: id,
        socketId  : socket.id,
        passPhrase: _input.trim()
      });
      
      return true;
    }
  }
  
  /**
   * シナリオ作成
   * 作成成功時はパスフレーズをテキスト形式でダウンロードし、自動的にログインする
   *
   * @returns {boolean}
   */
  function createScenario() {
    
    prompt('新規シナリオ作成', '作成するシナリオのタイトルを入力してください', {id: 'createScenarioPrompt'})
      .then((scenarioName) => {
        
        if (scenarioName.trim() === '') {
          return false;
        }
        
        CU.callApiOnAjax('/scenarios', 'post', {data: {scenarioName: scenarioName}})
          .then((r) => {
            let passPhrase = r.passPhrase;
            let scenarioId = r.scenarioId;
            toast(`シナリオ作成成功:『${scenarioName}』`);
            
            let blob = new Blob([passPhrase], {type: 'text/plain'});
            let uri  = window.URL.createObjectURL(blob);
            let link = document.createElement('a');
            link.setAttribute('download', `${scenarioName}.txt`);
            link.href = uri;
            link.click();
            
            socket.emit('joinAsPlayer', {
              scenarioId: scenarioId,
              socketId  : socket.id,
              passPhrase: passPhrase
            });
          })
          .catch((e) => {
            toast.error('シナリオの作成に失敗しました')
          })
      })
      .catch(() => {
      
      });
  }
});