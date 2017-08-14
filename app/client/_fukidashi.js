"use strict";

const CU = require('./commonUtil.js');
const trace      = require('./_trace.js');
const scenarioId = CU.getScenarioId();

let socket = undefined;

let fukidashi = {
    setSocket: function(_socket) {
        socket = _socket;
    },
    /*
     * socketId  : this.socketId,
     * scenarioId: this.scenarioId,
     * alias     : this.alias,
     * status    : this.status,
     */
    list     : [],
    add      : function(container) {
        this.list = this.list.filter((v, i) => {
            if (v.socketId !== container.socketId) {
                return v;
            }
        });
        this.list.push({
            socketId: container.socketId,
            alias   : container.alias,
            status  : container.status,
        });
        this.update();
    },
    clear    : function() {
        this.list = [];
        this.update();
    },
    update   : function() {
        /*
         * 入力中インジケータを更新
         */
        let onType     = $('#onType');
        let aliasArray = this.list
            .filter((v) => {
                return (v.status !== 'blank') && (v.socketId !== socket.id);
            })
            .map((v) => {
                return v.alias;
            });

        if (aliasArray.length === 0) {
            $(onType).html('&nbsp;');
        } else {
            let aliasCsv = aliasArray.join(',')
            $(onType).html(`${aliasCsv}が入力中です。`);
        }
    }
};


module.exports = fukidashi;