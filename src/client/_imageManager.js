"use strict";

const util       = require('./_util.js');
const scenarioId = /\/scenarios\/([a-f0-9]+)/.exec(window.location.href)[1];
const trace      = require('./_trace.js');

let imageManager = {
    commonTag        : [],
    initCommonTag    : function() {
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
    setTagState      : function() {
        this.images.forEach(function(v, i) {
            v.tags = [];
            $(`input[data-listindex=\"${i}\"]:checked`).each(function(j, w) {
                v.tags.push($(w).attr('data-imagetag'));
            })
        })
    },
    images           : [],
    initImages       : function() {
        /*
         * ローカルから読み取った画像について、送信用データ、DOMを全て削除し初期化
         */
        trace.log('initImages'); // @DELETEME
        this.images = [];
        $('#pickedImage').empty();
        $('#imageUploader').val('');
    },
    onImagePick      : function(files) {
        /*
         * ファイルピッカーのchangeイベントが呼ぶメソッド
         */
        if (!files.length) {
            return false;
        }
        this.initImages();
        let extensionError = false;
        for (let i = 0; i < files.length; i++) {
            if (!/(\.png|\.jpg|\.jpeg|\.gif)$/i.test(files[i].name)) {
                extensionError = true;
                $('#pickedImage').append(
                    `<li class="media">` +
                    `<span>${files[i].name}</span><span class="text-muted">&nbsp;-&nbsp;読み込めませんでした。</span>` +
                    `</li>`
                );
                continue;
            }
            
            let fr = new FileReader();
            fr.readAsDataURL(files[i]);
            
            fr.onload = (e) => {
                /*
                 * ファイルピッカーがファイルを読み込んだ時の処理
                 */
                let img = new Image();
                
                img.src    = fr.result;
                img.onload = () => {
                    /*
                     * サムネイルと情報、個別タグ編集フォームの追加
                     */
                    $('#pickedImage').append(
                        `<li data-listindex="${i}" data-ignore="false" class="media mt-1">` +
                        `<img class="d-flex mr-3" src="${fr.result}" width="150" height="150">` +
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
                     * base64(バイナリを文字列で扱う形式)をBlob(バイナリ)へ変換
                     */
                    this.images.push({
                        index   : i,
                        name    : files[i].name,
                        fileSize: files[i].size,
                        width   : img.width,
                        height  : img.height,
                        base64  : fr.result,
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
                        let tags = $(that).val().trim()
                            .split(' ').join(',').split(',')
                            .filter(function(v, j, a) {
                                return a.indexOf(v) === j && v !== '';
                            });
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
    upload           : function() {
        /*
         * 共通タグ、個別タグ、シナリオ限定フラグ
         */
        this.setCommonTagState();
        this.setTagState();
        let thisScenarioOnly = $('#thisScenarioOnly').prop('checked');
        if (thisScenarioOnly === true) {
            this.images.map(function(v) {
                let w = v.scenarioId = scenarioId;
                return w;
            });
        }
        
        /*
         * 送信無視(ゴミ箱アイコン)のデータを無視してアップロード
         */
        this.images
            .filter(function(v) {
                trace.info('filter'); // @DELETEME
                trace.info(v.ignore !== 'true'); // @DELETEME
                return v.ignore !== 'true'
            })
            .forEach((v) => {
                /*
                 * 共通タグと個別タグをマージ
                 */
                v.tags       = v.tags
                    .concat(this.commonTag)
                    .filter(function(v, i, a) {
                        return a.indexOf(v) === i
                    });
                let sendData = {
                    data: {
                        images: v,
                    }
                };
                util.callApiOnAjax('/images', 'post', sendData)
                    .done(function(r, status) {
                        trace.info(r); // @DELETEME
                        $('#pickedImage').empty();
                    })
                    .fail(function(r, status) {
                        trace.info(r); // @DELETEME
                    })
                    .always(function(r, status) {
                    
                    });
            });
        this.initImages();
    },
};

module.exports = imageManager;