"use strict";

/**
 * DOM追加等を行った際などに、操作可能なDOMを再取得する
 */
function reloadAllDraggable() {
    console.log('reloadAllDraggable()');

    // 操作対象のDOM配列を格納する
    cols = document.querySelectorAll('#columns .column');

    // 操作対象のDOMに各種イベントハンドラを付与
    [].forEach.call(cols, function (col) {
        col.addEventListener('dragstart', handleDragStart, false);
        col.addEventListener('dragenter', handleDragEnter, false);
        col.addEventListener('dragover', handleDragOver, false);
        col.addEventListener('dragleave', handleDragLeave, false);
        col.addEventListener('drop', handleDrop, false);
        col.addEventListener('dragend', handleDragEnd, false);
    });
}

/**
 * Drag開始イベントハンドラ
 * @param event
 */
function handleDragStart(event) {

    console.info('drag [start]!');

    // ドラッグ操作開始時のマウス座標を取得
    pos.pick();

    // Drag対象にgrabbedクラスを付与
    this.classList.add('grabbed');

    // Drag中の要素をグローバル変数に格納する
    dragSrcEl = this;

    // Drag中のDOM要素のclassから、DnD識別子(dragGroup_$IDENTIFIER$_) を取得
    dragGroup = getDragGroup(this.className);

    // Drag操作について、許可する操作の種類を設定する
    event.dataTransfer.effectAllowed = 'move';

    // Drag元のデータを格納する。(フォーマット、 引数)
    event.dataTransfer.setData('text', this.outerHTML);
}

/**
 * Drag中、Drag可能な要素にポインタが乗っていると連続的に発生するイベントハンドラ
 * @param event
 * @returns {boolean}
 */
function handleDragOver(event) {
    console.log('drag [over]!');

    // ①: Dropを可能にするため、リンクなどのデフォルト動作を無効化する
    if(event.preventDefault) {
        // preventDefaultが使用可能な場合は使用する
        event.preventDefault();
    }

    // Drop時の操作を設定する
    event.dataTransfer.dropEffect = 'move';

    // Drag可能な要素にポインタが乗っている場合はずっとoverクラスを付与する
    this.classList.add('over');

    // ②: Dropを可能にするため、リンクなどのデフォルト動作を無効化する
    return false;
}

/**
 * Drag中、Drag可能な要素にポインタが乗ると発生するイベントハンドラ
 * @param event
 */
function handleDragEnter(event) {
    console.log('drag [enter]!');

    // Drag中に、Drag可能な要素にポインタが乗った場合はoverクラスを付与する
    this.classList.add('over');
}

/**
 * Drop時に発生するイベントハンドラ
 * @param event
 * @returns {boolean}
 */
function handleDrop(event) {
    var _dragGroup = getDragGroup(this.className);
    console.info('drag [drop]. dragGroup: ' + dragGroup + ' -> ' + _dragGroup);

    // drop時のマウス座標を取得する
    pos.drop();

    // ブラウザからの不要なリダイレクトを防ぐ
    if(event.stopPropagation) {
        event.stopPropagation();
    }

    // DnD識別子が異なるDOMとは入れ替えない
    if(_dragGroup != dragGroup) {
        console.error('different DnD identifier! swap NOT executed.');
        return false;
    }

    // Dragした要素と、Drop先が異なる場合にのみ挿入を行う
    if(dragSrcEl != this) {

        // 前回のdropped要素からdroppedクラスを削除
        $('.column.dropped').removeClass('dropped');

        // Drop先の前後に、要素を挿入する
        if(pos.toTop()) {
            console.log(' -> insert before');
            $(this).before(event.dataTransfer.getData('text'));
            $(this).prev('.column').addClass('dropped')
        } else {
            console.log(' -> insert after');
            $(this).after(event.dataTransfer.getData('text'));
            $(this).next('.column').addClass('dropped')
        }

        // ドラッグした要素からクラスを削除
        $('.column.grabbed').removeClass('grabbed');

        // ドラッグ元を削除する
        dragSrcEl.outerHTML = '';

        // グローバルで、直前にdropしたDOMを保持しておく
        col_dropped = this;
    }

    // DnD操作対象DOMを再取得する
    reloadAllDraggable();

    return false;
}

/**
 * dragEnterイベントが終了した際？に発生するイベントハンドラ
 * @param event
 */
function handleDragLeave(event) {
    console.warn('drag [leave]!');

    // Drag中に、ドッグ可能な要素に乗っていたポインタが外に出た場合、overクラスを削除する
    this.classList.remove('over');
}

/**
 * Dragが終了した際に発生するイベントハンドラ
 * @param event
 */
function handleDragEnd(event) {

    // Drag終了時、全ての操作対象のDOMからoverクラス、grabbedクラスを削除する
    [].forEach.call(cols, function (col) {
        col.classList.remove('over');
        col.classList.remove('grabbed');
    });

    // bootstrap tooltip を再有効化
    initializeTooltip();

    // Drag中のDOMを保持する変数を初期化
    dragSrcEl = null;

    console.info('drag [end]!');
}

/**
 * DnD識別子(class: dragGroup_$IDENTIFIER$_)を取得する。
 * 引数はクラス文字列、またはクラス名。
 * 見つからなかった場合は空文字を返却する。
 *
 * @returns {*}
 * @param classNameString
 */
function getDragGroup(classNameString) {

    // DnD識別子を取得するためのフィルタ
    var dragGroupPattern = /dragGroup_([^_]+)_/;

    var _dragGroup = classNameString.match(dragGroupPattern);

    if(_dragGroup === null) {
        return '';
    }
    return _dragGroup[1]
}

// 直前にdropしたDOM
var col_dropped = null;

// Drag中の要素
var dragSrcEl = null;

// Drag中の要素のDnD識別子
var dragGroup = null;

// drag, dropした際のマウス座標を格納する
var pos = {
    pick   : function () {
        this._init();
        this.start.x = event.pageX;
        this.start.y = event.pageY;
    },
    drop   : function () {
        this.end.x = event.pageX;
        this.end.y = event.pageY;
    },
    _init  : function () {
        this.end.x = undefined;
        this.end.y = undefined;
    },
    toRight: function () {
        if(this.start.x < this.end.x) {
            return true;
        }
        if(this.start.x > this.end.x) {
            return false;
        }
        return null;
    },
    toTop  : function () {
        if(this.start.y > this.end.y) {
            return true;
        }
        if(this.start.y < this.end.y) {
            return false;
        }
        return null;
    },
    start  : {x: undefined, y: undefined},
    end    : {x: undefined, y: undefined},
};

// 操作対象のDOM配列を取得し、それらにイベントハンドラを付与
var cols = null;
reloadAllDraggable();
