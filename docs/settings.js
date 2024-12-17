// Constantes pour les clés de stockage
const STORAGE_KEYS = {
    WARMUP: 'hiitWalkTimer.warmupDuration',
    COOLDOWN: 'hiitWalkTimer.cooldownDuration',
    SOUND: 'hiitWalkTimer.soundEnabled',
    SEQUENCES: 'hiitWalkTimer.sequences'
};

// Éléments du DOM
const elements = {
    warmupDuration: document.getElementById('warmupDuration'),
    cooldownDuration: document.getElementById('cooldownDuration'),
    soundEnabled: document.getElementById('soundEnabled'),
    saveButton: document.getElementById('saveSettings'),
    addSequenceButton: document.getElementById('addSequence'),
    sequencesList: document.getElementById('sequencesList'),
    
    // Éléments d'affichage des valeurs
    warmupValue: document.getElementById('warmupValue'),
    cooldownValue: document.getElementById('cooldownValue'),
    
    // Éléments pour le temps total
    totalTimeValue: document.getElementById('totalTimeValue'),
    totalTimeMinutes: document.getElementById('totalTimeMinutes'),
    totalTimeSeconds: document.getElementById('totalTimeSeconds')
};

// Structure par défaut d'une séquence
const defaultSequence = {
    walkDuration: 40,
    sprintDuration: 40,
    cycles: 10
};

let sequences = [];

// Créer une nouvelle séquence
function createSequence(data = defaultSequence) {
    const sequenceNumber = sequences.length + 1;
    const sequenceElement = document.createElement('div');
    sequenceElement.className = 'sequence-item';
    sequenceElement.innerHTML = `
        <div class="sequence-header">
            <span class="sequence-number">Séquence ${sequenceNumber}</span>
            <div class="sequence-controls">
                <button class="delete-sequence">Supprimer</button>
            </div>
        </div>
        <div class="sequence-content">
            <div class="setting-item">
                <label>Marche (secondes)</label>
                <input type="range" class="walk-duration" min="10" max="120" value="${data.walkDuration}" step="5">
                <span class="walk-value">${data.walkDuration}</span>
            </div>
            <div class="setting-item">
                <label>Sprint (secondes)</label>
                <input type="range" class="sprint-duration" min="10" max="120" value="${data.sprintDuration}" step="5">
                <span class="sprint-value">${data.sprintDuration}</span>
            </div>
            <div class="sequence-cycles">
                <label>Nombre de cycles:</label>
                <input type="number" class="cycles" min="1" max="20" value="${data.cycles}">
            </div>
        </div>
    `;

    // Ajouter les event listeners
    const walkInput = sequenceElement.querySelector('.walk-duration');
    const sprintInput = sequenceElement.querySelector('.sprint-duration');
    const cyclesInput = sequenceElement.querySelector('.cycles');
    const walkValue = sequenceElement.querySelector('.walk-value');
    const sprintValue = sequenceElement.querySelector('.sprint-value');
    const deleteButton = sequenceElement.querySelector('.delete-sequence');

    walkInput.addEventListener('input', () => {
        walkValue.textContent = walkInput.value;
        updateTotalTime();
    });

    sprintInput.addEventListener('input', () => {
        sprintValue.textContent = sprintInput.value;
        updateTotalTime();
    });

    cyclesInput.addEventListener('input', () => {
        updateTotalTime();
    });

    deleteButton.addEventListener('click', () => {
        sequenceElement.remove();
        updateSequences();
        updateTotalTime();
    });

    elements.sequencesList.appendChild(sequenceElement);
    updateTotalTime();
}

// Mettre à jour la liste des séquences
function updateSequences() {
    sequences = Array.from(elements.sequencesList.children).map(sequenceElement => ({
        walkDuration: parseInt(sequenceElement.querySelector('.walk-duration').value),
        sprintDuration: parseInt(sequenceElement.querySelector('.sprint-duration').value),
        cycles: parseInt(sequenceElement.querySelector('.cycles').value)
    }));
}

// Calculer et afficher le temps total
function updateTotalTime() {
    updateSequences();
    
    const warmup = parseInt(elements.warmupDuration.value);
    const cooldown = parseInt(elements.cooldownDuration.value);
    
    let totalSeconds = warmup + cooldown;
    
    sequences.forEach(sequence => {
        totalSeconds += (sequence.walkDuration + sequence.sprintDuration) * sequence.cycles;
    });

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    elements.totalTimeValue.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    elements.totalTimeMinutes.textContent = minutes;
    elements.totalTimeSeconds.textContent = seconds;
}

// Charger les réglages sauvegardés
function loadSettings() {
    elements.warmupDuration.value = localStorage.getItem(STORAGE_KEYS.WARMUP) || 300;
    elements.cooldownDuration.value = localStorage.getItem(STORAGE_KEYS.COOLDOWN) || 300;
    elements.soundEnabled.checked = localStorage.getItem(STORAGE_KEYS.SOUND) !== 'false';

    // Charger les séquences
    const savedSequences = JSON.parse(localStorage.getItem(STORAGE_KEYS.SEQUENCES) || '[]');
    elements.sequencesList.innerHTML = '';
    if (savedSequences.length === 0) {
        createSequence(); // Créer une séquence par défaut
    } else {
        savedSequences.forEach(sequence => createSequence(sequence));
    }

    // Mettre à jour tous les affichages
    updateAllDisplays();
}

// Mettre à jour tous les affichages
function updateAllDisplays() {
    elements.warmupValue.textContent = elements.warmupDuration.value;
    elements.cooldownValue.textContent = elements.cooldownDuration.value;
    updateTotalTime();
}

// Sauvegarder les réglages
function saveSettings(showAnimation = true) {
    const oldText = elements.saveButton.textContent;
    
    updateSequences();
    
    // Sauvegarder dans le localStorage
    localStorage.setItem(STORAGE_KEYS.WARMUP, elements.warmupDuration.value);
    localStorage.setItem(STORAGE_KEYS.COOLDOWN, elements.cooldownDuration.value);
    localStorage.setItem(STORAGE_KEYS.SOUND, elements.soundEnabled.checked);
    localStorage.setItem(STORAGE_KEYS.SEQUENCES, JSON.stringify(sequences));

    // Déclencher l'événement de changement
    try {
        // Créer un StorageEvent manuel
        const event = document.createEvent('StorageEvent');
        event.initStorageEvent('storage', false, false, STORAGE_KEYS.SEQUENCES, null, JSON.stringify(sequences), window.location.href, localStorage);
        window.dispatchEvent(event);
    } catch (e) {
        // Fallback pour les navigateurs qui ne supportent pas initStorageEvent
        window.dispatchEvent(new Event('storage'));
    }

    // Animation de confirmation
    if (showAnimation) {
        elements.saveButton.textContent = 'Enregistré ✓';
        elements.saveButton.classList.add('saved');
        
        setTimeout(() => {
            elements.saveButton.textContent = oldText;
            elements.saveButton.classList.remove('saved');
        }, 2000);
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();

    // Event listeners pour les contrôles principaux
    elements.warmupDuration.addEventListener('input', () => {
        elements.warmupValue.textContent = elements.warmupDuration.value;
        updateTotalTime();
    });

    elements.cooldownDuration.addEventListener('input', () => {
        elements.cooldownValue.textContent = elements.cooldownDuration.value;
        updateTotalTime();
    });

    elements.soundEnabled.addEventListener('change', () => {
        saveSettings(false);
    });

    elements.addSequenceButton.addEventListener('click', () => {
        createSequence();
    });

    elements.saveButton.addEventListener('click', () => saveSettings(true));
});
