test('roomCreate_success_00', () => {
  const {createRoom} = require('../../schema/mutation/room/create');
  const {resolve} = createRoom;

  const newRoom = {
    title: 'testcase title s_00',
    description: '電気回路における電圧は水流の類推で説明される事がある（但し、異なる点がある）。網状に繋がったパイプを用意し、ポンプによって水を流す。この際電圧はパイプの2点間の水圧の差に相当する。水圧の差が存在すれば、水は水圧が高い点から低い点に流れることができ、例えばタービンを回してエネルギーを取り出すことができる。同様にポンプの代わりに電池で電圧を生じさせ、電流を発生させることで仕事をさせることができる。例えば、自動車のバッテリーで電流を発生させ、セルモーターを駆動することができる。ポンプが動作していない場合は水圧差が生じず、タービンも回せない。自動車のバッテリーが空ならセルモーターを回せないのと同じである。この水流による類推は、いくつかの電気的概念を理解するのに有効である。水流の仕事量は圧力と流れる水の体積の積で表せる。同様に電気回路での電子や他の電荷担体の移動による仕事量は、電圧（古くは "electric pressure" と呼んだ）と移動する電荷の量の積で表せる（電力の定義）。電圧は可能な仕事量を測る便利な手段である。2点間の圧力（水圧、電圧）の差が大きいほど、流れ（水流、電流）も大きくなる（オームの法則）。 ただし、回路における電子の運動エネルギーは抵抗における格子振動や電磁波に変わり逃げていくエネルギーに比べはるかに小さく事実上無視できるが、水流の場合は無視することができないことに留意する必要がある。',
    password: '#test0111',
  };

  const args = [{}, newRoom];
  return resolve(...args)
    .then((result) => {
      expect(result.title).toBe(newRoom.title);
      expect(result.description).toBe(newRoom.description);
      expect(result.password).toBe(newRoom.password);
    })
    .catch((e) => {
      throw e;
    });
});

test('roomCreate_success_01', () => {
  const {createRoom} = require('../../schema/mutation/room/create');
  const {resolve} = createRoom;

  const newRoom = {
    title: 'testcase title s_01',
    password: '#test0111',
  };

  const args = [{}, newRoom];
  return resolve(...args)
    .then((result) => {
      expect(result.title).toBe(newRoom.title);
      expect(result.description).toBe('');
      expect(result.password).toBe(newRoom.password);
    })
    .catch((e) => {
      throw e;
    });
});

test('roomCreate_fail_00', () => {
  const {createRoom} = require('../../schema/mutation/room/create');
  const {resolve} = createRoom;

  const newRoom = {
    // title: 'testcase title',
    description: 'desc f_00',
    password: '#test0111',
  };

  const args = [{}, newRoom];
  return resolve(...args)
    .catch(e => expect(e.message)
      .toMatch(/^validation error: /))
});
