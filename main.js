
const electron = require('electron');
const url = require('url');
const path = require('path');

const { app, BrowserWindow, Menu, Tray } = electron;
let mainWindow;
let aboutWindow;
let tray = null;

app.disableHardwareAcceleration();

// Listen for app to be ready
app.on('ready', function() {
    // Create window
    mainWindow = new BrowserWindow({
        frame: false,
        width: 584,// 1200,
        height: 673, //633, //800,
        hasShadow: true,
        backgroundColor: '#444444',
        minHeight: 200,
        minWidth: 200,
        titleBarStyle: 'hidden',
        icon: path.join(__dirname, '/img/tb_icon-shadow.png'),
        resizable: false,
        title: 'Michael\'s Station Reciever Client',

        webPreferences: {
            preload: path.resolve(path.join(__dirname, 'preload.js'))
        }
    });

    // Load html into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slashes: true
    }));

    // Build menu from template
    //const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    
    // Insert menu
    //Menu.setApplicationMenu(mainMenu);

    // Called on window close
    mainWindow.on('closed', function() {
        app.quit();
        mainWindow = null;
    });

    // Gain focus
    mainWindow.on('focus', function () {
        mainWindow.webContents.send('func_focus', true);
    });

    // Lose focus
    mainWindow.on('blur', function () {
        mainWindow.webContents.send('func_focus', false);
    });

    tray = new Tray(path.join(__dirname, '/img/tb_icon-shadow.png'));
    tray.setToolTip('Michael\'s Radio Reciever App');

    /*
    tray.displayBalloon({
        title: 'Now Playing On Gold 104.3',
        content: 'Artist - Song'
    });*/
});

// Create the 'about-window'
var aboutWindow_visible = false;
global.createAboutWindow = function () {
    if (aboutWindow_visible) { return; }
    aboutWindow_visible = true;

    aboutWindow = new BrowserWindow({
        frame: false,
        width: 252,
        height: 200,
        backgroundColor: '#444444',
        icon: path.join(__dirname, '/img/tb_icon-shadow.png'),
        resizable: false,
        title: 'About',
    });

    // Load html into window
    aboutWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'aboutWindow.html'),
        protocol: 'file:',
        slashes: true
    }));

    aboutWindow.on('closed', function() {
        aboutWindow = null;
        aboutWindow_visible = false;
    });

    // Gain focus
    aboutWindow.on('focus', function () {
        aboutWindow.webContents.send('func_focus', true);
    });

    // Lose focus
    aboutWindow.on('blur', function () {
        aboutWindow.webContents.send('func_focus', false);
    });
}

global.showBalloon = function(songName) {
    tray.displayBalloon({
        icon: path.join(__dirname, '/img/tb_icon-shadow.png'),
        title: 'Now Playing On Gold 104.3',
        content: (songName + '\nMichael\'s Radio Reciever App!')
    });
}

// Create menu template
const mainMenuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Quit',
                accelerator: process.platform == 'darwin' ? 'Command + Q' : 'Ctrl + Q',
                click () {
                    app.quit();
                },
            },
            {
                label: 'Dev-Tools',
                accelerator: 'Ctrl + Shift + I',
                click() {
                    // Open dev tools
                    mainWindow.webContents.openDevTools();
                },
            }
        ]
    }
];
