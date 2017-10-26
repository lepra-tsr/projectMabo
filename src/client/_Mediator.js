"use strict";

const events       = require('events');
const EventEmitter = events.EventEmitter;
const toast        = require('./_toast.js');

console.log(EventEmitter); // @DELETEME

class Mediator extends EventEmitter {
  constructor() {
    if (typeof Mediator.instance === 'object') {
      return Mediator.instance;
    }
    super();
    Mediator.instance = this;
  }
  
  emit(...args) {
    toast.dim(`Madiator-emit: ${args[0]}`);
    super.emit(...args);
  }
}

module.exports = Mediator;