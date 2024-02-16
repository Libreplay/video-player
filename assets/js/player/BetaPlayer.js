import AudioSubtitleMenu from './AudioSubtitleMenu.js';
import FullScreenManager from './FullScreenManager.js';
import ControlsManager from './ControlsManager.js';

class BetaPlayer {
    constructor() {
        this.player = document.querySelector("video");

        this.audioSubtitleMenu = new AudioSubtitleMenu(this.player);
        this.fullScreenManager = new FullScreenManager(this.player);
        this.controlsManager = new ControlsManager(this.player);

        this.playPauseButton = document.querySelector('.play-pause');
        this.fullscreenButton = document.querySelector('.fullscreen');
        this.videoProgress = document.querySelector('.video-progress');
        this.currentTimeDisplay = document.querySelector('.current-time');
        this.durationDisplay = document.querySelector('.duration');
        this.videoControls = document.querySelector('.controls');
        this.volumeSlider = document.querySelector('.volume-slider');
        this.pipButton = document.querySelector('.pip');
        this.playPromise = null;
        this.isMouseActive = false;
        this.timeoutId;
    }

    init() {
        this.loadDefaultVideo();

        this.player.addEventListener("loadstart", () => {
            this.playPauseButton.disabled = true;
        });

        this.player.addEventListener('loadeddata', () => {
            console.log(this.player.textTracks)
            this.playPauseButton.disabled = false;
            this.player.volume = 0.5;
            const duration = Math.floor(this.player.duration);
            // Heure
            const durationHours = Math.floor(duration / 3600);
            const durationMinutes = Math.floor(duration / 60);
            const durationSeconds = duration - durationMinutes * 60;
            // Affichage du temps total
            this.durationDisplay.textContent = `${durationHours}:${durationMinutes < 10 ? '0' : ''}${durationMinutes}:${durationSeconds < 10 ? '0' : ''}${durationSeconds}`;
        }, { once: true });

        this.player.addEventListener("click", () => {
            this.togglePlayPause();
        });

        this.playPauseButton.addEventListener('click', () => {
            this.togglePlayPause();
        });

        this.player.addEventListener('play', () => {
            this.updatePlayPauseButton();
            setTimeout(() => {
                this.controlsManager.hideControls();
            }, 5000);
        });
        this.player.addEventListener('pause', () => {
            this.updatePlayPauseButton();
            this.controlsManager.showControls();
        });
        this.player.addEventListener('timeupdate', () => {
            this.updateProgressAndTime();
        });

        this.videoProgress.addEventListener('input', () => {
            const seekToTime = this.player.duration * (this.videoProgress.value / 100);
            this.player.currentTime = seekToTime;
        });

        this.fullscreenButton.addEventListener('click', () => {
            this.fullScreenManager.toggleFullScreen();
        });

        this.volumeSlider.addEventListener('change', () => {
            this.adjustVolume();
        });

        this.pipButton.addEventListener('click', () => {
            this.togglePictureInPicture();
        });

        document.addEventListener('fullscreenchange', () => {
            this.fullScreenManager.toggleFullscreenClass();
        });

        // Écouteur d'événement pour détecter lorsque la souris quitte la vidéo
        this.player.addEventListener('mouseleave', () => {
            this.isMouseActive = false;
            setTimeout(() => {
                this.controlsManager.hideControls();
            }, 5000);
        });

        // Écouteur d'événement pour afficher les contrôles lorsque la souris passe sur la vidéo
        this.player.addEventListener('mouseenter', () => {
            this.controlsManager.showControls();
            this.isMouseActive = true;
        });

        // Événements tactiles pour gérer les contrôles sur les appareils mobiles
        this.player.addEventListener('touchstart', () => {
            this.controlsManager.showControls();
            this.isMouseActive = true;
        });

        this.player.addEventListener('touchend', () => {
            this.isMouseActive = false;
            this.controlsManager.hideControls();
        });


        this.player.addEventListener('contextmenu', function (event) {
            event.preventDefault(); // Empêche le comportement par défaut du clic droit
        });

        this.audioSubtitleMenu.initMenu();
    }



    loadDefaultVideo() {
        this.player.controls = false;
        const defaultLang = this.player.dataset.defaultlang;

        if (defaultLang == "VF") {
            this.player.src = this.player.dataset.vf;
            this.player.load();
        }

        if (defaultLang == "VO") {
            this.player.src = this.player.dataset.vo;
            this.player.load();
        }
    }

    updatePlayPauseButton() {
        this.playPauseButton.innerHTML = this.player.paused ? '<i class="fas fa-play"></i>' : '<i class="fas fa-pause"></i>';
    }

    updateProgressAndTime() {
        const currentTime = Math.floor(this.player.currentTime);
        const duration = Math.floor(this.player.duration);
        const progressPercentage = (currentTime / duration) * 100;
        this.videoProgress.value = progressPercentage;

        const currentMinutes = Math.floor(currentTime / 60);
        const currentSeconds = currentTime - currentMinutes * 60;
        const durationHours = Math.floor(duration / 3600);
        const durationMinutes = Math.floor(duration / 60);
        const durationSeconds = duration - durationMinutes * 60;

        this.currentTimeDisplay.textContent = `${currentMinutes}:${currentSeconds < 10 ? '0' : ''}${currentSeconds}`;
        this.durationDisplay.textContent = `${durationHours}:${durationMinutes < 10 ? '0' : ''}${durationMinutes}:${durationSeconds < 10 ? '0' : ''}${durationSeconds}`;
        localStorage.setItem("globalTime", this.player.currentTime);
    }

    togglePlayPause(e) {
        console.log(this.player,)

        if (this.player.paused) {
            this.player.play();
        } else {
            this.player.pause();
        }
    }

    adjustVolume() {
        this.player.volume = this.volumeSlider.value / 100;
    }

    togglePictureInPicture() {
        if (document.pictureInPictureElement) {
            document.exitPictureInPicture();
        } else if (document.pictureInPictureEnabled) {
            this.player.requestPictureInPicture();
        }
    }
}

export default BetaPlayer;