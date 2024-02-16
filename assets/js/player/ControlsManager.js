class ControlsManager {
    constructor(player) {
        // Initialisation des propriétés et des écouteurs d'événements
        this.player = player;
    }

    showControls() {
        anime({
            targets: '.controls',
            opacity: 1,
            duration: 500, // Durée de l'animation en millisecondes
            easing: 'easeOutQuad' // Courbe d'accélération de l'animation
        });
    }

    // Fonction pour masquer les contrôles avec une animation en fondu
    hideControls() {
        if (!this.player.paused) {
            anime({
                targets: '.controls',
                opacity: 0,
                duration: 500, // Durée de l'animation en millisecondes
                easing: 'easeOutQuad' // Courbe d'accélération de l'animation
            });
        }

    }

    // Autres méthodes
}

export default ControlsManager;
