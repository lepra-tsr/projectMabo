const mongoose = require('mongoose');
const {channelMongoSchema} = require('./schema');

export const ChannelModel = mongoose.model('Channel', channelMongoSchema);