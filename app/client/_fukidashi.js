"use strict";
const util       = require('./_util.js');
const trace      = require('./_trace.js');
const scenarioId = util.getScenarioId();

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
    
        if ((container.thought.trim() || '') !== '') {
            this.list.push({
                socketId: container.socketId,
                alias   : container.alias,
                thought : container.thought
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