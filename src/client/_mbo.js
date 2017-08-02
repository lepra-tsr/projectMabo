"use strict";

module.exports = {
    DEBUG_TRACE: true,
    /*
     * Ajaxの基点とSocket
     */
    MABO_ENDPOINT            : 'http://192.168.99.100:3000/',
    SOCKET_EP                : 'http://192.168.99.100:3000',
    
    /*
     * API
     */
    API_EP_LOGS : '/logs',
    
    /*
     * IndexedDB
     */
    INDEXED_DB          : 'mabo',
    INDEXED_OBJECT_STORE: 'chat',
    
    GRID_THROTTLE            : 3000,
    FUKIDASHI_MAX_LENGTH     : 30,
    FUKIDASHI_THROTTLE       : 300
};