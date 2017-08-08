"use strict";

const util       = require('./_util.js');
const trace      = require('./_trace.js');
const scenarioId = util.getScenarioId();


let command = {
    /**
     * spell: trimしたスラッシュコマンド全文
     */
    rawSpell: '',
    isSpell : false,
    spell   : '',
    arg     : [],
    options : [],
    _init   : function() {
        this.rawSpell = '';
        this.isSpell  = false;
        this.spell    = '';
        this.arg      = [];
        this.options  = [];
    },
    /**
     * 入力内容をパースし、/^\// にマッチした場合はtrueを返却、それ以外の場合はfalseを返す。
     *
     * @param rawSpell
     */
    parse   : function(rawSpell) {
        
        let result = rawSpell.match(/^\/([^ ]+)/);
        
        this._init();
        if (result === null) {
            this.isSpell = false;
            return false;
        }
        this.isSpell  = true;
        this.rawSpell = rawSpell;
        this.spell    = result[1];
        rawSpell.replace(/^\/([^ ]+)/, '').trim().split(' ')
            .filter((v) => {
                return v !== '';
            })
            .forEach((v) => {
                if (v.match(/^[^-][\w\d]*/) !== null) {
                    this.arg.push(v);
                    return false;
                }
                if (v.match(/^-/) !== null) {
                    this.options.push(v.replace(/^-/, ''));
                    return false;
                }
            });
    },
    exec    : function() {
        // let spell = spellBook.find(this.spell);
        // if (spell === null) {
        //     textForm.insertMessages({msg: '無効なコマンドです。:' + this.spell});
        //     return false;
        // }
        // spell.cast(this.spell, this.arg, this.options, this.rawSpell);
    },
};


let spellBook = {
    /**
     * D 1 100 は 1D100 のエイリアスにする？
     */
    spell: [],
    /**
     * スラッシュ直後のコマンド名から、該当するSpellクラスを返却する
     * 該当するコマンドが見つからなかった場合はnullを返却する
     *
     * @param spell
     */
    find : (spell) => {
        let result = null;
        spellBook.spell.some((v) => {
            if (v.re(spell) === true) {
                result = v;
                return true;
            }
            return false;
        });
        return result;
    },
    cast : (spellName) => {
        trace.log('exec: ' + spellName); // @DELETEME
        
    },
    /**
     * @param action 'add'
     */
    edit : (action) => {
    
    }
};

module.exports = command;