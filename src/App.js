import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [currentPhase, setCurrentPhase] = useState('preparation'); // 'preparation', 'high', 'low'
  
  // Configuration des intervalles (en secondes)
  const phases = {
    preparation: 10,
    high: 60,  // 1 minute de marche intensive
    low: 90    // 1.5 minutes de récupération
  };

  useEffect(() => {
    let interval = null;
    
    if (isRunning) {
      interval = setInterval(() => {
        setTime(prevTime => {
          const newTime = prevTime + 1;
          
          // Gestion des phases
          if (currentPhase === 'preparation' && newTime >= phases.preparation) {
            setCurrentPhase('high');
            return 0;
          } else if (currentPhase === 'high' && newTime >= phases.high) {
            setCurrentPhase('low');
            return 0;
          } else if (currentPhase === 'low' && newTime >= phases.low) {
            setCurrentPhase('high');
            return 0;
          }
          
          return newTime;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, currentPhase]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
    if (!isRunning) {
      setTime(0);
      setCurrentPhase('preparation');
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTime(0);
    setCurrentPhase('preparation');
  };

  const getPhaseColor = () => {
    switch (currentPhase) {
      case 'preparation':
        return '#yellow';
      case 'high':
        return '#ff4444';
      case 'low':
        return '#44ff44';
      default:
        return '#ffffff';
    }
  };

  const getPhaseText = () => {
    switch (currentPhase) {
      case 'preparation':
        return 'Préparation';
      case 'high':
        return 'Marche Intensive!';
      case 'low':
        return 'Récupération';
      default:
        return '';
    }
  };

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>HIIT Walk Timer</h1>
        <div className="timer-display" style={{ backgroundColor: getPhaseColor() }}>
          <h2>{getPhaseText()}</h2>
          <div className="time">{formatTime(time)}</div>
          <div className="phase-time">
            Temps restant: {formatTime(
              currentPhase === 'preparation' ? phases.preparation - time :
              currentPhase === 'high' ? phases.high - time :
              phases.low - time
            )}
          </div>
        </div>
        <div className="controls">
          <button onClick={toggleTimer}>
            {isRunning ? 'Pause' : 'Démarrer'}
          </button>
          <button onClick={resetTimer}>
            Réinitialiser
          </button>
        </div>
      </header>
    </div>
  );
}

export default App;
