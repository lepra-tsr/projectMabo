"use strict";

const CU        = require('./commonUtil.js');
const trace     = require('./_trace.js');
const timestamp = require('./_timestamp.js');
const Dialog    = require('./_Dialog.js');
require('dotenv').config();

const scenarioId = CU.getScenarioId();

/**
 * 画像アップローダーに対応するクラス
 *
 * @constructor
 */
let ImageUploader = function() {
    this.dom = undefined;
    
    /*
     * Dialogクラスのコンストラクタ実行
     */
    Dialog.call(this);
    
    this.images = [];
    
    /*
     * 上部ファイルピッカー、アップロード
     * 共通タグ編集
     * 選択した画像一覧
     */
    this.formDom   = $(`<div></div>`, {});
    this.tagsDom   = $(`<div></div>`, {});
    this.imagesDom = $(`<div></div>`, {});
    
    /*
     * アップロードボタン
     */
    this.uploadButtonDom =
        $(`<a>アップロード</a>`, {
            href: '#',
            name: 'imageUpload',
        })
            .addClass('white-text btn teal waves-light waves-effect')
            .css({
                float: 'right'
            })
    
    /*
     * ダミーの画像ファイルピッカー。クリックで非表示のinputをトリガーする
     */
    let fakeFilePickerDom = $('<a>画像ファイルを選択</a>', {
        href: '#',
        name: 'imagePicker',
    }).addClass('white-text btn waves-teal waves-effect');
    
    /*
     * デフォルトスタイルのファイルピッカー。非表示クラスを付与して隠す
     */
    let filePickerDom = $(`<input>`, {
        addClass: 'd-none',
        href    : '#',
        name    : 'image',
        type    : 'file',
        accept  : 'image/*',
        multiple: true
    })
    
    /*
     * 共通タグ部分
     */
    let commonTagLabelDom = $('<label></label>', {
        for: 'commonTags'
    })
    let commonTagInputDom = $('<input>', {
        id         : 'commonTags',
        placeholder: '共通タグ(スペースで区切って複数入力できます)',
        addClass   : 'browser-default',
        type       : 'form'
    })
    
    /*
     * 画像サムネイル部分
     */
    let imageListDom = $(`<ul></ul>`, {
        addClass: 'list-group'
    })
    
    /*
     * DOM組み立て
     */
    $(this.formDom).append($(this.uploadButtonDom));
    $(this.formDom).append($(fakeFilePickerDom));
    $(this.formDom).append($(filePickerDom));
    $(this.dom).append($(this.formDom));
    $(this.tagsDom).append($(commonTagLabelDom))
    $(this.tagsDom).append($(commonTagInputDom))
    $(this.dom).append($(this.tagsDom));
    $(this.imagesDom).append($(imageListDom));
    $(this.dom).append($(this.imagesDom));
    
    /*
     * イベントリスナ付与
     */
    
    /*
     * ファイルピッカーを押下したら秘匿している実体でクリックイベントをキック
     */
    $(fakeFilePickerDom).on('click', (e) => {
        $(filePickerDom).trigger('click');
    })
    $(filePickerDom).on('change', (e) => {
        this.onImagePick(e.target.files);
    })
    
    /*
     * アップロード処理
     */
    $(this.uploadButtonDom).on('click', () => {
        this.upload();
    })
    
    this.dialog({
        title   : '画像管理',
        width   : '500px',
        position: 'center center'
    });
};

/*
 * プロトタイプをマージ
 */
Object.assign(ImageUploader.prototype, Dialog.prototype);

/**
 * 画像のアップロード処理
 * 取り込んだ画像をAmazon S3へアップロードする。
 */
ImageUploader.prototype.upload = function() {
    
    /*
     * 画面をロック
     */
    
    /*
     * タグ情報を付与
     */
    
    /*
     * アップロード処理
     */
    this.images
        .filter(function(img) {
            /*
             * ゴミ箱アイコンは送信時に無視する
             */
            return img.ignore !== 'true'
        })
        .forEach((img) => {
            /*
             * 共通タグと個別タグをマージ
             */
            img.tags = img.tags
                .concat(this.commonTag)
                .filter(function(v, i, a) {
                    return a.indexOf(v) === i
                });
            
            /*
             * タイムスタンプとファイル名をアンダースコアで接続
             */
            let query = CU.getQueryString({key: img.key});
            
            /*
             * Amazon S3のAPIへPOSTするための一時URIを取得
             */
            CU.callApiOnAjax(`/images/signedURI/putObject${query}`, 'get')
                .done(function(signedUri, status) {
                    /*
                     * CORS用の設定
                     */
                    let option = {
                        contentType: 'image/*',
                        processData: false,
                    };
                    
                    /*
                     * 画像をAmazon S3へアップロード。
                     * 一時URIにPUTする
                     */
                    CU.callApiOnAjax(signedUri, 'put', {data: img.binary}, option)
                        .done(function(r) {
                            
                            /*
                             * S3へアップロード成功したら、リソースのURIをDBへ登録する
                             */
                            let s3Info = {
                                key       : img.key,
                                fileSize  : img.fileSize,
                                width     : img.width,
                                height    : img.height,
                                scenarioId: scenarioId,
                                tags      : [].concat(img.tags),
                            };
                            
                            CU.callApiOnAjax(`/images/s3`, 'put', {data: s3Info})
                                .done(function(r) {
                                    /*
                                     * 画像のアップロード・登録処理完了
                                     */
                                    console.info('アップロード完了');
                                    
                                    // CU.callApiOnAjax(`/images/signedURI/getObject${query}`, 'get')
                                    //     .done(function(_signedUri) {
                                    //
                                    //         CU.callApiOnAjax(_signedUri, 'get')
                                    //             .done(function(r) {
                                    //                 console.log(r);
                                    //
                                    //             })
                                    //             .fail(function(r) {
                                    //                 trace.error('Amazon s3からのダウンロードに失敗しました。');
                                    //                 trace.error(r);
                                    //                 return false;
                                    //             })
                                    //     })
                                    //     .fail(function(r) {
                                    //         trace.error('Amazon s3一時認証URIの取得に失敗しました。');
                                    //         trace.error(r);
                                    //         return false;
                                    //     })
                                })
                                .fail(function(r) {
                                    console.error('画像アップロードには成功しましたが、画像情報の登録に失敗しました。');
                                    console.error(r);
                                    return false;
                                })
                        })
                        .fail(function(r) {
                            trace.error('Amazon s3へのアップロードに失敗しました。');
                            trace.error(r)
                            return false;
                        })
                    
                })
                .fail(function(r, status) {
                    trace.warn('Amazon s3一時認証URIの取得に失敗しました。');
                    trace.warn(r);
                    return false;
                });
        });
    this.initImages();
}

/**
 * DOMの初期化
 */
ImageUploader.prototype.initImages = function() {
    /*
     * ローカルから読み取った画像について、送信用データ、DOMを全て削除し初期化
     */
    this.images = [];
    $(this.imagesDom).find('ul').empty();
    // $(this.formDom).find('input').val('');
}

/**
 * ファイルピッカーのchangeイベントから呼び出すメソッド
 * Filesオブジェクトを取得し、this.imagesへ取り込んでDOMを生成する
 *
 * @param _files
 * @returns {boolean}
 */
ImageUploader.prototype.onImagePick = function(_files) {
    
    let files = _files;
    
    /*
     * ファイルピッカーのchangeイベントから呼ぶ
     * ファイルを指定しない場合は何もしない
     */
    if (!files.length) {
        return false;
    }
    
    // this.initImages();
    
    let extensionError = false;
    for (let i = 0; i < files.length; i++) {
        
        if (!/(\.png|\.jpg|\.jpeg|\.gif)$/i.test(files[i].name)) {
            /*
             * 対応していない画像拡張子の場合はエラー表示してスキップ
             */
            extensionError = true;
            $(this.imagesDom).find('ul').append(
                `<li class="media">` +
                `<span>${files[i].name}</span><span class="text-muted">&nbsp;-&nbsp;読み込めませんでした。</span>` +
                `</li>`
            );
            continue;
        }
        
        /*
         * dataUrlとして読み込み(プレビュー用)
         */
        let fr_dataUrl = new FileReader();
        fr_dataUrl.readAsDataURL(files[i]);
        fr_dataUrl.onload = (e) => {
            
            /*
             * ファイルピッカー経由でFileReaderがdataUrlとして読み込み完了したら
             * 仮想の画像DOMを作成して参照先を読み込み結果へ指定する
             */
            let img = new Image();
            
            img.src    = fr_dataUrl.result;
            img.onload = () => {
                /*
                 * 画像DOMを作成してDOMに追加したら、
                 * サムネイルと情報、個別タグ編集フォームの追加
                 */
                $(this.imagesDom).find('ul').append(
                    `<li data-listindex="${i}" data-ignore="false" class="z-depth-1" style="margin:1em 0em;padding:1em;">` +
                    `<div style="float:right;" class="media-body">` +
                    `<h6 class="mt-0 mb-1">${files[i].name}</h6>` +
                    `<p class="${(files[i].size > 3 * 1024 * 1024 ) ? 'text-danger' : 'text-muted'}">` +
                    `${img.width}x${img.height},&nbsp;${Math.round(files[i].size / 1024)}kbytes` +
                    `&nbsp;<i data-listindex="${i}" class="fa fa-trash"></i>` +
                    `</p>` +
                    `<input class="browser-default" type="text" name="imageTagForm" placeholder="立ち絵 笑顔,日本人 女性" style="font-size:11px;"/>` +
                    `</div>` +
                    `<img class="d-flex mr-3" src="${fr_dataUrl.result}" width="150" height="150">` +
                    `</li>`
                );
                
                /*
                 * 情報をひとまとめにしてimages配列へ格納する
                 * ファイル名はタイムスタンプと結合する
                 */
                this.images.push({
                    index   : i,
                    key     : `images/${timestamp()}_${files[i].name}`,
                    name    : files[i].name,
                    fileSize: files[i].size,
                    width   : img.width,
                    height  : img.height,
                    binary  : files[i],
                    tags    : []
                });
                
                /*
                 * ゴミ箱アイコンをクリックするとサムネイル一覧から削除
                 */
                $(`i[data-listindex=\"${i}\"]`).on('click', () => {
                    let li     = $(`li[data-listindex=\"${i}\"]`);
                    let ignore = ($(li).attr('data-ignore') === 'false' ? 'true' : 'false');
                    
                    $(li).attr('data-ignore', ignore)
                        .css('opacity', (ignore === 'false' ? '1.0' : '0.3'));
                    this.images.map(function(v) {
                        if (v.index === i) {
                            v['ignore'] = ignore;
                        }
                        return v;
                    })
                });
                
                /*
                 * 個別タグの編集フォームにイベント付与
                 */
                $('input[name=imageTagForm]').on('blur', function(e) {
                    let that = e.target;
                    /*
                     * カンマと半角スペースでパースする
                     */
                    let tags = $(that).val().trim()
                        .split(' ').join(',').split(',')
                        .filter(function(v, j, a) {
                            /*
                             * 重複と空文字は無視
                             */
                            return a.indexOf(v) === j && v !== '';
                        });
                    /*
                     * タグの指定がない場合は何もしない
                     */
                    if (tags.length === 0) {
                        return false;
                    }
                    tags.forEach(function(v) {
                        /*
                         * 既に同名のタグが存在する場合は作成しない
                         */
                        if ($(`input[data-listindex=\"${i}\"][data-imagetag=\"${v}\"]`).length === 0) {
                            $(that).after(
                                `<label class="form-check form-check-inline form-check-label">` +
                                `<input name="imageTags" data-listindex="${i}" data-imagetag="${v}" class="form-check-input" type="checkbox" checked>` +
                                `${v}</label>`
                            );
                        }
                    });
                    $(that).val('');
                })
            };
        }
    }
    if (extensionError) {
        trace.error('extension error!'); // @DELETEME
    }
}

module.exports = ImageUploader;