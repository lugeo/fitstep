class HIITTimer {
    constructor() {
        this.timerDisplay = document.getElementById('timer');
        this.phaseDisplay = document.getElementById('phase');
        this.roundDisplay = document.getElementById('round');
        this.startBtn = document.getElementById('startBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.soundToggle = document.getElementById('soundToggle');

        this.isRunning = false;
        this.currentTime = 0;
        this.currentPhase = 'warmup';
        this.currentRound = 0;
        this.currentSequence = 0;
        this.soundEnabled = true;

        // Initialiser les durées
        this.durations = {
            warmup: 300,
            cooldown: 300
        };

        this.sequences = [];
        this.totalRounds = 0;

        this.loadSettings();
        this.setupEventListeners();
        this.updateDisplay();
    }

    loadSettings() {
        // Charger les réglages depuis le localStorage
        this.durations.warmup = parseInt(localStorage.getItem('hiitWalkTimer.warmupDuration')) || 300;
        this.durations.cooldown = parseInt(localStorage.getItem('hiitWalkTimer.cooldownDuration')) || 300;
        this.soundEnabled = localStorage.getItem('hiitWalkTimer.soundEnabled') !== 'false';
        
        // Charger les séquences
        this.sequences = JSON.parse(localStorage.getItem('hiitWalkTimer.sequences') || '[]');
        if (this.sequences.length === 0) {
            this.sequences = [{
                walkDuration: 40,
                sprintDuration: 40,
                cycles: 10
            }];
        }

        console.log('Settings loaded:', {
            durations: this.durations,
            sequences: this.sequences,
            soundEnabled: this.soundEnabled
        });

        // Si le timer n'est pas en cours, initialiser le temps avec la phase actuelle
        if (!this.isRunning && this.currentPhase !== 'finished') {
            this.currentTime = this.getPhaseTime(this.currentPhase);
        }

        this.updateSoundButton();
        this.updateDisplay();
    }

    getPhaseTime(phase) {
        if (phase === 'warmup') return this.durations.warmup;
        if (phase === 'cooldown') return this.durations.cooldown;
        if (phase === 'walk') return this.sequences[this.currentSequence].walkDuration;
        if (phase === 'sprint') return this.sequences[this.currentSequence].sprintDuration;
        return 0;
    }

    getCurrentSequenceCycles() {
        return this.sequences[this.currentSequence].cycles;
    }

    setupEventListeners() {
        this.startBtn.addEventListener('click', () => this.toggleTimer());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.soundToggle.addEventListener('click', () => this.toggleSound());

        // Écouter les changements de localStorage
        window.addEventListener('storage', () => {
            console.log('Storage event received, reloading settings...');
            this.loadSettings();
            if (!this.isRunning && this.currentPhase !== 'finished') {
                this.reset();
            }
        });

        // Écouter aussi les changements locaux
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                console.log('Page became visible, reloading settings...');
                this.loadSettings();
                if (!this.isRunning && this.currentPhase !== 'finished') {
                    this.reset();
                }
            }
        });
    }

    toggleTimer() {
        if (this.isRunning) {
            this.pause();
        } else {
            this.start();
        }
    }

    start() {
        if (!this.isRunning) {
            if (this.currentTime === 0 && this.currentPhase !== 'finished') {
                this.currentPhase = 'warmup';
                this.currentTime = this.getPhaseTime('warmup');
                this.currentRound = 0;
                this.currentSequence = 0;
            }
            this.isRunning = true;
            this.startBtn.textContent = 'Pause';
            this.interval = setInterval(() => this.tick(), 1000);
        }
    }

    pause() {
        if (this.isRunning) {
            this.isRunning = false;
            this.startBtn.textContent = 'Démarrer';
            clearInterval(this.interval);
        }
    }

    reset() {
        this.pause();
        this.currentPhase = 'warmup';
        this.currentTime = this.getPhaseTime('warmup');
        this.currentRound = 0;
        this.currentSequence = 0;
        this.updateDisplay();
    }

    tick() {
        if (this.currentTime <= 0) {
            this.nextPhase();
        }
        
        if (this.currentTime > 0) {
            this.currentTime--;
            this.updateDisplay();
        }
    }

    nextPhase() {
        if (this.currentPhase === 'warmup') {
            this.currentPhase = 'walk';
            this.currentTime = this.getPhaseTime('walk');
            this.currentRound = 1;
        } else if (this.currentPhase === 'walk') {
            this.currentPhase = 'sprint';
            this.currentTime = this.getPhaseTime('sprint');
        } else if (this.currentPhase === 'sprint') {
            if (this.currentRound < this.getCurrentSequenceCycles()) {
                this.currentPhase = 'walk';
                this.currentTime = this.getPhaseTime('walk');
                this.currentRound++;
            } else if (this.currentSequence < this.sequences.length - 1) {
                // Passer à la séquence suivante
                this.currentSequence++;
                this.currentPhase = 'walk';
                this.currentTime = this.getPhaseTime('walk');
                this.currentRound = 1;
            } else {
                this.currentPhase = 'cooldown';
                this.currentTime = this.getPhaseTime('cooldown');
            }
        } else if (this.currentPhase === 'cooldown') {
            this.pause();
            this.currentPhase = 'finished';
            this.currentTime = 0;
            this.updateDisplay();
            return;
        }

        if (this.soundEnabled) {
            this.playSound();
        }

        this.updateDisplay();
    }

    updateDisplay() {
        const minutes = Math.floor(this.currentTime / 60);
        const seconds = this.currentTime % 60;
        this.timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        const phaseNames = {
            'warmup': 'Échauffement',
            'walk': 'Marche',
            'sprint': 'Sprint',
            'cooldown': 'Récupération',
            'finished': 'Entraînement terminé ! 🎉'
        };
        
        let phaseText = phaseNames[this.currentPhase];
        if (this.sequences.length > 1 && ['walk', 'sprint'].includes(this.currentPhase)) {
            phaseText += ` (Séquence ${this.currentSequence + 1}/${this.sequences.length})`;
        }
        this.phaseDisplay.textContent = phaseText;

        if (this.currentPhase === 'finished') {
            this.roundDisplay.textContent = 'Bravo !';
        } else if (this.currentPhase === 'warmup' || this.currentPhase === 'cooldown') {
            this.roundDisplay.textContent = '-';
        } else {
            this.roundDisplay.textContent = `Round ${this.currentRound}/${this.getCurrentSequenceCycles()}`;
        }

        // Mise à jour de la classe du timer pour le changement de couleur
        const timerCircle = document.querySelector('.timer-circle');
        timerCircle.classList.remove('warmup', 'walk', 'sprint', 'cooldown', 'finished');
        timerCircle.classList.add(this.currentPhase);
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        localStorage.setItem('hiitWalkTimer.soundEnabled', this.soundEnabled);
        this.updateSoundButton();
    }

    updateSoundButton() {
        this.soundToggle.textContent = this.soundEnabled ? '🔊' : '🔇';
    }

    playSound() {
        console.log('Playing sound for phase:', this.currentPhase);
    }
}

// Initialiser le timer quand la page se charge
document.addEventListener('DOMContentLoaded', () => {
    window.timer = new HIITTimer();
});
