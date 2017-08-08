"use strict";

const util       = require('./_util.js');
const scenarioId = util.getScenarioId();
const trace      = require('./_trace.js');
const AWS        = require('aws-sdk');
const timestamp  = require('./_timestamp.js');

const s3Options = {
    accessKeyId    : 'AKIAIKKDIMQZRMX5RM4Q',
    region         : 'ap-northeast-1'
};

AWS.config.update(s3Options);

let s3_client = new AWS.S3();

let imageManager = {
    commonTag    : [],
    images       : [],
    initCommonTag: function() {
        let tagHolder = $('#imageTags');
        $(tagHolder).empty();
        util.callApiOnAjax(`/images/tags`, 'get')
            .done(function(r, status) {
                /*
                 * 共通タグ作成
                 */
                r.forEach(function(v) {
                    $('#imageTags').append(
                        `<label class="form-check form-check-inline form-check-label" style="font-size:12px">` +
                        `<input name="commonTags" data-imagetag="${v}" class="form-check-input" type="checkbox">` +
                        `${v}</label>`
                    )
                });
            })
            .fail(function(r, status) {
            
            })
    },
    setCommonTagState: function() {
        this.commonTag = [];
        $('[name=commonTags]:checked').each((i, v) => {
            this.commonTag.push($(v).attr('data-imagetag'))
        });
    },
    setTagState  : function() {
        this.images.forEach(function(v, i) {
            v.tags = [];
            $(`input[data-listindex=\"${i}\"]:checked`).each(function(j, w) {
                v.tags.push($(w).attr('data-imagetag'));
            })
        })
    },
    initImages   : function() {
        /*
         * ローカルから読み取った画像について、送信用データ、DOMを全て削除し初期化
         */
        trace.log('initImages'); // @DELETEME
        this.images = [];
        $('#pickedImage').empty();
        $('#imageUploader').val('');
    },
    onImagePick  : function(files) {
        /*
         * ファイルピッカーのchangeイベントから呼ぶ
         * ファイルを指定しない場合は何もしない
         */
        if (!files.length) {
            return false;
        }
        this.initImages();
        let extensionError = false;
        for (let i = 0; i < files.length; i++) {
    
            if (!/(\.png|\.jpg|\.jpeg|\.gif)$/i.test(files[i].name)) {
                /*
                 * 対応していない画像拡張子の場合はエラー表示してスキップ
                 */
                extensionError = true;
                $('#pickedImage').append(
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
                    $('#pickedImage').append(
                        `<li data-listindex="${i}" data-ignore="false" class="media mt-1">` +
                        `<img class="d-flex mr-3" src="${fr_dataUrl.result}" width="150" height="150">` +
                        `<div class="media-body">` +
                        `<h5 class="mt-0 mb-1">${files[i].name}</h5>` +
                        `<h6 class="${(files[i].size > 3 * 1024 * 1024 ) ? 'text-danger' : 'text-muted'}">` +
                        `${img.width}x${img.height},&nbsp;${Math.round(files[i].size / 1024)}kbytes` +
                        `&nbsp;<i data-listindex="${i}" class="fa fa-trash"></i>` +
                        `</h6>` +
                        `<input type="text" name="imageTagForm" placeholder="立ち絵 笑顔,日本人 女性" style="font-size:11px;"/>` +
                        `</div>` +
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
    },
    upload       : function() {
        /*
         * 共通タグと個別タグを付与
         */
        this.setCommonTagState();
        this.setTagState();
        
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
                let query = util.getQueryString({key: img.key});
    
                /*
                 * Amazon S3のAPIへPOSTするための一時URIを取得
                 */
                util.callApiOnAjax(`/images/signedURI/putObject${query}`, 'get')
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
                        util.callApiOnAjax(signedUri, 'put', {data: img.binary}, option)
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
            
                                util.callApiOnAjax(`/images/s3`, 'put', {data: s3Info})
                                    .done(function(r) {
                                        /*
                                         * 画像のアップロード・登録処理完了
                                         */
                                        trace.log('アップロード完了');
    
                                        // util.callApiOnAjax(`/images/signedURI/getObject${query}`, 'get')
                                        //     .done(function(_signedUri) {
                                        //
                                        //         util.callApiOnAjax(_signedUri, 'get')
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
                                        trace.error('画像アップロードには成功しましたが、画像情報の登録に失敗しました。');
                                        trace.error(r);
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
    },
};

module.exports = imageManager;