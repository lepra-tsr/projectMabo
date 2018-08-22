const { MongoWrapper: mw } = require('../../../util/MongoWrapper');
const { BoardModel } = require('../../model/Board/Model');
const { PieceModel } = require('../../model/Piece/Model');

export async function getBoardEntity(roomId: string, socketFormat: boolean = false) {
  await mw.open()

  const condition = roomId ? { roomId } : {};
  const boardResult = await BoardModel.find().where(condition).exec();

  const boardIds = boardResult.map((r) => r._id.toString());
  const pieceResult = await PieceModel.find().where({ boardId: { $in: boardIds } }).exec();
  const result: any[] = [];
  for (let i_b = 0; i_b < boardResult.length; i_b++) {
    const b = boardResult[i_b];
    const pieces: any[] = [];
    for (let i_p = 0; i_p < pieceResult.length; i_p++) {
      const p = pieceResult[i_p];
      if (p.boardId !== b._id.toString()) { continue; }
      const piece = {
        _id: void 0,
        id: void 0,
        characterId: p.characterId,
        roomId: p.roomId,
        boardId: p.boardId,
        type: p.type,
        height: p.height,
        width: p.width,
        x: p.x,
        y: p.y,
      };
      if (socketFormat) {
        piece.id = p._id.toString();
      } else {
        piece._id = p._id.toString();
      }
      pieces.push(piece);
    }
    const board = {
      _id: void 0,
      id: void 0,
      roomId: b.roomId,
      height: b.height || 80,
      width: b.width || 80,
      pieces,
    }
    if (socketFormat) {
      board.id = b._id.toString();
    } else {
      board._id = b._id.toString();
    }
    result.push(board);
  }
  return result;
}