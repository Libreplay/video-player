document.addEventListener("DOMContentLoaded", async function () {
    const importedModule = await import("./assets/js/player/BetaPlayer.js");
    const playerManager = new importedModule.default();
    playerManager.init();
});