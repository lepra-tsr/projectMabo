const log4js = require('log4js');
log4js.configure({
  appenders:
  {
    console: {
      type:'console'
    },
    everything: {
      type: 'dateFile',
      filename: 'logs/whole_log',
      pattern: '_yyyy_MM_dd.log',
      daysToKeep: 21,
    },
    socket: {
      type: 'dateFile',
      filename: 'logs/socket_log',
      pattern: '_yyyy_MM_dd.log',
      daysToKeep: 21,
    },
  },
  categories: {
    default: { appenders: ['everything','console'], level: 'debug' },
    socket: { appenders: ['everything','console','socket'], level: 'debug' },
  },
  replaceConsole: true
})
export const lg = log4js.getLogger();
export const slg = log4js.getLogger('socket');
lg.level = 'debug';
slg.level = 'debug';