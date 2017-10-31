"use strict";

const CU            = require('./commonUtil.js');
const toast         = require('./_toast.js');
const prompt        = require('./_prompt.js');
const confirm       = require('./_confirm.js');
const ImageUploader = require('./_ImageUploader.js');
const ImageManager  = require('./_ImageManager.js');
const AvatarManager = require('./_AvatarManager.js');
const TextForm      = require('./_TextForm.js');
const ChatLog       = require('./_ChatLog.js');
const CharacterGrid = require('./_CharacterGrid.js');
const Mediator      = require('./_Mediator.js');
const mediator      = new Mediator();

const ScenarioInfo = require('./_ScenarioInfo.js');
const sInfo        = new ScenarioInfo();
const socket       = sInfo.socket;

let playGround    = undefined;

const listBase    = $('<li></li>');
$(listBase).append($('<a></a>', {addClass: 'waves-effect'}));
const divider   = `<li><div class="divider"></div></li>`;
const subheader = `<li><div class="subheader"></div></li>`;

class SideNav {
  /**
   * 画面左側からスライドインするメニュに対応するクラス
   * 各種ダイアログ、モーダルのランチャを兼ねる
   *
   * @param _playGround
   * @param _socket
   * @constructor
   */
  constructor(_playGround, log) {
    playGround   = _playGround;
    this.isShown = false;
    
    this.dom     = $(`<div></div>`, {
      role: 'nav',
      name: 'sideNav'
    });
    this.listDom = $(`<ul></ul>`, {id: 'slide-out', addClass: 'side-nav'});
  
    let logoDom      = $('<li></li>');
    let scenarioName = $('<h4></h4>', {css: {padding: '0 0.5em'}}).text(sInfo.name);
    $(logoDom).append(scenarioName);
  
    let usersDom = $('<div></div>');
    let userList = $('<ul></ul>');
    updateUserList();
    $(usersDom).append(userList);
  
    let changeUserName = $(listBase).clone();
    let logOut         = $(listBase).clone();
    let addBoard       = $(listBase).clone();
    let imageUploader  = $(listBase).clone();
    let imageManager   = $(listBase).clone();
    let avatarManager  = $(listBase).clone();
    let characterGrid  = $(listBase).clone();
    let textForm       = $(listBase).clone();
    let chatLog        = $(listBase).clone();
    let note           = $(listBase).clone();
  
    $(changeUserName).find('a').text('名前設定');
    $(logOut).find('a').text('ログアウト');
    $(addBoard).find('a').text('ボード追加');
    $(imageUploader).find('a').text('画像登録');
    $(imageManager).find('a').text('画像管理');
    $(avatarManager).find('a').text('立ち絵設定');
    $(characterGrid).find('a').text('キャラクタ表');
    $(textForm).find('a').text('チャットフォーム');
    $(chatLog).find('a').text('チャットログ');
    $(note).find('a').text('共有メモ');
    
    /*
     * DOM組み立て
     */
    $(this.dom).append($(this.listDom));
    $(this.listDom).append($(logoDom));
    $(this.listDom).append($(usersDom));
    
    $(this.listDom).append($(divider));
    $(this.listDom).append($(changeUserName));
  
    $(this.listDom).append($(divider));
    $(this.listDom).append($(logOut));
    $(this.listDom).append($(addBoard));
    $(this.listDom).append($(imageUploader));
    $(this.listDom).append($(imageManager));
    $(this.listDom).append($(avatarManager));
    $(this.listDom).append($(characterGrid));
    
    $(this.listDom).append($(divider));
    
    $(this.listDom).append($(textForm));
    $(this.listDom).append($(chatLog));
    
    $(this.listDom).append($(divider));
    
    $(this.listDom).append($(note));
    
    $(this.listDom).append($(divider));
    
    
    /*
     * @SEE materiarizecssのsideNavはボタントリガから発火するAPIしかない
     * 非表示のボタンを追加して紐付ける
     */
    this.showNavButton = $('<a></a>', {
      id              : 'showSideNav',
      addClass        : 'button-collapse d-none',
      href            : '#',
      'data-activates': 'slide-out',
    }).html(`<i class="material-icons">menu</i>`);
    
    $(this.dom).append($(this.showNavButton));
    $('body').append($(this.dom));
    
    let option = {
      menuWidth: 350,
      onOpen   : () => {
        this.isShown = true;
      },
      onClose  : () => {
        this.isShown = false;
      },
    };
    $(this.showNavButton).sideNav(option);
  
    let tx = new TextForm();
    let cl = new ChatLog(log);
    
    /*
     * F1キーでトグル
     */
    $(window).on('keydown', (e) => {
      if (e.key === 'F1' || e.keyCode === 112) {
        this.toggle();
      }
    });
    
    /*
     * イベント付与
     */
    $(changeUserName).on('click', () => {
      /*
       * 名前変更
       */
      prompt('名前変更', 'あなたの名前を指定してください', {id: 'changeUserNamePrompt'})
        .then((input) => {
          let userName = input.trim();
          if (userName.length >= 20) {
            toast.warn('長すぎます！')
            this.hide();
            return false;
          }
          socket.emit('changeUserName', {socketId: socket.id, scenarioId: sInfo.id, userName: userName});
          this.hide();
        })
        .catch(() => {
        })
    })
    $(logOut).on('click', () => {
      /*
       * ログアウト
       */
      confirm('ログアウト確認', `『${sInfo.name}』からログアウトします。よろしいですか？`, {id: 'logOutConfirm'})
        .then(() => {
          let path      = '/';
          location.href = path;
          this.hide();
        })
        .catch(() => {
        })
    });
    $(addBoard).on('click', () => {
      /*
       * ボード追加モーダル
       */
      playGround.openModalDeployBoard();
      this.hide();
    });
    $(imageUploader).on('click', () => {
      /*
       * 画像アップローダ
       */
      let iu = new ImageUploader();
      this.hide();
    });
    $(imageManager).on('click', () => {
      /*
       * 画像管理
       */
      let im = new ImageManager();
      this.hide();
    });
    $(avatarManager).on('click', () => {
      /*
       * 立ち絵管理
       */
      let am = new AvatarManager();
      this.hide();
    });
    $(characterGrid).on('click', () => {
      /*
       * キャラクター表
       */
      toast('キャラクター表を表示しました');
      characterGrid = new CharacterGrid(playGround);
      this.hide();
    });
    
    
    $(textForm).on('click', () => {
      /*
       * チャット入力フォーム
       */
      toast('チャット入力フォームを追加しました');
      let txf = new TextForm();
    });
    
    $(chatLog).on('click', () => {
      /*
       * チャット履歴
       */
      toast('チャット履歴ダイアログを追加しました');
      let cl = new ChatLog(log);
    });
    
    $(note).on('click', () => {
      /*
       * 共有メモ
       */
      toast('共有メモ');
      // let n = new Note();
    });
  
    mediator.on('sideNav.updateUserList', updateUserList);
  
    function updateUserList() {
      $(userList).empty();
      sInfo.users.forEach((u) => {
        let text = `${u.type} - ${u.name}${u.socketId === socket.id ? ' (YOU)' : ''}`;
        let li   = $('<li></li>', {
          title: `id: ${u.scenarioId}`,
          css  : {
            padding      : '0 36px',
            'line-height': '1.5em',
          }
        }).text(text);
        $(userList).append(li);
      });
    }
    
  }
  
  /**
   * サイドナビ表示
   * @returns {boolean}
   */
  show() {
    $(this.showNavButton).sideNav('show');
    this.isShown = true;
  }
  
  /**
   * サイドナビ非表示
   *
   * @returns {boolean}
   */
  hide() {
    
    $(this.showNavButton).sideNav('hide');
    this.isShown = false;
  }
  
  /**
   * サイドナビの表示非表示をトグル
   * @returns {boolean}
   */
  toggle() {
    
    this.updateMapTree();
    
    if (this.isShown) {
      this.hide();
      return false;
    } else {
      this.show();
      return false;
    }
  }
  
  /**
   * サイドナビのボード一覧を更新する
   */
  updateMapTree() {
    /*
     * 初期化
     */
    $('li[name=board-list]').remove();
    
    /*
     * ボード一覧を取得
     */
    let boards = playGround.boards;
    
    for (let i = 0; i < boards.length; i++) {
      let b        = boards[i];
      let listName = `${b.name}`;
      let list     = $(listBase).clone();
      $(list).attr('name', 'board-list').find('a').html(listName);
    
      /*
       * クリックで選択状態にする
       */
      $(list).on('click', () => {
        toast.info(`ボード:「${b.name}」を選択しました`);
        playGround.popBoardUp(b.id);
        b.move(100, 100);
        this.hide();
      });
      $(this.listDom).append($(list))
    }
  }
}

module.exports = SideNav;