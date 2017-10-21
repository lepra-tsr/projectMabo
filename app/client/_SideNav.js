"use strict";

const CU            = require('./commonUtil.js');
const toast         = require('./_toast.js');
const ImageUploader = require('./_ImageUploader.js');
const ImageManager  = require('./_ImageManager.js');
const AvatarManager = require('./_AvatarManager.js');
const TextForm      = require('./_TextForm.js');
const ChatLog       = require('./_ChatLog.js');
const CharacterGrid = require('./_CharacterGrid.js');

const scenarioId = CU.getScenarioId();

let socket        = undefined;
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
  constructor(_playGround, _socket, log) {
    playGround   = _playGround;
    socket       = _socket;
    this.isShown = false;
    
    this.dom     = $(`<div></div>`, {
      role: 'nav',
      name: 'sideNav'
    });
    this.listDom = $(`<ul></ul>`, {id: 'slide-out', addClass: 'side-nav'});
    
    let logoDom =
          `<li><div >` +
          `<h2>Project Mabo</h2>` +
          `</div></li>`;
    
    let addBoard      = $(listBase).clone();
    let imageUploader = $(listBase).clone();
    let imageManager  = $(listBase).clone();
    let avatarManager = $(listBase).clone();
    let characterGrid = $(listBase).clone();
    let textForm      = $(listBase).clone();
    let chatLog       = $(listBase).clone();
    let note          = $(listBase).clone();
    
    $(addBoard).find('a').text('ボード追加');
    $(imageUploader).find('a').text('画像登録');
    $(imageManager).find('a').text('画像管理');
    $(avatarManager).find('a').text('アバター設定');
    $(characterGrid).find('a').text('キャラクタ表');
    $(textForm).find('a').text('チャットフォーム');
    $(chatLog).find('a').text('チャットログ');
    $(note).find('a').text('共有メモ');
    
    /*
     * DOM組み立て
     */
    $(this.dom).append($(this.listDom));
    $(this.listDom).append($(logoDom));
    $(this.listDom).append($(addBoard));
    
    $(this.listDom).append($(divider));
    
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
    
    let tx = new TextForm(socket);
    let cl = new ChatLog(socket, log);
    
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
       * アバター管理
       */
      let am = new AvatarManager(socket);
      this.hide();
    });
    $(characterGrid).on('click', () => {
      /*
       * キャラクター表
       */
      toast('キャラクター表を表示しました');
      characterGrid = new CharacterGrid(socket, playGround);
      this.hide();
    });
    
    
    $(textForm).on('click', () => {
      /*
       * チャット入力フォーム
       */
      toast('チャット入力フォームを追加しました');
      let txf = new TextForm(socket);
    });
    
    $(chatLog).on('click', () => {
      /*
       * チャット履歴
       */
      toast('チャット履歴ダイアログを追加しました');
      let cl = new ChatLog(socket, log);
    });
    
    $(note).on('click', () => {
      /*
       * 共有メモ
       */
      toast('共有メモ');
      // let n = new Note();
    });
    
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
      $(this.showNavButton).sideNav('hide');
      this.isShown = false;
      return false;
    } else {
      $(this.showNavButton).sideNav('show');
      this.isShown = true;
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