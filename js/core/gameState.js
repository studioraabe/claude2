// gameState.js - Zentraler Spielzustand - KORRIGIERTE VERSION

import { GAME_CONSTANTS } from './constants.js';
import { clearArrays } from '../entities.js';

// Delta Time für FPS-unabhängige Bewegung
let lastTime = 0;
const targetFPS = 60;
const targetFrameTime = 1000 / targetFPS;

// Hauptzustand des Spiels
export const gameState = {
    // Spiel-Grundwerte
    gameRunning: false,
    currentState: null,
    gameSpeed: 1,
    level: 1,
    score: 0,
    lives: 3,
    maxLives: 3,
    bullets: 30,
    bulletBoxesFound: 0,
    
    // Zeitbasierte Werte
    deltaTime: 1,
    lastTime: 0,
    
    // Fortschritt und Statistiken
    levelProgress: 0,
    obstaclesAvoided: 0,
    enemiesDefeated: 0,
    bulletsHit: 0,
    consecutiveHits: 0,
    bossesKilled: 0,
    damageThisLevel: 0,
    levelsCompleted: 0,
    
    // Combo-System
    comboCount: 0,
    comboTimer: 0,
    
    // Multipliers
    scoreMultiplier: 1,
    speedMultiplier: 1,
    
    // Zustandsflags
    hasShield: false,
    hasPiercingBullets: false,
    isGhostWalking: false,
    isBerserker: false,
    
    // Temporäre Buffs/Debuffs
    postDamageInvulnerability: 0,
    postBuffInvulnerability: 0,
    magnetRange: 0,
    
    // Aktive Buffs
    activeBuffs: {
        chainLightning: 0,
        undeadResilience: 0,
        shadowLeap: 0
    },
    
    // Verfügbare Buffs
    availableBuffs: [],
    
    // Highscore
    highScore: parseInt(localStorage.getItem('highScore') || '0'),
    
    // Zeitfaktoren
    timeSlowFactor: 1,
    enemySlowFactor: 1,
    
    // Render Flag
    needsRedraw: true,
    
    // Tracking
    lastScoreTime: 0,
    scoreIn30Seconds: 0
};

// FPS-Tracking und Delta Time Berechnung
export function updateDeltaTime() {
    const currentTime = performance.now();
    
    if (gameState.lastTime === 0) {
        gameState.lastTime = currentTime;
        gameState.deltaTime = 1;
        return;
    }
    
    const rawDeltaTime = currentTime - gameState.lastTime;
    gameState.lastTime = currentTime;
    
    // Normalisiere Delta Time auf 60 FPS Basis
    gameState.deltaTime = Math.min(rawDeltaTime / targetFrameTime, 3);
    
    // Debugging bei extremen FPS-Schwankungen
    if (gameState.deltaTime > 2) {
        console.warn(`High deltaTime detected: ${gameState.deltaTime.toFixed(2)} (${(1000/rawDeltaTime).toFixed(1)} FPS)`);
    }
}

// Spiel zurücksetzen
export function resetGame() {
    console.log('DEBUG: Resetting game state...');
    
    // Grundwerte zurücksetzen
    gameState.gameSpeed = 1;
    gameState.level = 1;
    gameState.score = 0;
    gameState.lives = 3;
    gameState.maxLives = 3;
    gameState.bullets = 30;
    gameState.bulletBoxesFound = 0;
    
    // Fortschritt zurücksetzen
    gameState.levelProgress = 0;
    gameState.obstaclesAvoided = 0;
    gameState.enemiesDefeated = 0;
    gameState.bulletsHit = 0;
    gameState.consecutiveHits = 0;
    gameState.bossesKilled = 0;
    gameState.damageThisLevel = 0;
    gameState.levelsCompleted = 0;
    
    // Combo zurücksetzen
    gameState.comboCount = 0;
    gameState.comboTimer = 0;
    
    // Multipliers zurücksetzen
    gameState.scoreMultiplier = 1;
    gameState.speedMultiplier = 1;
    
    // Flags zurücksetzen
    gameState.hasShield = false;
    gameState.hasPiercingBullets = false;
    gameState.isGhostWalking = false;
    gameState.isBerserker = false;
    
    // Temporäre Werte zurücksetzen
    gameState.postDamageInvulnerability = 0;
    gameState.postBuffInvulnerability = 0;
    gameState.magnetRange = 0;
    
    // Zeitfaktoren zurücksetzen
    gameState.timeSlowFactor = 1;
    gameState.enemySlowFactor = 1;
    
    // Render Flag zurücksetzen
    gameState.needsRedraw = true;
    
    // Tracking zurücksetzen
    gameState.lastScoreTime = 0;
    gameState.scoreIn30Seconds = 0;
    
    // Delta Time zurücksetzen
    gameState.deltaTime = 1;
    gameState.lastTime = 0;
    
    // Externe Arrays leeren
    clearArrays();
    
    console.log('DEBUG: Game state reset complete');
}

// Game Loop Management
let gameLoopId = null;

export function startGameLoop() {
    if (gameLoopId) return; // Bereits läuft
    
    console.log('DEBUG: Starting game loop...');
    gameState.lastTime = performance.now();
    
    function gameLoop() {
        if (gameState.gameRunning) {
            updateDeltaTime();
            gameLoopId = requestAnimationFrame(gameLoop);
        } else {
            gameLoopId = null;
        }
    }
    
    gameLoopId = requestAnimationFrame(gameLoop);
}

export function stopGameLoop() {
    if (gameLoopId) {
        cancelAnimationFrame(gameLoopId);
        gameLoopId = null;
        console.log('DEBUG: Game loop stopped');
    }
}

// Zustandsübergänge
export function transitionToState(newState) {
    console.log(`DEBUG: Transitioning from ${gameState.currentState} to ${newState}`);
    gameState.currentState = newState;
}

// Hilfsfunktionen
export function incrementLevel() {
    gameState.level++;
    gameState.levelsCompleted++;
    gameState.levelProgress = 0;
    gameState.damageThisLevel = 0;
    gameState.bulletBoxesFound = 0;
    
    // Geschwindigkeit erhöhen
    gameState.gameSpeed = Math.min(gameState.gameSpeed + 0.1, 3);
    
    console.log(`DEBUG: Level incremented to ${gameState.level}`);
}

export function addScore(points) {
    const actualPoints = points * gameState.scoreMultiplier;
    gameState.score += actualPoints;
    
    // Highscore prüfen
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        localStorage.setItem('highScore', gameState.highScore.toString());
    }
    
    return actualPoints;
}

export function takeDamage(amount = 1) {
    gameState.lives -= amount;
    gameState.damageThisLevel += amount;
    
    // Combo zurücksetzen
    gameState.comboCount = 0;
    gameState.comboTimer = 0;
    gameState.consecutiveHits = 0;
    
    console.log(`DEBUG: Damage taken, lives now: ${gameState.lives}`);
    
    return gameState.lives <= 0;
}

export function addBullets(amount) {
    gameState.bullets += amount;
    console.log(`DEBUG: Bullets added: ${amount}, total: ${gameState.bullets}`);
}

export function useBullets(amount) {
    if (gameState.isBerserker) {
        console.log('DEBUG: Berserker mode - unlimited bullets');
        return true;
    }
    
    if (gameState.bullets >= amount) {
        gameState.bullets -= amount;
        console.log(`DEBUG: Bullets used: ${amount}, remaining: ${gameState.bullets}`);
        return true;
    }
    
    console.log(`DEBUG: Not enough bullets - need: ${amount}, have: ${gameState.bullets}`);
    return false;
}

// Buff-Management
export function activateBuff(buffType, duration = null) {
    switch(buffType) {
        case 'chainLightning':
            gameState.activeBuffs.chainLightning = 1;
            break;
        case 'undeadResilience':
            gameState.activeBuffs.undeadResilience = 1;
            break;
        case 'shadowLeap':
            gameState.activeBuffs.shadowLeap = 1;
            break;
    }
    
    console.log(`DEBUG: Buff activated: ${buffType}`);
}

export function deactivateBuff(buffType) {
    if (gameState.activeBuffs[buffType]) {
        gameState.activeBuffs[buffType] = 0;
        console.log(`DEBUG: Buff deactivated: ${buffType}`);
    }
}

// Utility Functions
export function isGameRunning() {
    return gameState.gameRunning && gameState.currentState !== null;
}

export function getGameStats() {
    return {
        level: gameState.level,
        score: gameState.score,
        lives: gameState.lives,
        bullets: gameState.bullets,
        bulletBoxesFound: gameState.bulletBoxesFound,
        enemiesDefeated: gameState.enemiesDefeated,
        bossesKilled: gameState.bossesKilled,
        comboCount: gameState.comboCount,
        highScore: gameState.highScore
    };
}

// Debug-Funktionen
export function debugGameState() {
    console.log('=== GAME STATE DEBUG ===');
    console.log('Running:', gameState.gameRunning);
    console.log('State:', gameState.currentState);
    console.log('Level:', gameState.level);
    console.log('Score:', gameState.score);
    console.log('Lives:', gameState.lives);
    console.log('Bullets:', gameState.bullets);
    console.log('BulletBoxesFound:', gameState.bulletBoxesFound);
    console.log('Combo:', gameState.comboCount, 'Timer:', gameState.comboTimer);
    console.log('Delta Time:', gameState.deltaTime);
    console.log('========================');
}

// Globale Debug-Funktion
window.debugGameState = debugGameState;