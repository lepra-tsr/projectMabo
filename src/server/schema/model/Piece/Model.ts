const mongoose = require('mongoose');
const { pieceMongoSchema } = require('./schema');

export const PieceModel = mongoose.model('Piece', pieceMongoSchema);