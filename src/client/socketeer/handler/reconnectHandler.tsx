'use strict';
import { MaboToast } from "../../MaboToast";

export function reconnectHandler(socket, attempts:number) {
  const msg = '再接続しました';
  MaboToast.success(msg)
  console.log(`reconnection succeed. ${socket.id} attempts ${attempts}`);
}