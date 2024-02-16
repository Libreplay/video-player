class FullScreenManager {
    constructor(player) {
        // Initialisation des propriétés et des écouteurs d'événements
        this.player = player;
        this.videoControls = document.querySelector('.controls');

    }
    toggleFullScreen() {
        // Vérifie si l'appareil est un téléphone mobile
        const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        // Si c'est un téléphone mobile, passe en mode paysage
        if (isMobileDevice) {
            screen.orientation.lock('landscape').then(() => {
                // Une fois en mode paysage, active le mode plein écran
                this.enterFullScreen();
            }).catch((error) => {
                console.error('Erreur lors du passage en mode paysage : ', error);
                this.enterFullScreen();
            });
        } else {
            // Si ce n'est pas un téléphone mobile, active directement le mode plein écran
            this.enterFullScreen();
        }
    }

    enterFullScreen() {
        if (this.isFullScreen()) {
            return document.exitFullscreen();
        }

        if (document.querySelector(".video-container").requestFullscreen) {
            document.querySelector(".video-container").requestFullscreen();
        } else if (document.querySelector(".video-container").webkitRequestFullscreen) {
            document.querySelector(".video-container").webkitRequestFullscreen();
        } else if (video.msRequestFullscreen) {
            document.querySelector(".video-container").msRequestFullscreen();
        }
    }


    isFullScreen() {
        return !!(document.fullScreen || document.webkitIsFullScreen || document.mozFullScreen || document.msFullscreenElement || document.fullscreenElement);
    }

    toggleFullscreenClass() {
        this.videoControls.classList.toggle('fullscreen', !!document.fullscreenElement);
    }
}

export default FullScreenManager;
