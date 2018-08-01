"use strict";

const baseRule = {
  room: {
    id: {
      type: 'string',
      regexp: /[0-9a-fA-F]{24}/,
    },
    title: {
      type: 'string',
      regexp: /[^\s]{1,50}/,
    },
    description: {
      type: 'string',
      regexp: /[^\s]{0,1000}/,
    },
    password: {
      type: 'string',
      regexp: /[^\s]{0,1000}/,
    },
  },
};

export class Validator {
  static test(args: Array<[string, any, {}]>) {
    for (let i = 0; i < args.length; i++) {
      const [key, v, _rule = {}] = args[i];
      const br = Validator.digWithPath(baseRule, key);
      const rule: { exist?, type?, regexp? } = Object.assign(_rule, br);

      if (Object.keys(rule).length === 0) {
        throw new Error('implementation error: バリデーション未定義');
      }

      if (rule.hasOwnProperty('exist')) {
        if (rule.exist && typeof v === 'undefined') {
          Validator.raiseValidationError(`exist:必須パラメータです`);
        }
      }
      if (rule.hasOwnProperty('type')) {
        if (typeof v !== rule.type) {
          Validator.raiseValidationError(`type:型が${rule.type}ではありません`);
        }
      }
      if (rule.hasOwnProperty('regexp')) {
        if (!rule.regexp.test(v)) {
          Validator.raiseValidationError(`regexp:正規表現${rule.regexp}にマッチしません`)
        }
      }
    }
    return true;
  }

  static digWithPath(rule: {}, path: string) {
    const paths: Array<string> = path.split('.');
    let r: {} = rule;
    for (let i = 0; i < paths.length; i++) {
      let p = paths[i];
      if (!r.hasOwnProperty(p)) {
        throw new Error(`implementation error: バリデーション未定義 (${path})`);
      }
      r = r[p];
    }
    return r;
  }

  static raiseValidationError(msg: string) {
    throw new Error(`validation error: ${msg}`);
  }

  static raiseResourceNotFoundError(msg: string) {
    throw new Error(`resource not found error: ${msg}`);
  }

  static raiseAuthenticationFailedError(msg: string) {
    throw new Error(`authentication failed error: ${msg}`);
  }
}

const { RoomModel } = require('../model/Room/Model');
const { ObjectId } = require('mongodb');

export class RoomValidator {
  static validateRoomExists(roomId: string) {
    const query = RoomModel.find();
    query.collection(RoomModel.collection);
    query.where({ _id: ObjectId(roomId) });
    return query.exec()
      .then((result) => {
        if (result.length === 0) {
          const msg = 'room: ルームが見つかりません';
          Validator.raiseResourceNotFoundError(msg);
        }
      });
  }

  static validateRoomAuth(roomId: string, password: string) {
    const query = RoomModel.find();
    query.collection(RoomModel.collection);
    query.where({ _id: ObjectId(roomId), password });
    return query.exec()
      .then((result) => {
        if (result.length === 0) {
          const msg = 'room: 認証に失敗しました';
          Validator.raiseAuthenticationFailedError(msg);
        }
      })
  }
}