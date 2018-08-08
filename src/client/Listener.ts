'use strict';

import { EventEmitter } from 'events';

export class Listener extends EventEmitter {
  static _: EventEmitter;

  static init() {
    if (Listener._ instanceof EventEmitter) {
      return false;
    }
    Listener._ = new EventEmitter();
  }

  static on(key: string, callback) {
    Listener.init();
    const e = Listener._;
    e.on(key, callback);
  }

  static once(key: string, callback) {
    Listener.init();
    const e = Listener._;
    e.once(key, callback);
  }

  static off(key: string, callback) {
    Listener.init();
    const e = Listener._;
    e.off(key, callback);
  }

  static removeAllListeners(key?: string) {
    Listener.init();
    const e = Listener._;
    e.removeAllListeners(key);
  }

  static emit(key: string, data) {
    Listener.init();
    console.info(key, data);
    const e = Listener._;
    e.emit(key, data);
  }
}

