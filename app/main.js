"use strict";
const electron      = require('electron');
const app           = electron.app;
const browserWindow = electron.BrowserWindow;
const webFrame      = electron.webFrame;

let pug = require('electron-pug')({pretty:true},{});

let mainWindow = null;

/*
 * ズーム禁止
 */
// webFrame.setZoomLevelLimits(1, 1);

app.on('window-all-closed', () => {
    /*
     * 全てのウィンドウが閉じた場合、OSX以外は終了する
     */
    app.quit();
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