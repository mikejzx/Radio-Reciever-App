// Common functions through all windows

const electron = require('electron');
const remote = electron.remote;
const win = remote.getCurrentWindow();

function closeWindow () {
    win.close();
}

function minimiseWindow () {
    //$('.minimise-btn').css('pointer-events', 'none');
    win.minimize();
}

// On click of context menus here:
function exitApplication () {
    closeDropdowns();
    console.log('exit');

    window.close();
}

function openDevTools () {
    closeDropdowns();
    console.log('dev tools');

    const rem = require('electron').remote;
    var wnd = rem.getCurrentWindow();
    wnd.webContents.openDevTools();
}

function openAboutWindow () {
    closeDropdowns();
    console.log('about');

    let { remote } = require('electron');
    remote.getGlobal("createAboutWindow")();
}

// Caption bar stuff
var ipc = require('electron').ipcRenderer;
ipc.on('func_focus', function(e, msg) {
    var el = document.getElementsByTagName('html')[0];

    if (msg) {
        // Set colours to normal on focus
        el.style.setProperty("--bordercolour", "#2f2f2f");
        el.style.setProperty("--buttonsopacity", "1");
        document.getElementById("closebutton-normal").style.setProperty('filter', 'grayscale(0%)');
        document.getElementById("closebutton-normal").style.setProperty('opacity', '1');
        checkForDropdownClose();
    }
    else {
        // Out of focus
        el.style.setProperty("--bordercolour", "#222");
        el.style.setProperty("--buttonsopacity", "0.5");
        document.getElementById("closebutton-normal").style.setProperty('filter', 'grayscale(80%)');
        document.getElementById("closebutton-normal").style.setProperty('opacity', '0.5');
        checkForDropdownClose();
    }
});