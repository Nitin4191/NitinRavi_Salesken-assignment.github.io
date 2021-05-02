const canvas = document.querySelector('canvas'),
canvasContext = canvas.getContext('2d'),
canvasWidth = canvas.clientWidth,
canvasHeight = canvas.clientHeight;

const audio = document.querySelector('audio'),
audioContext = new AudioContext(),
source = audioContext.createMediaElementSource(audio),
analyser = audioContext.createAnalyser(),
playPauseButton = document.querySelector('.play-pause'),
seekbar = document.querySelector('.seekbar'),
volumebar = document.querySelector('.volume'),
pauseIcon = `<span class="material-icons">pause</span>`,
playIcon = `<span class="material-icons">play_arrow</span>`,
replayIcon = `<span class="material-icons">replay</span>`;
seekbar.value = 0;
volumebar.value = 100;
analyser.fftSize = 256;

let audioState = {
    isReplay: false,
    isPaused: true
};

playPauseButton.addEventListener('click', togglePlayPause);
audio.addEventListener('timeupdate', setProgress);
audio.addEventListener('ended', onEnd);
audio.addEventListener('canplay', setDuration);
seekbar.addEventListener('input', onSeek);
volumebar.addEventListener('input', onVolumeSeek);

source.connect(analyser);
analyser.connect(audioContext.destination);

setInterval(() => {
    let freqData = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(freqData);
    canvasContext.fillStyle = "#000000";
    canvasContext.fillRect(0, 0, canvasWidth, canvasHeight);

    const barWidth = (canvasWidth / analyser.frequencyBinCount);
    let barHeight;
    let x = 0;

    for (let i = 0; i < freqData.length; i++) {
        barHeight = freqData[i];
        canvasContext.fillStyle = "#c83232";
        canvasContext.fillRect(x, canvasHeight - barHeight, barWidth, barHeight);
        x += barWidth + 1;
    }
}, 60);

function togglePlayPause() {
    audioContext.resume().then(() => {
        if (audioState.isPaused) {
            playPauseButton.innerHTML = pauseIcon;
            audio.play();
        } else {
            if (audioState.isReplay) {
                playPauseButton.innerHTML = pauseIcon;
                audio.play();
                audioState.isReplay = false;
                return;
            }
            playPauseButton.innerHTML = playIcon;
            audio.pause();
        }
        audioState.isPaused = !audioState.isPaused;
    });
}

function setProgress() {
    seekbar.value = audio.currentTime;
}

function setDuration() {
    seekbar.max = audio.duration;
}

function onEnd() {
    playPauseButton.innerHTML = replayIcon;
    audio.currentTime = 0;
    seekbar.value = 0;
    audioState.isReplay = true;
}

function onSeek(event) {
    audio.currentTime = event.target.value;
}

function onVolumeSeek(event) {
    audio.volume = event.target.value / 100;
}