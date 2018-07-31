"use strict";

const baseRule = {
  room: {
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
}
