
const electron = require('electron');
const url = require('url');
const path = require('path');

const { app, BrowserWindow, Menu } = electron;
let mainWindow;

// Listen for app to be ready
app.on('ready', function() {
    // Create window
    mainWindow = new BrowserWindow({
        frame: false,
        width: 584,//1200,
        height: 633,//800,
        hasShadow: true,
        //backgroundColor: '#444444',
        //minHeight: 200,
        //minWidth: 200,
        icon: path.join(__dirname, '/img/tb_icon-shadow.png'),
        resizable: false,
        //transparent: true,
    });

    // Load html into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slashes: true
    }));

    // Build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    
    // Insert menu
    Menu.setApplicationMenu(mainMenu);

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
});

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