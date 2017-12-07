"use strict";

const events       = require('events');
const EventEmitter = events.EventEmitter;
const toast        = require('./_toast.js');

class Mediator extends EventEmitter {
  constructor() {
    if (typeof Mediator.instance === 'object') {
      return Mediator.instance;
    }
    super();
    Mediator.instance = this;
  }
  
  emit(...args) {
    toast(`Madiator-emit: ${args[0]}`);
    super.emit(...args);
  }
  
  on(...args){
    super.on(...args);
  }
}

module.exports = Mediator;