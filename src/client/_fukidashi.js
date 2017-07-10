"use strict";

const _def       = require('./_def.js');
const trace      = require('./_trace.js');
const scenarioId = /\/scenarios\/([a-f0-9]+)/.exec(window.location.href)[1];

let socket = undefined;

let fukidashi = {
    setSocket: function(_socket) {
        socket = _socket;
    },
    /**
     * [
     *   {
         *     socketId
         *     alias
         *     thought
         *   },...
     * ]
     */
    list     : [],
    add      : function(container) {
        this.list = this.list.filter((v, i) => {
            if (v.socketId !== container.socketId) {
                return v;
            }
        });
        
        if (container.data.thought.trim() !== '') {
            this.list.push({
                socketId: container.socketId,
                alias   : container.data.alias,
                thought : container.data.thought
            });
        }
        this.update();
    },
    clear    : function() {
        this.list = [];
        this.update();
    },
    update   : function() {
        /*
         * thought の状態でtableを更新する
         */
        if (this.list.length === 0) {
            $('#t').find('> tbody').empty();
        } else {
            $('#t').find('> tbody').html(this.list.map(function(v) {
                return (socket.id !== v.socketId) ? `<tr><td>${v.alias}</td><td style="white-space: nowrap;">${v.thought}</td></tr>` : '';
            }).join())
        }
    }
};


module.exports = fukidashi;