"use strict";
const electron      = require('electron');
const app           = electron.app;
const browserWindow = electron.BrowserWindow;
const webFrame      = electron.webFrame;
const Menu          = electron.Menu;

/*
 * メニュー設定
 */
const template = [
  {
    label  : 'Edit',
    submenu: [
      {role: 'undo'},
      {role: 'redo'},
      {type: 'separator'},
      {role: 'cut'},
      {role: 'copy'},
      {role: 'paste'},
      {role: 'pasteandmatchstyle'},
      {role: 'delete'},
      {role: 'selectall'}
    ]
  },
  {
    label  : 'View',
    submenu: [
      {role: 'reload'},
      {role: 'forcereload'},
      {role: 'toggledevtools'},
      {type: 'separator'},
      {role: 'resetzoom'},
      {role: 'zoomin'},
      {role: 'zoomout'},
      {type: 'separator'},
      {role: 'togglefullscreen'}
    ]
  },
  {
    role   : 'window',
    submenu: [
      {role: 'minimize'},
      {role: 'close'}
    ]
  },
  {
    role   : 'help',
    submenu: [
      {
        label: 'Learn More',
        click() {
          require('electron').shell.openExternal('https://electron.atom.io')
        }
      }
    ]
  }
];

if (process.platform === 'darwin') {
  template.unshift({
    label  : app.getName(),
    submenu: [
      {role: 'about'},
      {type: 'separator'},
      {role: 'services', submenu: []},
      {type: 'separator'},
      {role: 'hide'},
      {role: 'hideothers'},
      {role: 'unhide'},
      {type: 'separator'},
      {role: 'quit'}
    ]
  });
  
  // Edit menu
  template[1].submenu.push(
    {type: 'separator'},
    {
      label  : 'Speech',
      submenu: [
        {role: 'startspeaking'},
        {role: 'stopspeaking'}
      ]
    }
  );
  
  // Window menu
  template[3].submenu = [
    {role: 'close'},
    {role: 'minimize'},
    {role: 'zoom'},
    {type: 'separator'},
    {role: 'front'}
  ];
}


let pug = require('electron-pug')({pretty: true}, {});

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
  mainWindow = new browserWindow({width: 1200, height: 800, frame: true, title: 'Mabo'});
  mainWindow.loadURL(`file://${__dirname}/views/scenarios/list.pug`);
  
  /*
   * 開発ツールをデフォルトで開く
   */
  mainWindow.webContents.openDevTools();
  
  /*
   * メニュー設定
   */
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  
  mainWindow.on('closed', () => {
    mainWindow = null;
  })
});