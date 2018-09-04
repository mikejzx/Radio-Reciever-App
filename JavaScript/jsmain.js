
// This code is used ON THE PAGE. NOT THE APP ITSELF

const electron = require('electron');
const remote = electron.remote;
const win = remote.getCurrentWindow();

function closeWindow () {
    win.close();
}

function minimiseWindow () {
    win.minimize();
}

function restoreWindow () {
    if (win.isMaximized()) {
        win.unmaximize();
        $('#restorebutton-icon').css("margin-top", "-15px");
        $('#restorebutton-icon').css("width", "12px");
        $('#restorebutton-icon').css("height", "12px");
        $('#restorebutton-icon').css("background-image", "url(img/restore-up.png)");
    }
    else {
        win.maximize();
        $('#restorebutton-icon').css("margin-top", "-16px");
        $('#restorebutton-icon').css("width", "14px");
        $('#restorebutton-icon').css("height", "14px");
        $('#restorebutton-icon').css("background-image", "url(img/restore-down.png)");
    }
}