const urlParams = new URLSearchParams(window.location.search);
const channelId = urlParams.get('channelId');
const playlistId = urlParams.get('playlistId');
let apiUrl = '';
const baseUrl = 'https://difm.vpms.xyz/track/';

if (channelId !== null) {
    apiUrl = `${baseUrl}channel/${channelId}`;
} else if (playlistId !== null) {
    apiUrl = `${baseUrl}playlist/${playlistId}`;
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

seekBar.addEventListener('input', () => {
    const seekTime = (audioPlayer.duration * seekBar.value) / 100;
    audioPlayer.currentTime = seekTime;
});

audioPlayer.addEventListener('timeupdate', () => {
    const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    progressBar.style.width = `${progress}%`;
    seekBar.value = progress;
    if (currentIndex === tracks.length-1) {
        fetchAndUpdateTracklist();
    }
    else if (audioPlayer.currentTime === audioPlayer.duration) {
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
    playButton.innerHTML = '<i class="fas fa-pause"></i>';
});

audioPlayer.addEventListener('pause', () => {
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
    document.getElementById('track-image').src = track.images.default.replace("{?size,height,width,quality,pad}", "?size=440x440&quality=60");
    document.getElementById('track-title').textContent = track.display_title;
    audioPlayer.src = track.content.assets[0].url;
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
                const trackItem = document.createElement('div');
                trackItem.classList.add('track-item', 'flex', 'items-center', 'mt-2', 'cursor-pointer', 'p-2' ,'bg-gray-800', 'rounded');

                if (currentTrackCount + index === currentIndex) {
                    trackItem.classList.add('currently-playing');
                }

                const trackLengthMinutes = Math.floor(track.length / 60);
                const trackLengthSeconds = track.length % 60;

                trackItem.innerHTML = `
                    <img src="${track.asset_url}" alt="Track Image" class="w-8 h-8 rounded mr-2">
                    <div class="flex-grow">
                        <span class="text-sm">${track.display_title}</span>
                    </div>
                    <div class="text-sm">${trackLengthMinutes}:${trackLengthSeconds.toString().padStart(2, '0')}</div>
                `;
                trackItem.addEventListener('click', () => {
                    currentIndex = currentTrackCount + index;
                    loadTrack(tracks[currentIndex]);
                    updateTrackHighlight(currentIndex);
                });
                trackList.appendChild(trackItem);
            });

            trackCount.textContent = currentTrackCount + newTracks.length;

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
            const trackItem = document.createElement('div');
            trackItem.classList.add('track-item', 'flex', 'items-center', 'mt-2', 'cursor-pointer', 'p-2' ,'bg-gray-800', 'rounded');

            if (index === currentIndex) {
                trackItem.classList.add('currently-playing');
            }

            const trackLengthMinutes = Math.floor(track.length / 60);
            const trackLengthSeconds = track.length % 60;

            trackItem.innerHTML = `
                <img src="${track.asset_url}" alt="Track Image" class="w-8 h-8 rounded mr-2">
                <div class="flex-grow">
                    <span class="text-sm">${track.display_title}</span>
                </div>
                <div class="text-sm">${trackLengthMinutes}:${trackLengthSeconds.toString().padStart(2, '0')}</div>
            `;
            trackItem.addEventListener('click', () => {
                currentIndex = index;
                loadTrack(track);
                updateTrackHighlight(index);
            });
            trackList.appendChild(trackItem);
        });

        trackCount.textContent = tracks.length;
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });
