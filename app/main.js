"use strict";
const electron      = require('electron');
const app           = electron.app;
const browserWindow = electron.BrowserWindow;

let pug = require('electron-pug')({pretty:true},{});

let mainWindow = null;

app.on('window-all-closed', () => {
    if (process.platform != 'darwin') {
        app.quit();
    }
});

app.on('ready', () => {
    /*
     * Chromium起動
     */
    mainWindow = new browserWindow({width: 800, height: 600});
    mainWindow.loadURL(`file://${__dirname}/views/scenarios/list.pug`);
    
    mainWindow.webContents.openDevTools();
    
    mainWindow.on('closed', () => {
        mainWindow = null;
    })
});