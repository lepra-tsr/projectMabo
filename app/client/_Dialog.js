"use strict";

const CU = require('./commonUtil.js');

const scenarioId = CU.getScenarioId();

let Dialog = function() {
    this.dom        = $(`<div></div>`).appendTo('body');
    this.contentDom = undefined;
    this.dialogDom  = undefined;
    this.titleDom   = undefined;
};

Dialog.prototype.dialog = function(option) {
    if (typeof this.dom === 'undefined') {
        console.error('Dom is not defined.'); // @DELETEME
        return false;
    }
    
    let config = {
        autoOpen     : true,
        resizable    : true,
        closeOnEscape: false,
        position     : {at: 'left center'},
        title        : `title`,
        classes      : {},
        buttons      : [],
        width        : '200px',
        height       : 'auto',
        dragStop     : () => {
            this.fitContent();
        },
        create       : () => {
            this.fitContent();
        },
        open         : () => {
            this.fitContent();
        },
        resizeStop   : () => {
            this.fitContent();
        },
        close        : () => {
        }
    }
    
    Object.keys(option).forEach((v) => {
        if (config.hasOwnProperty(v)) {
            config[v] = option[v];
        }
    })
    
    
    this.contentDom = $(this.dom).dialog(config)
    this.dialogDom  = $(this.contentDom).parent();
    this.titleDom   = $(this.dialogDom).find('.ui-dialog-titlebar');
    this.fitContent();
}

Dialog.prototype.fitContent = function() {
    let contentDom = $(this.contentDom);
    let dialogDom  = $(this.dialogDom);
    let titleDom   = $(this.titleDom);
    
    let height =
            parseInt($(dialogDom).css('height'))
            - parseInt($(dialogDom).css('padding-top'))
            - parseInt($(dialogDom).css('border-top'))
            - parseInt($(dialogDom).css('padding-bottom'))
            - parseInt($(dialogDom).css('border-bottom'))
    let title  = parseInt($(titleDom).css('height'));
    
    $(contentDom).css({
        // width : "100%",
        // height: `${height - title}px`
    })
}

module.exports = Dialog;