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
var prevSongName = 'Loading...';
var prevArtistName = 'Loading...';

window.onload = function () {
    firstTick();
    setInterval(tick, 3000);

    UpdateTitle('Mike\'s Radio Reciever app');

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

    // SmoothFM: https://www.smooth.com.au/smooth/ajax/media_bar/smooth915?ajax_ts=1537765293778

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

        // Update the title/window caption
        UpdateTitle(lastSongInfo);

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
        SetPlayer(data.on_air.now_playing.audio.title.value, data.on_air.now_playing.audio.artist.value, liveCoverUrl);

        // Create the next node if applicable
        var nextName = `${data.on_air.up_next.audio[0].artist.value} - ${data.on_air.up_next.audio[0].title.value}`;
        var nextCoverUrl = data.on_air.up_next.audio[0].coverart.value;
        CreateUpnextNode(nextName, nextCoverUrl);

        // Add regular nodes foreach in songList.
        CreateNodes();

        // Make true so overflow tick will execute.
        elementsChanged = true;

        // Animate player-text.
        //$('player-title-text').stop();
        //$('player-title-text').animate({ opacity: 0.0 }, 4000, 'linear');
    });
}

function CreateNodes () {
    for (var i = 0; i < songInfoList.length; i++) {
        CreateRegularNode(songInfoList[i], songTimeList[i], i, songCoverList[i]);
    }

    //CreateRegularNode('Artist Name - Very long song title that overflows the friggin thing.', '14:37', 69);
    //CreateRegularNode('Cranberries - Zombie', '2:36', 6969);
    //CreateRegularNode('A,Ha - Take On Me', 'Test', 6970);
    //CreateRegularNode('Frankie Goes To Hollywood - Relax (Come Fighting)', 'Test', 6971);
    //CreateRegularNode('B,52\'s - Roam', '69:69', 6972);
    //CreateRegularNode('Deee,Lite - Groove Is In The Heart', '69:69', 6973);
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
        UpdateTitle(lastSongInfo);
        var lastSongTimeRaw = data.on_air.now_playing.audio.played_datetime.value;
        lastSongTime = lastSongTimeRaw.substring(11, lastSongTimeRaw.length).substring(0, 5);
        lastSongCover = data.on_air.now_playing.audio.coverart.value;

        document.getElementById('dropdown-container').innerHTML = '';
        document.getElementById('schedule-main').innerHTML = '';
        var liveCoverUrl = data.on_air.now_playing.audio.coverart.value;
        var current = `${data.on_air.now_playing.audio.artist.value} - ${data.on_air.now_playing.audio.title.value}`;
        CreateLiveNode(current, liveCoverUrl);
        SetPlayer(data.on_air.now_playing.audio.title.value, data.on_air.now_playing.audio.artist.value, liveCoverUrl);

        var nextName = `${data.on_air.up_next.audio[0].artist.value} - ${data.on_air.up_next.audio[0].title.value}`;
        var nextCoverUrl = data.on_air.up_next.audio[0].coverart.value;
        CreateUpnextNode(nextName, nextCoverUrl);

        // For testing the advertisement bullshit.
        //lastSongName = 'Better Music and More of It';
        //lastSongInfo = 'Gold 104.3 - Better Music and More of It';
        //lastSongTime = '69:69';
        //CreateLiveNode('Gold 104.3 - Better Music and More of It', liveCoverUrl);

        CreateNodes();
    });
}

function UpdateTitle (lastSongInfo) {
    var tit = correctLetterAccents(correctSpellingMistakes(lastSongInfo));
    document.getElementsByTagName("title")[0].innerHTML = tit;
}

function CreateLiveNode (songName, coverUrl) {
    songName = correctSpellingMistakes(songName);
    var finalSongName = correctLetterAccents (songName);

    // Show balloon tip to indicate that it's changed especially if it's minimised
    // (Not actually related to the live node at all)
    let {remote} = require('electron');
    remote.getGlobal('showBalloon')(finalSongName);

    var live = document.createElement('div');
    live.textContent = '';
    live.setAttribute('class', 'schedule-item acrylic dropdown');
    live.setAttribute('id', 'schedule-live');
    if (songName != 'Gold 104.3 - Better Music and More of It') {
        live.setAttribute('onclick', 'showDropdown(\'DROPDOWN_LIVE\')');
    }
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
    textA.textContent = finalSongName;
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
        copyLink.setAttribute('onclick', 'CopySongName(\'' + escapeChars(songName) + '\')');
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
        goLink.href = "https://duckduckgo.com/?q=" + escape(songName);
        goLink.textContent = "DuckDuckGo this Song";
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
    dummy.textContent = finalSongName;
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
    if (songName != 'Gold 104.3 - Better Music and More of It') {
        reg.setAttribute('onclick', 'showDropdown(\'DROPDOWN_' + idx + '\')');
    }
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
        copyLink.setAttribute('onclick', 'CopySongName(\'' + escapeChars(songName) + '\')');
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
        // Open in DuckDuckGo
        var goLink = document.createElement('a');
        goLink.href = "https://duckduckgo.com/?q=" + escape(songName);
        goLink.textContent = "DuckDuckGo this Song";
        dropdown.appendChild(goLink);

        document.getElementById('dropdown-container').appendChild(dropdown);
    }
    else {
        // Set name to a more correct name
        textA.textContent = 'Advertisements';
        textA.setAttribute('style', 'color: #888');
        regTimeSpan.textContent = 'N/A'; // Real Time was buggy for some reason
        regTimeSpan.setAttribute('style', 'color: #888');
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

function CreateUpnextNode (songName, coverUrl) {
    if (songName == 'Gold 104.3 - Better Music and More of It') { return; }

    songName = correctSpellingMistakes(songName);
    var finalSongName = correctLetterAccents (songName);

    var unext = document.createElement('div');
    unext.textContent = '';
    unext.setAttribute('class', 'schedule-item acrylic dropdown');
    unext.setAttribute('onmouseover', 'changePointer(true);');
    unext.setAttribute('onmouseleave', 'changePointer(false);');

    var unextTime = document.createElement('div');
    unextTime.setAttribute('id', 'schedule-time');
    unextTime.setAttribute('style', 'background-image: url(img/time-next.png)');
    unextTime.setAttribute('class', 'dropdown-zone');
    unext.appendChild(unextTime);

    var unextTimeSpan = document.createElement('span');
    unextTimeSpan.textContent = 'Next';
    unextTimeSpan.setAttribute('class', 'dropdown-zone');
    unextTime.appendChild(unextTimeSpan);

    // Cover art
    var coverImg = document.createElement('div');
    coverImg.setAttribute('id', 'schedule-cover');
    coverImg.setAttribute('style', 'background-image: url(\'' + coverUrl + '\')');
    unext.appendChild(coverImg);

    var unextText = document.createElement('div');
    unextText.setAttribute('id', 'schedule-text');
    unextText.setAttribute('class', 'dropdown-zone');
    unext.appendChild(unextText);

    var textA = document.createElement('a');
    textA.textContent = finalSongName;
    textA.setAttribute('class', 'dropdown-zone');
    unextText.appendChild(textA);

    var glossOverlay = document.createElement('div');
    glossOverlay.setAttribute('id', 'gloss-overlay');
    glossOverlay.setAttribute('class', 'dropdown-zone');
    unext.appendChild(glossOverlay);

    var dummy = document.createElement('div');
    dummy.setAttribute('id', 'schedule-text-dummy');
    dummy.textContent = finalSongName;
    unextText.appendChild(dummy);

    // Add dummy and corresponding text to arrays.
    dummies.push(dummy);
    elements.push(unextText);

    document.getElementById('schedule-main').appendChild(unext);
}

function CopySongName (songName) {
    var dummyElement = document.createElement('textarea');
    dummyElement.value = songName;
    dummyElement.setAttribute('style', 'opacity: 0');
    document.body.appendChild(dummyElement);
    dummyElement.select();
    document.execCommand('copy');
    console.log(songName);
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
// (Not a complete list, but the ones I noticed are here: )
function correctSpellingMistakes(song) {
    // First perform '12" EXTENDED' check.
    extended = "12\" EXTENDED";
    if (song.includes(extended)) {
        song = song.substring(0, song.length - extended.length) + " (Extended 12\" Mix)";
    }

    // Then proceed with spelling
    if (song == 'Kim Wilde - Chequred Love') { return 'Kim Wilde - Chequered Love'; }
    if (song == 'Nena - 99 Luftballoons') { return 'Nena - 99 Luftballons' }
    if (song == 'Nena - 99 Red Balloons (English Version)') { return 'Nena - 99 Red Balloons'; }
    if (song == 'Billy Ocean - When The Going Gets Tough, The Tough Ge') { return 'Billy Ocean - When the Going Gets Tough, the Tough Get Going';}
    if (song == 'Thompson Twins - Doctor, Doctor') return 'Thompson Twins - Doctor! Doctor!';
    if (song == 'Sonia Dada - You Don\'t Treat Me No Good*') return 'Sonia Dada - (Lover) You Don\'t Treat Me No Good';
    if (song == 'Trio - Da Da Da') return 'Trio - Da da da, ich lieb\' dich nicht du liebst mich nicht aha aha aha';
    if (song == 'Oasis - WonderWall') return 'Oasis - Wonderwall';
    if (song == 'Blondie - One Way Or Another') return 'Blondie - One Way or Another';
    if (song == 'Live - Lightning Crashes (radio edit)') return 'Live - Lightning Crashes (Radio Edit)';
    if (song == 'Dragon - April Sun In Cuba') return 'Dragon - April Sun in Cuba';
    if (song == 'Chris DeBurgh - Don\'t Pay The Ferryman') return 'Chris de Burgh - Don\'t Pay the Ferryman';
    if (song == 'Deee,Lite - Groove Is In The Heart') return 'Deee-Lite - Groove Is in the Heart';
    if (song == 'John Parr - St Elmo\'s Fire') return 'John Parr - St. Elmo\'s Fire (Man in Motion)';
    if (song == 'Journey - Don\'t Stop Believin') return 'Journey - Don\'t Stop Believin\'';
    if (song == 'INXS - JUST KEEP WALKING') return 'INXS - Just Keep Walking';
    if (song == 'Run DMC and Aerosmith - Walk This Way') return 'Run-D.M.C. & Aerosmith - Walk This Way';
    if (song == 'The Go,Betweens - Streets Of Your Town') return 'The Go-Betweens - Streets of Your Town';
    if (song == 'M - Pop Muzic') return 'M - Pop Muzik';
    if (song == 'Kiss - Rock And Roll All Nite') return 'Kiss - Rock and Roll All Nite';
    if (song == 'Whitney Houston - I Wanna Dance With Somebody') return 'Whitney Houston - I Wanna Dance with Somebody (Who Loves Me)';
    if (song == 'Inner Circle - Sweat (a la la la la long)') return 'Inner Circle - Sweat (A La La La La Long)';
    if (song == 'Matchbox Twenty - 3am') return 'Matchbox Twenty - 3AM';
    if (song == 'Philip Oakey & Giorgio Moroder - Together In Electric Dreams') return 'Philip Oakey & Giorgio Moroder - Together in Electric Dreams';
    if (song == 'The Offspring - Pretty Fly For A Whiteguy') return 'The Offspring - Pretty Fly (For a White Guy)';
    if (song == 'Samantha Fox - Touch Me (IWant Your Body)') return 'Samantha Fox - Touch Me (I Want Your Body)';
    if (song == 'C & C Music Factory - Things That Make You Go Mmmm') return 'C+C Music Factory - Things That Make You Go Hmmm...';
    if (song == 'Miami Sound Machine - Dr Beat') return 'Miami Sound Machine - Dr. Beat';
    if (song == 'Gwen Stefani - What You Waiting For') return 'Gwen Stefani - What You Waiting For?';
    if (song == 'Stevie Wright - Evie 1,2,3') return 'Stevie Wright - Evie';
    if (song == 'Tommy Tutone - 867,5309') return 'Tommy Tutone - 867-5309/Jenny';
    if (song == 'Robbie Nevil - C\'est La Vie') return 'Robbie Nevil - C\'est la Vie';
    if (song == 'Robbie Nevil - C\'est La Vie') return 'Hoodoo Gurus - Like Wow - Wipeout!';
    if (song == 'Divinyls - ONLY LONELY') return 'The Divinyls - Only Lonely';
    if (song == 'Beatles - Ob La Di, Ob La Da') return 'The Beatles - Ob-La-Di, Ob-La-Da';
    if (song == 'Mondo Rock - Summer Of 81') return 'Mondo Rock - Summer of \'81';
    if (song == 'Irene Cara - Flashdance...What A Feeling') return 'Irene Cara - Flashdance... What a Feeling';
    if (song == 'Re,Flex - The Politics Of Dancing') return 'Re-Flex - The Politics of Dancing';
    if (song == "Joe Cocker - Un,Chain My Heart") return "Joe Cocker - Unchain My Heart"
    if (song.substring(0, 4) == 'A,Ha') return ('A-ha' + song.substring(4, song.length));
    if (song.substring(0, 11) == 'Cranberries') return ('The Cranberries' + song.substring(11, song.length)); // Even though I can't stand this band, I  still decided I'd add them to the list.
    if (song.substring(0, 7) == 'Bangles') return ('The Bangles' + song.substring(7, song.length));
    if (song.substring(0, 6) == 'Police') return ('The Police' + song.substring(6, song.length));
    if (song.substring(0, 25) == 'Frankie Goes To Hollywood') return ('Frankie Goes to Hollywood' + song.substring(25, song.length));
    if (song.substring(0, 8) == 'Swingers') return ('The Swingers' + song.substring(8, song.length));
    if (song.substring(0, 13) == 'Chris DeBurgh') return ('Chris de Burgh' + song.substring(13, song.length));
    if (song.substring(0, 20) == 'Mike & The Mechanics') return ('Mike + The Mechanics' + song.substring(20, song.length));
    if (song.substring(0, 6) == 'B,52\'s') return ('The B-52\'s' + song.substring(6, song.length));
    if (song.substring(0, 6) == 'Cars -') return ('The Cars -' + song.substring(6, song.length));
    if (song.substring(0, 9) == 'Deee,Lite') return ('Deee-Lite' + song.substring(9, song.length));
    if (song.substring(0, 7) == 'Beatles') return ('The Beatles' + song.substring(7, song.length));
    if (song.substring(0, 5) == 'Knack') return ('The Knack' + song.substring(5, song.length));
    if (song.substring(0, 12) == 'Guns n Roses') return ('Guns N\' Roses' + song.substring(12, song.length));
    if (song.substring(0, 12) == 'Human League') return ('The Human League' + song.substring(12, song.length));
    if (song.substring(0, 15) == 'The Go,Betweens') return ('The Go-Betweens' + song.substring(15, song.length));
    if (song.substring(0, 8) == 'Tone Loc') return ('Tone Lōc' + song.substring(8, song.length));
    song = checkArtistName(song, 'The Presidents Of The Usa', 'The Presidents of the USA');
    song = checkArtistName(song, 'Run DMC', 'Run D.M.C.');
    song = checkArtistName(song, 'Corrs', 'The Corrs');
    song = checkArtistName(song, 'Olivia Newton,John', 'Olivia Newton-John');
    song = checkArtistName(song, 'John Travolta w/ Olivia Newton,John', 'John Travolta w/ Olivia Newton-John');
    song = checkArtistName(song, 'Fr David', 'F.R. David');
    song = checkArtistName(song, 'Phd', "Ph.D.");
    song = checkArtistName(song, 'Dr Hook', 'Dr. Hook');
    song = checkArtistName(song, 'C & C Music Factory', 'C+C Music Factory');
    song = checkArtistName(song, 'Communards', 'The Communards');
    song = checkArtistName(song, 'Jacksons', 'The Jacksons');
    song = checkArtistName(song, 'Divinyls', 'The Divinyls');
    song = checkArtistName(song, 'Uncanny X,Men', 'Uncanny X-Men');
    song = checkArtistName(song, 'Who', 'The Who');
    song = checkArtistName(song, 'Re,Flex', 'Re-Flex');
    song = checkArtistName(song, 'Rolling Stones', 'The Rolling Stones');
    
    return song;
}

function checkArtistName (song, err, fix) {
    if (song.substring(0, err.length) == err) { return fix + song.substring(err.length, song.length); }
    return song;
}

// For songs/artists that have accents in their name. Is seperate because there were bugs when using these names in links.
function correctLetterAccents (song) {
    if (song.substring(0, 11) == 'Motley Crue') { return ('Mötley Crüe' + song.substring(11, song.length)); }
    if (song.substring(0, 15) == 'Sinead O\'Connor') { return ('Sinéad O\'Connor' + song.substring(15, song.length)); }
    return song;
}

function escapeChars(text) {
   var quoted = text.replace(/"/g, '\\"');
   var slashed = quoted.replace(/\\/g, '\\');
   return slashed.replace(/'/g, '\\\'');
}

function SetPlayer(songN, artistN, coverUrl) {
    var combined = artistN + ' - ' + songN;
    var corrected = correctLetterAccents(correctSpellingMistakes(combined));
    var hyphen = -1;
    for (var i = 0; i < corrected.length; i++) {
        if (corrected[i] == '-' && i - 1 > -1 && i + 1 < corrected.length && corrected[i - 1] == ' ' && corrected[i + 1] == ' ') {
            hyphen = i;
            //console.log('hyphen = ' + hyphen);
        }
    }
    var artistName = corrected.substring(0, hyphen - 1);
    var songName = corrected.substring(hyphen + 2, corrected.length);

    //document.getElementById('current-bottom').setAttribute('style', 'background-image: url(\'' + coverUrl + '\')');
    document.getElementById('current-bottom').pseudoStyle('before', 'background-image', 'url(\'' + coverUrl + '\')');

    $('#player-text-container').stop();
    $('#player-text-container').animate({'opacity': 0}, 1000, function() {
        document.getElementById('player-title').textContent = songName;
        document.getElementById('player-artist').textContent = artistName;
    }).animate({'opacity': 1}, 2000);

    prevSongName = songName;
    prevArtistName = artistName;
}

// Lib-code for pseudo-style-editing
(function() {
    a = {
        _b: 0,
        c: function() {
            this._b++;
            return this.b;
        }
    };
    HTMLElement.prototype.pseudoStyle = function(d, e, f) {
        var g = "pseudoStyles";
        var h = document.head || document.getElementsByTagName('head')[0];
        var i = document.getElementById(g) || document.createElement('style');
        i.id = g;
        var j = "pseudoStyle" + a.c();
        if (!this.classList.contains(j)) {
            this.className += " " + j;
            console.log('Adding pseudoStyle to class list');
        }
        i.innerHTML += " ." + j + ":" + d + "{" + e + ":" + f + "}";
        h.appendChild(i);
        return this;
    };
})();