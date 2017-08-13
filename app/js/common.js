/**
 * HTMLタグをエスケープする
 * @param _text
 * @returns {*}
 */
function htmlEscape(_text) {
    return _text.replace(/[&'`"<>]/g, function(match) {
        return {
            '&': '&amp;',
            "'": '&#x27;',
            '`': '&#x60;',
            '"': '&quot;',
            '<': '&lt;',
            '>': '&gt;',
        }[match]
    });
}

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
function callApiOnAjax(endPoint, method, params) {
    
    // コールするエンドポイントのhost部分
    let __HOST_NAME = 'http://192.168.99.100:3000';
    
    // レスポンスを格納
    let result;
    
    // 非同期通信に使用するデータ
    let ajax_obj = {};
    
    // url、http-methodをセット
    ajax_obj.url    = __HOST_NAME + endPoint;
    ajax_obj.method = method;
    
    // 非同期フラグはデフォルトでtrue
    ajax_obj.async = true;
    
    // csrfトークン埋め込み
    ajax_obj.headers = {
        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
    };
    
    if (typeof params !== 'undefined' && params !== null && params !== '') {
        if (typeof params.data !== 'undefined' && params.data !== null && params.data !== '') {
            // params.dataが値を持つ(以下に該当しない)場合はajax_objにセット
            // ｢未定義｣｢null｣｢空文字｣
            ajax_obj.data = params.data;
        }
    }
    
    // deferredオブジェクトを作成
    let d = new $.Deferred;
    
    console.log(ajax_obj);
    
    $.ajax(ajax_obj)
        .then(
            function(response, textStatus, jqXHR) {
                // logging
                console.log(response);
                d.resolve(response, textStatus);
            },
            function(error, textStatus, jqXHR) {
                // 400, 500 など 200 以外
                
                // logging
                console.error(error);
                
                d.reject(error, jqXHR.status);
            });
    
    return d.promise();
}

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
function getQueryString(object) {
    
    let query = '?';
    
    let keyStr = '';
    
    // 入力したobjectについて全てのkeyをループ
    for (let key in object) {
        
        keyStr = key.toString() + '=';
        
        // value が配列かどうか判定
        if (Array.isArray(object[key])) {
            
            // valueが配列の場合
            for (let i = 0; i < object[key].length; i++) {
                
                // valueが空文字、nullの場合は無視する
                if (object[key][i] === '' || object[key][i] === null) continue;
                
                //URLエンコードして追加
                keyStr += encodeURIComponent(object[key][i]) + ',';
            }
            
            // 末尾に連続する半角カンマを全て削除 key=x,,, -> key=x
            keyStr = keyStr.replace(/,+$/, '');
            
        } else {
            
            // valueが配列ではない場合
            
            // valueが空文字、nullの場合は無視する
            if (object[key] === '' || object[key] === null) continue;
            
            // URLエンコードして追加
            keyStr += encodeURIComponent(object[key]);
        }
        
        // 末尾が key= のように終わっていた場合はそのKeyを削除
        if (keyStr.match(/=$/) !== null) {
            console.log('empty key detected and ignored: ' + key.toString());
            continue;
        }
        
        query += keyStr + '&';
    }
    
    // 末尾の半角アンパサンドを削除 key=x& -> key=x
    query = query.replace(/&$/, '');
    
    return query !== '?' ? query : '';
    
}

/**
 * シナリオIDをURIから取得
 * @returns {string}
 */
function getScenarioId () {
    return decodeURIComponent(/id=([0-9a-f]+)/.exec(window.location.href)[1]);
}

/**
 * シナリオ名をIDから取得
 * @returns {string}
 */
function getScenarioName () {
    return decodeURIComponent(/name=([^?&#]+)($|&)?/.exec(window.location.href)[1])
}