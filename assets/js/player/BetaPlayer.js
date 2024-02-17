import AudioSubtitleMenu from './AudioSubtitleMenu.js';
import FullScreenManager from './FullScreenManager.js';
import ControlsManager from './ControlsManager.js';
import HLS from './libs/hls.mjs';

class BetaPlayer {
    constructor() {
        this.player = document.querySelector("video");
        this.hls = new HLS();
        this.audioSubtitleMenu = new AudioSubtitleMenu(this.player, this.hls);
        this.fullScreenManager = new FullScreenManager(this.player);
        this.controlsManager = new ControlsManager(this.player);
        this.playPauseButton = document.querySelector('.play-pause');
        this.fullscreenButton = document.querySelector('.fullscreen');
        this.videoProgress = document.querySelector('.video-progress');
        this.currentTimeDisplay = document.querySelector('.current-time');
        this.durationDisplay = document.querySelector('.duration');
        this.volumeSlider = document.querySelector('.volume-slider');
        this.playerContainer = document.querySelector('.video-container');
        this.pipButton = document.querySelector('.pip');
        this.playPromise = null;
        this.isMouseActive = false;
        this.timeoutId;
        this.anime = null;
    }

    init() {
        this.loadDefaultVideo();

        this.player.addEventListener("loadstart", () => {
            this.playPauseButton.disabled = true;
            this.durationDisplay.textContent = "00:00:00";
        });

        this.player.addEventListener('loadeddata', () => {
            this.playPauseButton.disabled = false;
            this.player.volume = 0.5;
            const duration = Math.floor(this.player.duration);
            const durationHours = Math.floor(duration / 3600);
            const durationMinutes = Math.floor(duration / 60);
            const durationSeconds = duration - durationMinutes * 60;
            this.durationDisplay.textContent = `${durationHours}:${durationMinutes < 10 ? '0' : ''}${durationMinutes}:${durationSeconds < 10 ? '0' : ''}${durationSeconds}`;

            if (this.player.dataset.time != "0") {
                this.player.currentTime = this.player.dataset.time;
            }

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

        // Écouteur d'événement pour afficher les contrôles lorsque la souris bouge sur la vidéo
        this.playerContainer.addEventListener('mousemove', () => {
            this.controlsManager.showControls();
        });

        // Écouteur d'événement pour détecter lorsque la souris quitte la vidéo
        this.playerContainer.addEventListener('mouseleave', () => {
            setTimeout(() => {
                this.controlsManager.hideControls();
            }, 5000);
        });

        // Écouteur d'événement pour afficher les contrôles lorsque la souris passe sur la vidéo
        this.playerContainer.addEventListener('mouseenter', () => {
            this.controlsManager.showControls();
        });

        // Événements tactiles pour gérer les contrôles sur les appareils mobiles
        this.playerContainer.addEventListener('touchstart', () => {
            this.controlsManager.showControls();

        });

        this.playerContainer.addEventListener('touchend', () => {
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

        if (HLS.isSupported()) {
            console.log("Supported")
            if (defaultLang == "VF") {
                this.hls.loadSource(this.player.dataset.vf);
                this.hls.attachMedia(this.player);
                this.hls.on(HLS.Events.MANIFEST_PARSED, () => {
                    console.log("Manifest parsed")
                    console.log(this.hls.levels)
                    this.hls.currentLevel = 2;
                    console.log(this.hls.loadLevel);
                });
            }

            if (defaultLang == "VO") {
                this.hls.loadSource(this.player.dataset.vf);
                this.hls.attachMedia(this.player);
                this.hls.on(HLS.Events.MANIFEST_PARSED, () => {
                    console.log("Manifest parsed")
                    console.log(this.hls.levels)
                    this.hls.currentLevel = 2;
                    console.log(this.hls.loadLevel);
                });
            }

            this.hls.on(HLS.Events.LEVEL_SWITCHED, (event, data) => {
                console.info("Level changing to " + data.level);
            });

            this.hls.on(HLS.Events.LEVEL_LOADING, (event, data) => {
                console.info("Chargement du niveau");
            });

            this.hls.on(HLS.Events.LEVEL_LOADED, (event, data) => {
                console.info("Niveau chargé");
                console.log("Current", this.hls.currentLevel)
            });

            // Écouter les événements d'erreur HLS.js
            this.hls.on(HLS.Events.ERROR, function (event, data) {
                console.error("HLS error:", event, data);
            });
        }
    }

    updatePlayPauseButton() {
        this.playPauseButton.innerHTML = this.player.paused ? '<i class="fas fa-play"></i>' : '<i class="fas fa-pause"></i>';
    }

    updateProgressAndTime() {
        const currentTime = Math.floor(this.player.currentTime);
        const duration = Math.floor(this.player.duration);
        const progressPercentage = (currentTime / duration) * 100;
        this.videoProgress.value = Math.floor(progressPercentage);
        console.log(this.videoProgress.value, Math.floor(progressPercentage))
        this.videoProgress.setAttribute('value', progressPercentage);


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