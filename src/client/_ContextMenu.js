"use strict";

class ContextMenu {
  constructor($target, config, items) {
  
    this.id      = config.id || 'contextMenu';
    this.$target = $target;
    this.items   = items;
  
    this.addListener();
  }
  
  /**
   * contextMenuのイベント付与
   */
  addListener() {
    
    this.$target.on('contextmenu', (e) => {
      
      e.preventDefault();
      e.stopPropagation();
      
      this.deploy(e);
      
      this.$dom.on('click', () => {
        this.die();
      });
      
      this.$target.on('click.maboContextMenu', () => {
        this.die();
      });
      
      $(window).on('click.maboContextMenu', () => {
        this.die();
      });
    })
  }
  
  /**
   * コンテキストメニューのDOM書き出し
   *
   * @param e
   */
  deploy(e) {
    
    ContextMenu.killOld();
    ContextMenu.oldInstance = this;
    
    this.$dom       = $('<div></div>', {
      id      : this.id,
      addClass: 'contextMenu',
      role    : 'contextMenu',
      css     : {
        'position'        : 'fixed',
        'z-index'         : '1500',
        'background-color': 'white',
        'width'           : '180px',
        'height'          : 'auto',
        top               : `${e.clientY}px`,
        left              : `${e.clientX}px`,
      }
    });
    this.$container = $('<ul></ul>', {
      addClass: 'collection',
      css     : {
        'margin': '0px',
      }
    });
    
    this.$dom.append(this.$container);
    
    this.items.forEach((menu) => {
      let $a = $('<a></a>', {
        addClass: 'collection-item',
        name    : `contextmenu-${menu.key}`,
        href    : '#'
      }).text(menu.label);
      $a.on('click', () => {
        menu.callback();
      });
      this.$container.append($a);
    });
    
    $('body').append(this.$dom);
  }
  
  /**
   * contextmenuのDOM削除
   * クリック対象とwindowのイベントリスナも切る
   */
  die() {
    this.$dom.remove();
    $(this.$target).off('click.maboContextMenu');
    $(window).off('click.maboContextMenu');
  }
}

ContextMenu.killOld = function() {
  if (ContextMenu.oldInstance) {
    ContextMenu.oldInstance.die();
  }
  ContextMenu.oldInstance = null;
};

module.exports = ContextMenu;