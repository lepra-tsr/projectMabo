"use strict";

let commonUtil = {
  
  /**
   * HTMLタグをエスケープする
   * @param _text
   * @returns {*}
   */
  htmlEscape: function(_text) {
    return _text.replace(/[&'`"<>]/g, (match) => {
      return {
        '&': '&amp;',
        "'": '&#x27;',
        '`': '&#x60;',
        '"': '&quot;',
        '<': '&lt;',
        '>': '&gt;',
      }[match]
    });
  },
  
  /**
   * ajaxでAPIをコールする
   * paramsの要素は以下。
   * url: コールするurl
   * method: httpメソッド
   *
   * $.Deferredでajax処理を監視する。
   * var resultSample = call_api_in_ajax(args..)の形式でコールする。
   * resultSample.state() : 処理状態[pending, resolve, reject]
   * resultSample.done(result,statusCode)   : 処理完了時のコールバック
   * resultSample.fail(result,statusCode)   : 処理失敗時のコールバック
   * resultSample.always : 処理完了、処理失敗時 = 処理終了時に常に実行するコールバック
   *
   * @param endPoint /apiendpoint/hoge/fuga
   * @param method [get|post|patch|put|delete]
   * @param params {data:array ,[async:boolean]}
   *
   */
  callApiOnAjax: function(endPoint, method, params, option) {
    
    // コールするエンドポイントのhost部分
    let __HOST_NAME = process.env.MABO_ENDPOINT;
    
    // レスポンスを格納
    let result;
    
    // 非同期通信に使用するデータ
    let ajax_obj = {};
    
    /*
     * url、http-methodをセット
     * endPointをhttpから指定した場合はそのまま代入
     */
    ajax_obj.url    = /^http/.test(endPoint) ? endPoint : (__HOST_NAME + endPoint);
    ajax_obj.method = method;
    
    if (typeof option !== 'undefined') {
      Object.keys(option).forEach(function(v) {
        ajax_obj[v] = option[v];
      })
    }
    
    if (typeof params !== 'undefined' && params !== null && params !== '') {
      if (typeof params.data !== 'undefined' && params.data !== null && params.data !== '') {
        // params.dataが値を持つ(以下に該当しない)場合はajax_objにセット
        // ｢未定義｣｢null｣｢空文字｣
        ajax_obj.data = params.data;
      }
    }
    
    // console.log(ajax_obj);
    // console.info(ajax_obj);
    
    return $.ajax(ajax_obj);
  },
  
  /**
   * オブジェクトを投げ込むとURIに付けるクエリパラメータを吐き出すメソッド
   * {'keyA':['valueA1', 'valueA2'], 'keyB':['valueB1', 'valueB2']}
   * -> ?keyA=valueA1,valueA2&keyB=valueB1,valueB2
   *
   * valueが空文字、空配列の場合、そのvalueを無効と判断し無視する。
   * keyの持つvalueが全て無効な場合、そのkeyを削除する。
   *
   * valueごとにurlエンコードを実行した上で連結する。
   *
   * @param object
   * @returns {*}
   */
  getQueryString: function(param) {
    
    let keys   = Object.keys(param).filter((v) => {
      let key = v.trim();
      return (typeof v !== 'undefined' && v !== '')
    });
    let query  = '?';
    let keyStr = '';
    
    // 入力したparamについて全てのkeysをループ
    keys.forEach((key) => {
      
      keyStr = key.toString() + '=';
      
      // value が配列かどうか判定
      if (Array.isArray(param[key])) {
        
        // valueが配列の場合
        for (let i = 0; i < param[key].length; i++) {
          
          // valueが空文字、nullの場合は無視する
          if (param[key][i] === '' || param[key][i] === null) {
            continue;
          }
          
          //URLエンコードして追加
          keyStr += encodeURIComponent(param[key][i]) + ',';
        }
        
        // 末尾に連続する半角カンマを全て削除 key=x,,, -> key=x
        keyStr = keyStr.replace(/,+$/, '');
        
      } else {
        
        
        // URLエンコードして追加
        keyStr += encodeURIComponent(param[key]);
      }
      
      query += keyStr + '&';
    });
    
    // 末尾の半角アンパサンドを削除 key=x& -> key=x
    query = query.replace(/&$/, '');
    
    return query !== '?' ? query : '';
    
  },
  
  /**
   * 右クリックメニューの制御
   */
  contextMenu          : function(e, menuProperties) {
    
    if (!menuProperties.hasOwnProperty('items')) {
      console.warn('set items');
      return false;
    }
    if (!menuProperties.hasOwnProperty('callback')) {
      console.warn('set callback');
      return false;
    }
    
    let contextMenu = $('#contextMenu');
    let tdHtmlArray = '';
    menuProperties.items.forEach(function(v) {
      tdHtmlArray += `<tr data-contextkey="${v.key}"><td>${v.name}</td></tr>`;
    });
    
    $(contextMenu).find('tbody').empty()
      .append(tdHtmlArray);
    $(contextMenu).find('tr').each(function(i, v) {
      $(v).on('click', function() {
        menuProperties.callback(e, $(this).attr('data-contextkey'))
      })
    });
    
    /*
     * 右クリックしたらメニューを表示する。
     * 右クリックメニューを選ぶか、画面をクリックしたら非表示に戻す
     */
    $(contextMenu)
      .css('top', `${e.clientY}px`)
      .css('left', `${e.clientX}px`)
      .css('cursor', 'pointer')
      .on('click', function(e) {
        $(contextMenu)
          .css('top', `-1000px`)
          .css('left', `-1000px`);
        $(window).off('click');
      });
    $(window).on('click', function() {
      $(contextMenu)
        .css('top', `-1000px`)
        .css('left', `-1000px`);
      $(window).off('click');
    });
    
    e.preventDefault();
  },
  getScenarioId        : function() {
    // return decodeURIComponent(/id=([0-9a-f]+)/.exec(location.href)[1]);
    return window.scenarioId;
  },
  getScenarioName      : function() {
    // return decodeURIComponent(/name=([^?&#]+)($|&)?/.exec(location.href)[1]);
    return window.scenarioName;
  },
  parseTagStringToArray: function(tagString) {
    
    return (tagString || '' )
      .trim()
      .replace(/\s|、|，/g, ',')
      .split(',')
      .filter((v, i, a) => {
        return i === a.indexOf(v) && v !== '';
      });
  },
  timestamp            : function() {
    
    let now    = new Date();
    let year   = padding(4, now.getFullYear()).toString();
    let month  = padding(2, now.getMonth() + 1).toString();
    let date   = padding(2, now.getDate()).toString();
    let hour   = padding(2, now.getHours()).toString();
    let minute = padding(2, now.getMinutes()).toString();
    let second = padding(2, now.getSeconds()).toString();
    return year + month + date + hour + minute + second;
    
    function padding(num, target) {
      if (target.length >= num) return target;
      
      return ('0000' + target).slice(-num);
    }
  }
};

module.exports = commonUtil;