
// This code is used ON THE PAGE. NOT THE APP ITSELF

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

// Make sure links only open in external programs like Firefox, Spotify, etc ... not in main window -->
let shell = require('electron').shell
    document.addEventListener('click', function (event) {
    if (event.target.tagName === 'A' && event.target.href.startsWith('http')) {
        event.preventDefault()
        shell.openExternal(event.target.href)
    }
});

// Dropdown stuff
var clicking = false;
var mousex = 0;
var mousey = 0;

function showDropdown(a) {
    closeDropdowns();
    
    document.getElementById(a).style.setProperty('visibility', 'visible');
    document.getElementById(a).style.setProperty('opacity', '1');

    clicking = true;
}

//window.onclick = function(event) {
    //checkForDropdownClose();
//}

function documentMouseDown (e) {
    closeDropdowns ();
    if(event.target.matches('.dropdown-content a')) {
        //console.log('returning from documentMouseDown. [target is .dropdown-content a]');
        return;
    }

    //console.log(event.target.classList);
    if ((!event.target.classList.contains('dropdown') && !event.target.classList.contains('dropdown-zone')) || event.target.classList.contains('dropdown-fixed')) {
        //console.log('returning from documentMouseDown. [class list matches exclusion]');
        return;
    }

    if (!e) { e = window.event; }

    if (e.pageX == null && e.clientX != null) {
        var doc = document.documentElement, body = document.body;
        e.pageX = e.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc.clientLeft || 0);
        e.pageY = e.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc.clientTop || 0);
    }

    mousex = e.pageX;
    mousey = e.pageY;

    var MAX_X = document.body.clientWidth;
    if (mousex + 160 > MAX_X) {
        mousex = MAX_X - 160;
    }

    var dropdowns = document.getElementsByClassName('dropdown-content');
    for (var i = 0; i < dropdowns.length; i++) {
        var open = dropdowns[i];
        if (!open.classList.contains('fixed-dropdown')) {
            open.style.setProperty('left', mousex + 'px');
            open.style.setProperty('top', mousey + 'px');
        }
    }
}

function checkForDropdownClose () {
    //if(!event.target.matches('.dropdown')) {
        if (clicking) {
            clicking = false;
            return;
        }

        closeDropdowns ();
    //}
}

function closeDropdowns () {
    var dropdowns = document.getElementsByClassName('dropdown-content');
    var alpha = 1.0;

    for (var i = 0; i < dropdowns.length; i++) {
        var open = dropdowns[i];

        open.style.setProperty('opacity', '0');
        open.style.setProperty('visibility', 'hidden');
    }
}

function changePointer(newVal) {
    if (newVal) {
        document.body.style.cursor = "pointer";
    }
    else {
        document.body.style.cursor = "default";
    }
}