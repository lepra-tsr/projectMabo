"use strict";

require('dotenv').config();

const DEBUG_TRACE = process.env.DEBUG_TRACE === '1';

let trace = {
    
    isOn: DEBUG_TRACE,
    
    log    : function(args) {
        this.console(args, 'log');
    },
    info   : function(args) {
        this.console(args, 'info');
    },
    warn   : function(args) {
        this.console(args, 'warn');
    },
    error  : function(args) {
        this.console(args, 'error');
    },
    table  : function(args) {
        this.console(args, 'table');
    },
    console: function(args, _severity) {
        
        if (this.isOn !== true) {
            return false;
        }
        
        let severity = 'log';
        if (typeof _severity !== 'undefined' || ['log', 'info', 'warn', 'error', 'table'].indexOf(_severity) !== -1) {
            severity = _severity;
        }
        
        console[severity](args);
    }
};

module.exports = trace;