'use strict';

import { EventEmitter } from 'events';

export interface notifier {
  key: string;
  callback: (...args: any[]) => any;
}

export class Notifier extends EventEmitter {
  static _: EventEmitter;

  static init() {
    if (Notifier._ instanceof EventEmitter) {
      return false;
    }
    Notifier._ = new EventEmitter();
  }

  static on(key: string, callback: (...args: any[]) => any): notifier {
    Notifier.init();
    const e = Notifier._;
    e.on(key, callback);

    return { key, callback }
  }

  static once(key: string, callback) {
    Notifier.init();
    const e = Notifier._;
    e.once(key, callback);
  }

  static off(key: string, callback) {
    Notifier.init();
    const e = Notifier._;
    e.removeListener(key, callback);
  }

  static offs(notifiers: notifier[]): void {
    for (let i = 0; i < notifiers.length; i++) {
      const { key, callback } = notifiers[i];
      Notifier.off(key, callback);
    }
  }

  static removeAllListeners(key?: string) {
    Notifier.init();
    const e = Notifier._;
    e.removeAllListeners(key);
  }

  static emit(key: string, data) {
    Notifier.init();
    console.info(key, data);
    const e = Notifier._;
    e.emit(key, data);
  }
}

