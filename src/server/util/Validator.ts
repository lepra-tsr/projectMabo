"use strict";

interface IRule {
  type: string;
  exist?: boolean;
  regexp?: RegExp;
  min?: number;
  max?: number;
}

interface IRuleOverride {
  exist?: boolean;
}

interface IRuleConfig {
  type: string;
  regexp?: RegExp;
  min?: number;
  max?: number;
}

interface IRuleAlias {
  equalTo: string;
}
interface IRecursiveRule {
  [key: string]: IRecursiveRule | IRuleAlias | IRuleConfig;
}


const baseRule: IRecursiveRule = {
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
  token: {
    roomId: {
      equalTo: 'room.id',
    },
    hash: {
      type: 'string',
      regexp: /[0-9a-fA-F]{64}/,
    },
  },
  user: {
    socketId: {
      type: 'string',
      regexp: /[a-zA-Z0-9-_=/+]{20}/
      // sample: DU0UIfDRabEF22TpAAAA
      // mui_T-zfM1s9AtUKAAAi
    },
    name: {
      type: 'string',
      regexp: /[^\n]{1,20}/,
    }
  },
  chat: {
    roomId: {
      equalTo: 'room.id',
    },
    socketId: {
      equalTo: 'user.socketId',
    },
    userName: {
      type: 'string',
      regexp: /[^\n]{1,20}/,
    },
    channelId: {
      type: 'string',
      regexp: /[0-9a-fA-F]{24}/,
    },
    avatarId: {
      type: 'string',
      regexp: /[0-9a-fA-F]{24}/,
    },
    content: {
      type: 'string',
      regexp: /.{0,200}/,
    },
    faceId: {
      type: 'string',
      regexp: /[0-9a-fA-F]{24}/,
    },
    characterId: {
      type: 'string',
      regexp: /[0-9a-fA-F]{24}/,
    },
    characterName: {
      type: 'string',
      regexp: /[^\n]{20}/,
    },
  },
  channel: {
    roomId: {
      equalTo: 'room.id',
    },
    name: {
      type: 'string',
      regexp: /[^\n]{1,20}/,
    }
  },
  character: {
    roomId: {
      type: 'string',
      regexp: /[0-9a-fA-F]{24}/,
    },
    columnsJson: {
      type: 'string',
    },
    name: {
      type: 'string',
      regexp: /[^\n]{1,20}/,
    },
    showOnResource: {
      type: 'boolean',
    },
    text: {
      type: 'string',
      regexp: /.{0,200}/,
    },
  },
  board: {
    id: {
      type: 'string',
      regexp: /[0-9a-fA-F]{24}/,
    },
    roomId: {
      equalTo: 'room.id'
    },
    name: {
      type: 'string',
      regexp: /[^\n]{1,20}/,
    },
    height: {
      type: 'number',
      min: 100,
      max: 1800,
    },
    width: {
      type: 'number',
      min: 100,
      max: 1800,
    },
  },
  piece: {
    id: {
      type: 'string',
      regexp: /[0-9a-fA-F]{24}/,
    },
    roomId: {
      equalTo: 'room.id',
    }
  }
};

export class Validator {
  static test(args: Array<[string, any, IRuleOverride]>) {
    for (let i = 0; i < args.length; i++) {
      const [key, v, _rule = {}] = args[i];
      const br: IRuleConfig = Validator.digWithPath(baseRule, key);
      const rule: IRule = Object.assign(_rule, br);

      if (Object.keys(rule).length === 0) {
        throw new Error(`implementation error:${key} バリデーション未定義`);
      }

      if (rule.hasOwnProperty('exist')) {
        if (rule.exist && typeof v === 'undefined') {
          Validator.raiseValidationError(`exist:${key} 必須パラメータです`);
        }
      }
      if (rule.hasOwnProperty('type')) {
        if (typeof v !== rule.type) {
          Validator.raiseValidationError(`type:${key} 型が${rule.type}ではありません`);
        }

        if (rule.type === 'string' && rule.hasOwnProperty('regexp')) {
          if (rule.regexp && !rule.regexp.test(v)) {
            Validator.raiseValidationError(`regexp:${key} 正規表現${rule.regexp}にマッチしません`)
          }
        }

        if (rule.type === 'number' && rule.hasOwnProperty('min') && typeof rule.min === 'number') {
          if (rule.min > v) {
            Validator.raiseValidationError(`min: ${key} 値の最小値は${rule.min}です`)
          }
        }

        if (rule.type === 'number' && rule.hasOwnProperty('max') && typeof rule.max === 'number') {
          if (rule.max < v) {
            Validator.raiseValidationError(`max: ${key} 値の最大値は${rule.max}です`)
          }
        }
      }
    }
    return true;
  }

  static digWithPath(rule, path: string): IRuleConfig {
    const paths: Array<string> = path.split('.');
    let r = rule;
    for (let i = 0; i < paths.length; i++) {
      let p = paths[i];
      if (!r.hasOwnProperty(p)) {
        throw new Error(`implementation error: バリデーション未定義 (${path})`);
      }
      r = r[p];
    }

    if (r.hasOwnProperty('equalTo') && (typeof r['equalTo'] === 'string')) {
      const path: string = r['equalTo'];
      r = Validator.digWithPath(baseRule, path);
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

const { RoomModel } = require('../schema/model/Room/Model');
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

const { UserModel } = require('../schema/model/User/Model');

export class ConnectionValidator {
  static validateConnectionExists(socketId: string) {
    const query = UserModel.find();
    query.collection(UserModel.collection);
    query.where({ socketId });
    return query.exec()
      .then((result) => {
        if (result.length === 0) {
          const msg = 'connection: 接続が見つかりません';
          Validator.raiseResourceNotFoundError(msg);
        }
      });
  }
}