class AudioSubtitleMenu {
    constructor(player, hls) {
        this.player = player;
        this.hls = hls;
        this.audioAndSubtitleMenu = document.getElementById('audioAndSubtitleMenu');
        this.audioAndSubtitleButton = document.getElementById('audioAndSubtitleButton');
        this.audioAndSubtitleMenu = document.getElementById('audioAndSubtitleMenu');
        this.closeAudioAndSubtitleMenuButton = document.getElementById('closeAudioAndSubtitleMenu');
        this.playPromise = null;
    }

    initMenu() {
        const languages = JSON.parse(this.player.dataset.languages || '[]');
        const qualitySelect = document.getElementById('quality');
        const quality = JSON.parse(this.player.dataset.quality || '[]');
        const defaultLang = this.player.dataset.defaultlang;
        const allInputAudios = document.querySelectorAll('input[name="audio"]');
        const allSubtitles = document.querySelectorAll('input[name="subtitle"]');

        allInputAudios.forEach((inputAudio) => {
            const value = inputAudio.value.toUpperCase();

            if (languages.includes(value)) {
                inputAudio.disabled = false;
            }

            if (defaultLang == value) {
                inputAudio.checked = true;
            }

            inputAudio.addEventListener("change", (e) => {
                const value = e.target.value;
                const oldTime = localStorage.getItem("globalTime");

                if (value === "vf") {
                    this.player.src = this.player.dataset.vf;
                    this.player.load();
                }

                if (value === "vo") {
                    this.player.src = this.player.dataset.vo;
                    this.player.load();
                }

                this.player.addEventListener("loadeddata", () => {
                    setTimeout(() => {
                        this.player.currentTime = parseFloat(oldTime);
                        this.closeAudioAndSubtitleMenu();
                        this.playPromise = this.player.play();
                    }, 500);
                }, { once: true });

            });
        });

        allSubtitles.forEach((inputSubtitle) => {
            const value = inputSubtitle.value.toUpperCase();

            if (languages.includes(value)) {
                inputSubtitle.disabled = false;
            } else {
                inputSubtitle.disabled = true;
            }

            inputSubtitle.addEventListener("change", (e) => {
                const value = e.target.value;
                const vostfr = this.filterSubtitlesByLanguage('fr')[0];
                const vost = this.filterSubtitlesByLanguage('en')[0];

                if (value === "disable") {
                    vostfr.mode = 'disabled';
                    vost.mode = 'disabled';
                }

                if (value === "vostfr") {
                    vostfr.mode = 'showing';
                    vost.mode = 'disabled';
                }

                if (value === "vost") {
                    vostfr.mode = 'disabled';
                    vost.mode = 'showing';
                }
            });
        });

        quality.forEach((value) => {
            const option = document.createElement('option');
            option.value = value;
            option.text = value;
            qualitySelect.appendChild(option);
        });

        qualitySelect.addEventListener('change', (e) => {
            const quality = e.target.value;
            if(quality == "1080"){
                this.hls.currentLevel = 2;
                qualitySelect.value = 1080;
            }
            if(quality == "720"){
                this.hls.currentLevel = 1;
                qualitySelect.value = 720;
            }
            if(quality == "420"){
                this.hls.currentLevel = 0;
                qualitySelect.value = 420;
            }
        })

        this.handleEvent();
    }

    handleEvent() {
        this.audioAndSubtitleButton.addEventListener('click', (e) => {
            this.toggleAudioAndSubtitleMenu();
        });

        this.closeAudioAndSubtitleMenuButton.addEventListener('click', () => {
            this.closeAudioAndSubtitleMenu();
        });
    }

    toggleAudioAndSubtitleMenu() {
        if (this.audioAndSubtitleMenu.classList.contains('hidden')) {
            this.player.play().then(() => {
                this.player.pause();
                this.audioAndSubtitleMenu.classList.remove('hidden');
            });
        } else {
            this.audioAndSubtitleMenu.classList.add('hidden');
            this.player.play();
        }
    }

    closeAudioAndSubtitleMenu() {
        this.audioAndSubtitleMenu.classList.add('hidden');
        this.player.play();
    }


    filterSubtitlesByLanguage(language) {
        return Array.from(this.player.textTracks).filter(function (track) {
            return track.kind === 'captions' && track.language === language;
        });
    }
}

export default AudioSubtitleMenu;
