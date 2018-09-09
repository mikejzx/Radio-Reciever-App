var lastSongName = '';
var overflown = false;
var overflownElements = [];
var dummies = [];
var elements = [];
var dropdowns = [];
var scrollPos = 0;
var callCount = 1;
var elementsChanged = false;

var songInfoList = [];
var songTimeList = [];
var songCoverList = [];
var lastSongInfo = '';
var lastSongTime = '';
var lastSongCover = '';

window.onload = function () {
    firstTick();
    setInterval(tick, 3000);

    document.onmousedown = documentMouseDown;
};

function tick() {
    overflowTick();

    // Only do the subsequent code on every second call
    if (callCount < 1) {
        callCount++;
        return;
    }
    else {
        callCount = 0;
    }

    // Retrieve JSON file.
    $.getJSON('http://media.arn.com.au/XML-JSON.aspx?source=www.gold1043.com.au&feedUrl=xml/gold1043_now.xml', function (data) {
        // Current title
        var songNameCur = data.on_air.now_playing.audio.title.value;
        if (songNameCur == lastSongName) {
            // Return if song title is still the same - Don't need to change the list.
            return;
        }

        // Add last song to song list.
        songInfoList.splice(0, 0, lastSongInfo);
        songTimeList.splice(0, 0, lastSongTime);
        songCoverList.splice(0, 0, lastSongCover);

        // Used for returning later.
        lastSongName = songNameCur;
        lastSongInfo = data.on_air.now_playing.audio.artist.value + " - " + data.on_air.now_playing.audio.title.value;
        var lastSongTimeRaw = data.on_air.now_playing.audio.played_datetime.value;
        lastSongTime = lastSongTimeRaw.substring(11, lastSongTimeRaw.length).substring(0, 5);
        lastSongCover =  data.on_air.now_playing.audio.coverart.value;

        // Clear overflown elements
        overflownElements = [];
        // Clear dummies
        dummies = [];
        // Clear regular elements
        elements = [];
        // Clear all dropdowns
        dropdowns = [];
        document.getElementById('dropdown-container').innerHTML = '';

        // Live artist name and song name from JSON file.
        var current = `${data.on_air.now_playing.audio.artist.value} - ${data.on_air.now_playing.audio.title.value}`;

        // Clear schedule children.
        document.getElementById('schedule-main').innerHTML = '';

        // Create the main live node.
        var liveCoverUrl = data.on_air.now_playing.audio.coverart.value;
        CreateLiveNode(current, liveCoverUrl);

        // Add regular nodes foreach in songList.
        CreateNodes();

        // Make true so overflow tick will execute.
        elementsChanged = true;
    });
}

function CreateNodes () {
    for (var i = 0; i < songInfoList.length; i++) {
        CreateRegularNode(songInfoList[i], songTimeList[i], i, songCoverList[i]);
    }
    //CreateRegularNode('Artist Name - Very long song title that overflows the friggin thing.', '14:37', 69);
}

function firstTick () {
    $.getJSON('http://media.arn.com.au/XML-JSON.aspx?source=www.gold1043.com.au&feedUrl=xml/gold1043_now.xml', function (data) {
        var prev = data.on_air.previously_played.audio;
        for (var i = 0; i < prev.length; i++) {
            songInfoList.push(prev[i].artist.value + ' - ' + prev[i].title.value);
            var timeRaw = prev[i].played_datetime.value;
            songTime = timeRaw.substring(11, timeRaw.length).substring(0, 5);
            songTimeList.push(songTime);
            songCoverList.push(prev[i].coverart.value);
        }

        var songNameCur = data.on_air.now_playing.audio.title.value;
        lastSongName = songNameCur;
        lastSongInfo = data.on_air.now_playing.audio.artist.value + " - " + songNameCur;
        var lastSongTimeRaw = data.on_air.now_playing.audio.played_datetime.value;
        lastSongTime = lastSongTimeRaw.substring(11, lastSongTimeRaw.length).substring(0, 5);
        lastSongCover = data.on_air.now_playing.audio.coverart.value;

        document.getElementById('dropdown-container').innerHTML = '';
        document.getElementById('schedule-main').innerHTML = '';
        var liveCoverUrl = data.on_air.now_playing.audio.coverart.value;
        var current = `${data.on_air.now_playing.audio.artist.value} - ${data.on_air.now_playing.audio.title.value}`;
        CreateLiveNode(current, liveCoverUrl);

        CreateNodes();
    });
}

function CreateLiveNode (songName, coverUrl) {
    songName = correctSpellingMistakes(songName);
    var accentedSongName = correctLetterAccents (songName);

    var live = document.createElement('div');
    live.textContent = '';
    live.setAttribute('class', 'schedule-item acrylic dropdown');
    live.setAttribute('id', 'schedule-live');
    live.setAttribute('onclick', 'showDropdown(\'DROPDOWN_LIVE\')');
    live.setAttribute('onmouseover', 'changePointer(true);');
    live.setAttribute('onmouseleave', 'changePointer(false);');

    var liveTime = document.createElement('div');
    liveTime.setAttribute('id', 'schedule-time');
    liveTime.setAttribute('style', 'background-image: url(img/time-live.png)');
    liveTime.setAttribute('class', 'dropdown-zone');
    live.appendChild(liveTime);

    var liveTimeSpan = document.createElement('span');
    liveTimeSpan.textContent = 'LIVE';
    liveTimeSpan.setAttribute('class', 'dropdown-zone');
    liveTime.appendChild(liveTimeSpan);

    // Cover art
    var coverImg = document.createElement('div');
    coverImg.setAttribute('id', 'schedule-cover');
    coverImg.setAttribute('style', 'background-image: url(\'' + coverUrl + '\')');
    live.appendChild(coverImg);

    var liveText = document.createElement('div');
    liveText.setAttribute('id', 'schedule-text');
    liveText.setAttribute('class', 'dropdown-zone');
    live.appendChild(liveText);

    var textA = document.createElement('a');
    textA.textContent = accentedSongName;
    textA.setAttribute('class', 'dropdown-zone');
    liveText.appendChild(textA);

    // When adding dropdown make sure the songName != 'Gold 104.3 - Better Music and More of It'
    // Dropdown menu
    if (songName != 'Gold 104.3 - Better Music and More of It') {
        var dropdown = document.createElement('div');
        dropdown.setAttribute('id', 'DROPDOWN_LIVE');
        dropdown.setAttribute('class', 'dropdown-content');

        var copyLink = document.createElement('a');
        copyLink.textContent = "Copy song name";
        copyLink.setAttribute('onclick', `CopySongName(\'${songName}\')`);
        dropdown.appendChild(copyLink);
        var spotifyLink = document.createElement('a');
        spotifyLink.href = "spotify:search:" + escape(songName);
        spotifyLink.textContent = "Open in Spotify";
        dropdown.appendChild(spotifyLink);
        var ytLink = document.createElement('a');
        ytLink.href = "https://www.youtube.com/results?search_query=" + escape(songName);
        ytLink.textContent = "Open in YouTube";
        dropdown.appendChild(ytLink);
        var goLink = document.createElement('a');
        goLink.href = "https://www.google.com/search?q=" + escape(songName);
        goLink.textContent = "Google this Song";
        dropdown.appendChild(goLink);

        document.getElementById('dropdown-container').appendChild(dropdown);
    }
    else {
        // Set name to a more correct name
        textA.textContent = 'Advertisements';
        textA.setAttribute('style', 'color: #888');
    }

    var multiplyOverlay = document.createElement('div');
    multiplyOverlay.setAttribute('id', 'multiply-active');
    multiplyOverlay.setAttribute('class', 'dropdown-zone');
    live.appendChild(multiplyOverlay);

    var glossOverlay = document.createElement('div');
    glossOverlay.setAttribute('id', 'gloss-overlay-live');
    glossOverlay.setAttribute('class', 'dropdown-zone');
    live.appendChild(glossOverlay);

    var addOverlay = document.createElement('div');
    addOverlay.setAttribute('id', 'additional-active');
    addOverlay.setAttribute('class', 'dropdown-zone');
    glossOverlay.appendChild(addOverlay);

    var dummy = document.createElement('div');
    dummy.setAttribute('id', 'schedule-text-dummy');
    dummy.textContent = accentedSongName;
    liveText.appendChild(dummy);

    // Add dummy and corresponding text to arrays.
    dummies.push(dummy);
    elements.push(liveText);

    document.getElementById('schedule-main').appendChild(live);
}

function CreateRegularNode (songName, timePlayed, idx, coverUrl) {
    songName = correctSpellingMistakes(songName);

    var reg = document.createElement('div');
    reg.textContent = '';
    reg.setAttribute('class', 'schedule-item acrylic dropdown');
    reg.setAttribute('onclick', 'showDropdown(\'DROPDOWN_' + idx + '\')');
    reg.setAttribute('onmouseover', 'changePointer(true);');
    reg.setAttribute('onmouseleave', 'changePointer(false);');

    var regTime = document.createElement('div');
    regTime.setAttribute('id', 'schedule-time');
    regTime.setAttribute('class', 'dropdown-zone');
    reg.appendChild(regTime);

    var regTimeSpan = document.createElement('span');
    regTimeSpan.textContent = timePlayed;
    regTimeSpan.setAttribute('class', 'dropdown-zone');
    regTime.appendChild(regTimeSpan);

    // Cover art
    var coverImg = document.createElement('div');
    coverImg.setAttribute('id', 'schedule-cover');
    coverImg.setAttribute('style', 'background-image: url(\'' + coverUrl + '\')');
    reg.appendChild(coverImg);

    var regText = document.createElement('div');
    regText.setAttribute('id', 'schedule-text');
    regText.setAttribute('class', 'dropdown-zone');
    reg.appendChild(regText);

    // Actual text
    var textA = document.createElement('a');
    textA.textContent = correctLetterAccents (songName);
    textA.setAttribute('class', 'dropdown-zone');
    regText.appendChild(textA);

    // Dropdown menu
    if (songName != 'Gold 104.3 - Better Music and More of It') {
        var dropdown = document.createElement('div');
        dropdown.setAttribute('id', 'DROPDOWN_' + idx);
        dropdown.setAttribute('class', 'dropdown-content');

        // Copy to clip-board
        var copyLink = document.createElement('a');
        copyLink.textContent = "Copy song name";
        copyLink.setAttribute('onclick', `CopySongName(\'${songName}\')`);
        dropdown.appendChild(copyLink);
        // Open in Spotify
        var spotifyLink = document.createElement('a');
        spotifyLink.href = "spotify:search:" + escape(songName);
        spotifyLink.textContent = "Open in Spotify";
        dropdown.appendChild(spotifyLink);
        // Open in YouTube
        var ytLink = document.createElement('a');
        ytLink.href = "https://www.youtube.com/results?search_query=" + escape(songName);
        ytLink.textContent = "Open in YouTube";
        dropdown.appendChild(ytLink);
        // Open in Google
        var goLink = document.createElement('a');
        goLink.href = "https://www.google.com/search?q=" + escape(songName);
        goLink.textContent = "Google this Song";
        dropdown.appendChild(goLink);

        document.getElementById('dropdown-container').appendChild(dropdown);
    }
    else {
        // Set name to a more correct name
        textA.textContent = 'Advertisements';
        textA.setAttribute('style', 'color: #888');
    }
    //reg.appendChild(dropdown);

    // Gloss overlay
    var glossOverlay = document.createElement('div');
    glossOverlay.setAttribute('id', 'gloss-overlay');
    glossOverlay.setAttribute('class', 'dropdown-zone');
    reg.appendChild(glossOverlay);

    var dummy = document.createElement('div');
    dummy.setAttribute('id', 'schedule-text-dummy');
    dummy.textContent = songName;
    regText.appendChild(dummy);

    dummies.push(dummy);
    elements.push(regText);

    document.getElementById('schedule-main').appendChild(reg);
}

function CopySongName (songName) {
    var dummyElement = document.createElement('textarea');
    dummyElement.value = songName;
    dummyElement.setAttribute('style', 'opacity: 0');
    document.body.appendChild(dummyElement);
    dummyElement.select();
    document.execCommand('copy');
    document.body.removeChild(dummyElement);
}

function overflowTick () {
    // Tried to get this to only happen on element change. Didn't work tho ;(
    overflown = false;

    // Check if overflown or not.
    for (var i = 0; i < dummies.length; i++) {
        var wid = dummies[i].offsetWidth;
        if (wid > 410 - 10 - 32) {
            overflownElements.push(elements[i]);
            overflown = true;
        }
    }

    if (!overflown) { return; }

    // Scroll overflown text left and right.
    if (scrollPos == 0) {
        // Scroll right
        for (var i = 0; i < overflownElements.length; i++) {
            $(overflownElements[i]).stop();
            $(overflownElements[i]).animate({ scrollLeft: -(overflownElements[i].offsetWidth) }, 4000, 'linear');
        }

        scrollPos = 1;
        return;
    }
    else {
        // Scroll left
        for (var i = 0; i < overflownElements.length; i++) {
            $(overflownElements[i]).stop();
            $(overflownElements[i]).animate({ scrollLeft: (overflownElements[i].offsetWidth) }, 4000, 'linear');
        }
        scrollPos = 0;
        return;
    }
}

// Gold 104.3 has a couple of songs with mis-spelt names. (The pricks there can't spell for shit) This corrects them in the display.
// (Probably not a complete list, but the ones I noticed are here: )
function correctSpellingMistakes(song) {
    if (song == 'Kim Wilde - Chequred Love') { return 'Kim Wilde - Chequered Love'; }
    if (song == 'Nena - 99 Luftballoons') { return 'Nena - 99 Luftballons' }
    if (song == 'Billy Ocean - When The Going Gets Tough, The Tough Ge') { return 'Billy Ocean - When the Going Gets Tough, the Tough Get Going';}
    if (song == 'Thompson Twins - Doctor, Doctor') return 'Thompson Twins - Doctor! Doctor!';
    if (song == 'Sonia Dada - You Don\'t Treat Me No Good*') return 'Sonia Dada - (Lover) You Don\'t Treat Me No Good';
    if (song == 'Trio - Da Da Da') return 'Trio - Da da da, ich lieb\' dich nicht du liebst mich nicht aha aha aha';
    return song;
}

// For songs/artists that have accents in their name. Is seperate because there were bugs when using these names in links.
function correctLetterAccents (song) {
    if (song.substring(0, 11) == 'Motley Crue') { return ('Mötley Crüe' + song.substring(11, song.length)); }
    return song;
}