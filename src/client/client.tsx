'use strict';

import io from 'socket.io-client';

window.onload = () => {
  io('http://localhost:3001');
  const credential: null | { hash: string, roomId: string } = pickAuthFromCookie();
  if (!credential) {
    /* cookieがない場合 */
    /* パスワード入力フォームを表示 */
  }
  /* cookieからトークンを取得して検証 */
  /* NGの場合 */
  /* cookieを削除 */
  /* パスワード入力フォームを表示 */
};

function pickAuthFromCookie() {
  const cookie: string = document.cookie;
  const cookies = cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    let c = cookies[i];
    const [key, value] = c.split('=');
    if (key.trim() === 'mabo_auth') {
      const credential: { hash: string, roomId: string } = JSON.parse(decodeURIComponent(value));
      return credential
    }
  }
  return null;
}