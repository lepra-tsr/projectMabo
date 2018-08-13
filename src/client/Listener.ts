'use strict';

import { EventEmitter } from 'events';

export class Notifier extends EventEmitter {
  static _: EventEmitter;

  static init() {
    if (Notifier._ instanceof EventEmitter) {
      return false;
    }
    Notifier._ = new EventEmitter();
  }

  static on(key: string, callback) {
    Notifier.init();
    const e = Notifier._;
    e.on(key, callback);
  }

  static once(key: string, callback) {
    Notifier.init();
    const e = Notifier._;
    e.once(key, callback);
  }

  static off(key: string, callback) {
    Notifier.init();
    const e = Notifier._;
    e.off(key, callback);
  }

  static removeAllNotifiers(key?: string) {
    Notifier.init();
    const e = Notifier._;
    e.removeAllNotifiers(key);
  }

  static emit(key: string, data) {
    Notifier.init();
    console.info(key, data);
    const e = Notifier._;
    e.emit(key, data);
  }
}

