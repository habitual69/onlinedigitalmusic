const urlParams = new URLSearchParams(window.location.search);
const channelId = urlParams.get('channelId');
const playlistId = urlParams.get('playlistId');

let apiUrl = '';
const baseUrl = 'https://difm.vpms.xyz/track/';

if (channelId !== null) {
    apiUrl = `${baseUrl}channel/${encodeURIComponent(channelId)}`;
} else if (playlistId !== null) {
    apiUrl = `${baseUrl}playlist/${encodeURIComponent(playlistId)}`;
}

let currentIndex = 0;
let tracks = [];

const playButton = document.getElementById('play-button');
const nextButton = document.getElementById('next-button');
const prevButton = document.getElementById('prev-button');

const audioPlayer = document.getElementById('audio-player');
const progressBar = document.getElementById('progress-bar');
const seekBar = document.getElementById('seek-bar');
const trackList = document.getElementById('track-list');
const trackCount = document.getElementById('track-count');

function safeUrl(input) {
    try {
        const u = new URL(String(input), window.location.origin);
        // Allow only http(s) URLs
        if (u.protocol === 'http:' || u.protocol === 'https:') return u.toString();
    } catch (_) {
        // ignore
    }
    return '';
}

function renderTrackItem(track, index, absoluteIndex) {
    const trackItem = document.createElement('div');
    trackItem.classList.add('track-item', 'flex', 'items-center', 'mt-2', 'cursor-pointer', 'p-2', 'bg-gray-800', 'rounded');

    if (absoluteIndex === currentIndex) {
        trackItem.classList.add('currently-playing');
    }

    const trackLengthMinutes = Math.floor(track.length / 60);
    const trackLengthSeconds = track.length % 60;

    const img = document.createElement('img');
    img.className = 'w-8 h-8 rounded mr-2';
    img.alt = 'Track Image';
    img.src = safeUrl(track.asset_url);

    const titleWrap = document.createElement('div');
    titleWrap.className = 'flex-grow';

    const title = document.createElement('span');
    title.className = 'text-sm';
    title.textContent = String(track.display_title ?? '');

    titleWrap.appendChild(title);

    const duration = document.createElement('div');
    duration.className = 'text-sm';
    duration.textContent = `${trackLengthMinutes}:${trackLengthSeconds.toString().padStart(2, '0')}`;

    trackItem.appendChild(img);
    trackItem.appendChild(titleWrap);
    trackItem.appendChild(duration);

    trackItem.addEventListener('click', () => {
        currentIndex = absoluteIndex;
        loadTrack(tracks[currentIndex]);
        updateTrackHighlight(currentIndex);
    });

    return trackItem;
}

seekBar.addEventListener('input', () => {
    const seekTime = (audioPlayer.duration * seekBar.value) / 100;
    audioPlayer.currentTime = seekTime;
});

audioPlayer.addEventListener('timeupdate', () => {
    const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    progressBar.style.width = `${progress}%`;
    seekBar.value = progress;
    if (currentIndex === tracks.length - 1) {
        fetchAndUpdateTracklist();
    } else if (audioPlayer.currentTime === audioPlayer.duration) {
        playNextTrack();
    }
});

playButton.addEventListener('click', () => {
    if (audioPlayer.paused) {
        audioPlayer.play();
    } else {
        audioPlayer.pause();
    }
});

audioPlayer.addEventListener('play', () => {
    // static HTML from us, not user-controlled
    playButton.innerHTML = '<i class="fas fa-pause"></i>';
});

audioPlayer.addEventListener('pause', () => {
    // static HTML from us, not user-controlled
    playButton.innerHTML = '<i class="fas fa-play"></i>';
});

nextButton.addEventListener('click', () => {
    playNextTrack();
});

prevButton.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    loadTrack(tracks[currentIndex]);
    updateTrackHighlight(currentIndex);
});

function loadTrack(track) {
    // title is textContent => safe
    document.getElementById('track-title').textContent = String(track.display_title ?? '');

    // image/audio URLs should be restricted to http(s)
    const imgUrl = safeUrl(track.images?.default);
    if (imgUrl) {
        document.getElementById('track-image').src = imgUrl.replace("{?size,height,width,quality,pad}", "?size=440x440&quality=60");
    } else {
        document.getElementById('track-image').removeAttribute('src');
    }

    const audioUrl = safeUrl(track.content?.assets?.[0]?.url);
    if (audioUrl) {
        audioPlayer.src = audioUrl;
    } else {
        audioPlayer.removeAttribute('src');
    }

    playButton.innerHTML = '<i class="fas fa-play"></i>';
    audioPlayer.play();
}

function updateTrackHighlight(index) {
    const trackItems = trackList.getElementsByClassName('track-item');
    for (let i = 0; i < trackItems.length; i++) {
        if (i === index) {
            trackItems[i].classList.add('currently-playing');
        } else {
            trackItems[i].classList.remove('currently-playing');
        }
    }
}

function playNextTrack() {
    currentIndex = (currentIndex + 1) % tracks.length;
    loadTrack(tracks[currentIndex]);
    updateTrackHighlight(currentIndex);
}

function fetchAndUpdateTracklist() {
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const newTracks = data.tracks;
            const currentTrackCount = tracks.length;

            newTracks.forEach((track, index) => {
                const absoluteIndex = currentTrackCount + index;
                const trackItem = renderTrackItem(track, index, absoluteIndex);
                trackList.appendChild(trackItem);
            });

            trackCount.textContent = String(currentTrackCount + newTracks.length);

            tracks = tracks.concat(newTracks);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}

// Load the initial track and set up audio player
fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
        tracks = data.tracks;
        loadTrack(tracks[currentIndex]);
        updateTrackHighlight(currentIndex);

        audioPlayer.addEventListener('timeupdate', () => {
            const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
            progressBar.style.width = `${progress}%`;
        });

        tracks.forEach((track, index) => {
            const trackItem = renderTrackItem(track, index, index);
            trackList.appendChild(trackItem);
        });

        trackCount.textContent = String(tracks.length);
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });