// ui.js - KORRIGIERTE VERSION ohne Hearts Display Bug

import { GameState, DUNGEON_THEME } from './core/constants.js';
import { gameState, resetGame, transitionToState } from './core/gameState.js';
import { soundManager, checkAchievements, saveHighScore, checkForTop10Score, displayHighscores } from './systems.js';
import { activeDropBuffs } from './systems.js';
import { 
    updateEnhancedComboDisplay, 
    updateEnhancedBuffDisplay,
    initEnhancedContainers
} from './ui-enhancements.js';

// Screen Management
export function hideAllScreens() {
    const screens = ['startScreen', 'levelComplete', 'gameOver', 'pauseScreen', 'newHighScore', 'infoOverlay'];
    screens.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.style.display = 'none';
    });
}

export function showScreen(screenId) {
    hideAllScreens();
    const element = document.getElementById(screenId);
    if (element) element.style.display = 'block';
}

// Stats Container Creation - KORRIGIERT
export function createOptimizedStatsContainer() {
    console.log('DEBUG: Creating optimized stats container...');
    
    // Entferne alle alten Container
    const oldIds = ['bullets', 'bulletCounter', 'bulletsDisplay', 'bulletsContainer', 'bulletcount', 
                   'bottomStatsContainer', 'healthContainer', 'bulletContainer',
                   'centerUI', 'heartsContainer', 'bulletsContainer'];
    
    oldIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            console.log(`DEBUG: Removing old element with ID: ${id}`);
            element.remove();
        }
    });
    
    // Health Bar - Links oben (kritische Info)
    const healthContainer = document.createElement('div');
    healthContainer.className = 'health-container';
    healthContainer.id = 'healthContainer';
    healthContainer.style.cssText = `
        position: absolute !important;
        top: 16px !important;
        left: 16px !important;
        z-index: 15 !important;
        background: var(--glass-dark) !important;
        border: 1px solid var(--glass-border) !important;
        border-radius: var(--border-radius) !important;
        padding: 8px 12px !important;
        height: 40px !important;
        display: flex !important;
        align-items: center !important;
        gap: 8px !important;
        pointer-events: none;
    `;
    
    const heartsContainer = document.createElement('div');
    heartsContainer.id = 'heartsContainer';
    heartsContainer.style.cssText = `
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 2px !important;
        min-width: 80px !important;
    `;
    
    healthContainer.appendChild(heartsContainer);
    
    // Bullet Counter - Rechts oben (wichtige Ressource)
    const bulletContainer = document.createElement('div');
    bulletContainer.className = 'bullet-container';
    bulletContainer.id = 'bulletContainer';
    bulletContainer.style.cssText = `
        position: absolute !important;
        top: 16px !important;
        right: 16px !important;
        z-index: 15 !important;
        background: var(--glass-dark) !important;
        border: 1px solid var(--glass-border) !important;
        border-radius: var(--border-radius) !important;
        padding: 8px 12px !important;
        height: 40px !important;
        display: flex !important;
        align-items: center !important;
        gap: 8px !important;
        pointer-events: none;
    `;
    
    const bulletIcon = document.createElement('span');
    bulletIcon.className = 'bullet-icon';
    bulletIcon.id = 'bulletIcon';
    bulletIcon.textContent = '🗲';
    bulletIcon.style.cssText = `
        font-size: 24px !important;
        color: var(--accent) !important;
        line-height: 1 !important;
        margin-top: -2px !important;
    `;
    
    const bulletCount = document.createElement('span');
    bulletCount.className = 'bullet-count';
    bulletCount.id = 'bulletCount';
    bulletCount.textContent = gameState ? gameState.bullets.toString() : '30';
    bulletCount.style.cssText = `
        color: var(--text-accent) !important;
        font-weight: 600 !important;
        font-family: 'Rajdhani', monospace !important;
        font-size: 24px !important;
        line-height: 1 !important;
    `;
    
    console.log(`DEBUG: Created bullet counter with ID: ${bulletCount.id}, initial value: ${bulletCount.textContent}`);
    
    bulletContainer.appendChild(bulletIcon);
    bulletContainer.appendChild(bulletCount);
    
    // Füge zum Game Container hinzu
    const gameContainer = document.getElementById('gameContainer');
    if (gameContainer) {
        gameContainer.appendChild(healthContainer);
        gameContainer.appendChild(bulletContainer);
        console.log('DEBUG: Added containers to game container');
    } else {
        console.error('DEBUG: Game container not found!');
    }
}

// KORRIGIERTE Hearts Display - nur anzeigen wenn Spiel läuft
export function updateHeartsDisplay() {
    // NUR im Spiel anzeigen, nicht im Start Screen
    if (!gameState || gameState.currentState === GameState.START) {
        return;
    }
    
    const heartsContainer = document.getElementById('heartsContainer');
    if (!heartsContainer) {
        console.warn('DEBUG: Hearts container not found, trying to recreate...');
        createOptimizedStatsContainer();
        return;
    }
    
    heartsContainer.innerHTML = '';
    
    // Erstelle Segmente für Health Bar
    for (let i = 0; i < gameState.maxLives; i++) {
        const segment = document.createElement('div');
        segment.className = 'heart-segment';
        segment.style.cssText = `
            width: 16px;
            height: 12px;
            border-radius: 2px;
            transition: all 0.3s ease;
            margin: 0 !important;
        `;
        
        if (i < gameState.lives) {
            // Shield aktiv: Verwende blaue Farben
            if (gameState.hasShield) {
                if (gameState.lives === 1) {
                    segment.style.backgroundColor = '#1E3A8A';
                } else if (gameState.lives === 2) {
                    segment.style.backgroundColor = '#1E40AF';
                } else {
                    segment.style.backgroundColor = '#4169E1';
                }
            } else {
                // Normale Farben ohne Shield
                if (gameState.lives === 1) {
                    segment.style.backgroundColor = '#FF0000';
                } else if (gameState.lives === 2) {
                    segment.style.backgroundColor = '#FFAA00';
                } else {
                    segment.style.backgroundColor = '#00FF00';
                }
            }
        } else {
            // Leere Segmente
            if (gameState.hasShield) {
                segment.style.backgroundColor = '#3B82F6';
                segment.style.opacity = '0.3';
            } else {
                segment.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                segment.style.border = '1px dashed rgba(255, 255, 255, 0.3)';
            }
        }
        
        heartsContainer.appendChild(segment);
    }
}

// KORRIGIERTES HUD Update
export function updateUI() {
    console.log('DEBUG: updateUI called, currentState:', gameState.currentState);
    
    // Stelle sicher dass Container existieren, aber nur wenn nötig
    if (gameState.currentState === GameState.PLAYING || gameState.currentState === GameState.PAUSED) {
        if (!document.getElementById('healthContainer') || !document.getElementById('bulletContainer')) {
            console.log('DEBUG: Containers missing during gameplay, recreating...');
            createOptimizedStatsContainer();
        }
    }
    
    // Update main UI elements
    const scoreEl = document.getElementById('score');
    const levelEl = document.getElementById('level');
    const bulletCountEl = document.getElementById('bulletCount');
    const highscoreEl = document.getElementById('highscoreValue');
    
    console.log('DEBUG: Found elements:', {
        score: !!scoreEl,
        level: !!levelEl,
        bulletCount: !!bulletCountEl,
        highscore: !!highscoreEl
    });
    
    if (scoreEl && gameState) {
        scoreEl.textContent = gameState.score;
    }
    
    if (levelEl && gameState) {
        levelEl.textContent = gameState.level;
    }
    
    if (bulletCountEl && gameState) {
        const bulletValue = gameState.isBerserker ? '∞' : gameState.bullets;
        bulletCountEl.textContent = bulletValue;
        console.log('DEBUG: Updated bullet count to:', bulletValue);
    }
    
    if (highscoreEl && gameState) {
        highscoreEl.textContent = gameState.highScore;
    }
    
    // NUR Hearts Display updaten wenn im Spiel
    if (gameState && (gameState.currentState === GameState.PLAYING || gameState.currentState === GameState.PAUSED)) {
        updateHeartsDisplay();
    }
    
    if (gameState && gameState.currentState === GameState.LEVEL_COMPLETE) {
        updateBuffButtons();
    }
}

// Separate function for enhanced displays
export function updateEnhancedDisplays() {
    // Nur während des Spiels
    if (!gameState || gameState.currentState !== GameState.PLAYING) {
        return;
    }
    
    const buffContainer = document.getElementById('enhancedBuffs');
    const comboDisplay = document.getElementById('comboDisplay');
    
    if (!buffContainer || !comboDisplay) {
        console.warn('DEBUG: Enhanced display containers missing, reinitializing...');
        initEnhancedContainers();
    }
    
    updateEnhancedBuffDisplay();
    updateEnhancedComboDisplay();
}

export function updateActiveBuffsDisplay() {
    const buffDisplay = document.getElementById('activeBuffs');
    if (!buffDisplay || !gameState) return;
    
    let buffText = '';
    
    // Permanent buffs
    if (gameState.activeBuffs.chainLightning > 0) {
        buffText += '⚡ Chain Lightning ';
    }
    if (gameState.activeBuffs.undeadResilience > 0) {
        buffText += '🧟 Undead Vigor ';
    }
    if (gameState.activeBuffs.shadowLeap > 0) {
        buffText += '🌙 Shadow Leap ';
    }
    
    // Temporary drop buffs
    Object.keys(activeDropBuffs).forEach(buff => {
        const remaining = Math.ceil(activeDropBuffs[buff] / 60);
        switch(buff) {
            case 'speedBoost': buffText += `⚡(${remaining}s) `; break;
            case 'jumpBoost': buffText += `🚀(${remaining}s) `; break;
            case 'scoreMultiplier': buffText += `💰(${remaining}s) `; break;
            case 'magnetMode': buffText += `🌟(${remaining}s) `; break;
            case 'berserkerMode': buffText += `🔥(${remaining}s) `; break;
            case 'ghostWalk': buffText += `👻(${remaining}s) `; break;
            case 'timeSlow': buffText += `⏰(${remaining}s) `; break;
        }
    });
    
    if (buffText) {
        buffDisplay.textContent = buffText;
        buffDisplay.style.display = 'block';
    } else {
        buffDisplay.style.display = 'none';
    }
}

export function updatePauseScreen() {
    if (!gameState) return;
    
    const pauseScore = document.getElementById('pauseScore');
    const pauseLevel = document.getElementById('pauseLevel');
    const pauseLives = document.getElementById('pauseLives');
    
    if (pauseScore) pauseScore.textContent = gameState.score;
    if (pauseLevel) pauseLevel.textContent = gameState.level;
    if (pauseLives) pauseLives.textContent = gameState.lives;
}

export function updateBuffButtons() {
    const buffButtonsContainer = document.getElementById('buffButtons');
    if (!buffButtonsContainer || !gameState) return;
    
    buffButtonsContainer.innerHTML = '';
    
    gameState.availableBuffs.forEach(buff => {
        const button = document.createElement('div');
        button.className = 'buff-card';
        button.onclick = () => chooseBuff(buff.id);
        
        const title = document.createElement('div');
        title.className = 'buff-title';
        title.textContent = buff.title;
        
        const desc = document.createElement('div');
        desc.className = 'buff-desc';
        desc.textContent = buff.desc;
        
        button.appendChild(title);
        button.appendChild(desc);
        buffButtonsContainer.appendChild(button);
    });
}

export function updateHighScore() {
    if (!gameState) return;
    
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        saveHighScore(gameState.highScore);
        const newHighScoreEl = document.getElementById('newHighScore');
        if (newHighScoreEl) newHighScoreEl.style.display = 'block';
    }
    const highscoreValueEl = document.getElementById('highscoreValue');
    if (highscoreValueEl) highscoreValueEl.textContent = gameState.highScore;
}

// Menu Handling
export function startGame() {
    console.log('DEBUG: Starting game...');
    
    soundManager.init();
    if (soundManager.audioContext) {
        soundManager.audioContext.resume();
    }
    soundManager.startBackgroundMusic();
    
    transitionToState(GameState.PLAYING);
    gameState.gameRunning = true;
    resetGame();
    hideAllScreens();
    
    // Erstelle Container
    createOptimizedStatsContainer();
    
    // Initialize enhanced containers
    initEnhancedContainers();
    
    updateUI();
    
    // Force update nach kurzer Verzögerung
    setTimeout(() => {
        updateEnhancedDisplays();
        updateUI();
    }, 100);
}

export function restartGame() {
    console.log('DEBUG: Restarting game...');
    
    transitionToState(GameState.PLAYING);
    gameState.gameRunning = true;
    resetGame();
    hideAllScreens();
    
    soundManager.startBackgroundMusic();
    
    // Erstelle Container
    createOptimizedStatsContainer();
    
    // Initialize enhanced containers
    initEnhancedContainers();
    
    updateUI();
    
    setTimeout(() => {
        updateEnhancedDisplays();
        updateUI();
    }, 100);
}

export function pauseGame() {
    if (gameState.currentState === GameState.PLAYING) {
        transitionToState(GameState.PAUSED);
        gameState.gameRunning = false;
        
        soundManager.pauseBackgroundMusic();
        
        updatePauseScreen();
        showScreen('pauseScreen');
    }
}

export function resumeGame() {
    if (gameState.currentState === GameState.PAUSED) {
        transitionToState(GameState.PLAYING);
        gameState.gameRunning = true;
        
        soundManager.resumeBackgroundMusic();
        
        hideAllScreens();
    }
}

export function gameOver() {
    transitionToState(GameState.GAME_OVER);
    gameState.gameRunning = false;
    
    soundManager.stopBackgroundMusic();
    
    updateHighScore();
    soundManager.death();
    
    displayHighscores();
    
    const finalScoreEl = document.getElementById('finalScore');
    const levelsCompletedEl = document.getElementById('levelsCompleted');
    
    if (finalScoreEl) finalScoreEl.textContent = gameState.score;
    if (levelsCompletedEl) levelsCompletedEl.textContent = gameState.levelsCompleted;
    
    checkForTop10Score(gameState.score);
    
    showScreen('gameOver');
}

export function toggleMute() {
    soundManager.toggleMute();
    
    if (!soundManager.isMuted && gameState.currentState === GameState.PLAYING) {
        soundManager.resumeBackgroundMusic();
    }
}

export function chooseBuff(buffType) {
    if (!gameState) return;
    
    switch(buffType) {
        case 'undeadResilience':
            gameState.activeBuffs.undeadResilience = 1;
            break;
        case 'shadowLeap':
            gameState.activeBuffs.shadowLeap = 1;
            break;
        case 'chainLightning':
            gameState.activeBuffs.chainLightning = 1;
            break;
    }
    
    gameState.availableBuffs = gameState.availableBuffs.filter(buff => buff.id !== buffType);
    
    gameState.level++;
    gameState.levelProgress = 1;
    gameState.bulletBoxesFound = 0;
    gameState.damageThisLevel = 0;
    gameState.gameSpeed += 0.6;
    gameState.bullets += 12;
    
    gameState.postBuffInvulnerability = 120;
    
    transitionToState(GameState.PLAYING);
    gameState.gameRunning = true;
    hideAllScreens();
    updateUI();
}

export function applyTheme() {
    const container = document.getElementById('gameContainer');
    if (container) container.className = 'dungeon-theme';
    
    const updates = [
        ['gameTitle', DUNGEON_THEME.title],
        ['startButton', DUNGEON_THEME.startButton],
        ['scoreLabel', DUNGEON_THEME.labels.score],
        ['levelLabel', DUNGEON_THEME.labels.level],
        ['bulletsLabel', DUNGEON_THEME.labels.bullets],
        ['livesLabel', DUNGEON_THEME.labels.lives],
        ['highscoreLabel', DUNGEON_THEME.labels.highScore],
        ['scoreStatLabel', DUNGEON_THEME.labels.score],
        ['enemiesStatLabel', DUNGEON_THEME.labels.enemies],
        ['gameOverTitle', DUNGEON_THEME.labels.gameOver],
        ['finalScoreLabel', DUNGEON_THEME.labels.finalScore],
        ['pauseScoreLabel', DUNGEON_THEME.labels.score],
        ['pauseLevelLabel', DUNGEON_THEME.labels.level],
        ['pauseLivesLabel', DUNGEON_THEME.labels.lives],
        ['buffChoiceTitle', '🔮 Choose Your Dark Power:']
    ];

    updates.forEach(([id, text]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = text;
    });

    if (gameState) {
        gameState.activeBuffs = {};
        gameState.availableBuffs = [...DUNGEON_THEME.buffs];
    }
    
    updateUI();
}

export function initializeUI() {
    console.log('DEBUG: Initializing UI system...');
    
    // Warte kurz bevor UI erstellt wird
    setTimeout(() => {
        createOptimizedStatsContainer();
        initEnhancedContainers();
        applyTheme();
        updateUI();
    }, 100);
    
    console.log('DEBUG: UI system initialized');
}

// Global functions
window.startGame = startGame;
window.pauseGame = pauseGame;
window.resumeGame = resumeGame;
window.restartGame = restartGame;
window.chooseBuff = chooseBuff;
window.gameOver = gameOver;
window.showScreen = showScreen;
window.hideAllScreens = hideAllScreens;
window.updateUI = updateUI;
window.updateEnhancedDisplays = updateEnhancedDisplays;
window.initializeUI = initializeUI;

window.toggleMute = () => soundManager.toggleMute();

window.toggleInfoOverlay = function() {
    const infoOverlay = document.getElementById('infoOverlay');
    if (!infoOverlay) return;
    
    if (infoOverlay.style.display === 'block') {
        infoOverlay.style.display = 'none';
        if (gameState.currentState === GameState.PAUSED && gameState.gameRunning === false) {
            resumeGame();
        }
    } else {
        if (gameState.currentState === GameState.PLAYING && gameState.gameRunning === true) {
            transitionToState(GameState.PAUSED);
            gameState.gameRunning = false;
        }
        infoOverlay.style.display = 'block';
    }
};

// DEBUG Funktionen
window.testBulletCounter = function() {
    console.log('DEBUG: Testing bullet counter...');
    const bulletCountEl = document.getElementById('bulletCount');
    if (bulletCountEl) {
        bulletCountEl.textContent = '999';
        console.log('DEBUG: Set bullet counter to 999');
    } else {
        console.error('DEBUG: Bullet counter element not found!');
    }
};

window.debugUIState = function() {
    console.log('=== UI DEBUG STATE ===');
    console.log('Game State:', gameState?.currentState);
    console.log('Game Running:', gameState?.gameRunning);
    console.log('Health Container:', !!document.getElementById('healthContainer'));
    console.log('Bullet Container:', !!document.getElementById('bulletContainer'));
    console.log('Hearts Container:', !!document.getElementById('heartsContainer'));
    console.log('Bullet Count Element:', !!document.getElementById('bulletCount'));
    console.log('=====================');
};