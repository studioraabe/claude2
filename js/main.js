// main.js - Hauptspiel-Loop - FIXED VERSION

import { gameState, resetGame, updateDeltaTime, transitionToState } from './core/gameState.js';
import { GameState, GAME_CONSTANTS, CANVAS } from './core/constants.js';
import { camera, updateCamera, resetCamera } from './core/camera.js';
import { player, updatePlayer, resetPlayer } from './core/player.js';
import { initInput, keys } from './core/input.js';
import { render } from './rendering/renderer.js';
import { 
    obstacles, bulletsFired, drops, 
    spawnObstacle, updateAllEntities, checkCollisions, clearArrays,
    resetBulletBoxesFound, bloodParticles, lightningEffects, 
    scorePopups, doubleJumpParticles, dropParticles, explosions
} from './entities.js';
import { 
    updateDropBuffs, 
    checkAchievements, displayHighscores, soundManager
} from './systems.js';
import { 
    updateUI, updateEnhancedDisplays, initializeUI, 
    showScreen, gameOver, pauseGame, resumeGame 
} from './ui.js';

// KRITISCH: Mache gameState, camera und player global verfügbar für Debugging
window.gameState = gameState;
window.camera = camera;
window.player = player;
window.soundManager = soundManager;

// FIXED: Mache alle Entity-Arrays global verfügbar
window.obstacles = obstacles;
window.bulletsFired = bulletsFired;
window.drops = drops;
window.bloodParticles = bloodParticles;
window.lightningEffects = lightningEffects;
window.scorePopups = scorePopups;
window.doubleJumpParticles = doubleJumpParticles;
window.dropParticles = dropParticles;
window.explosions = explosions;
window.render = render;

// Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// KRITISCH: Disable image smoothing für Pixel Art
ctx.imageSmoothingEnabled = false;

// Set canvas dimensions
canvas.width = CANVAS.width;
canvas.height = CANVAS.height;

// Game Loop ID für Kontrolle
let gameLoopId = null;

// Event Listeners Setup
function setupEventListeners() {
    console.log('DEBUG: Setting up event listeners...');
    
    // Initialize input system
    initInput();
    
    console.log('DEBUG: Event listeners setup complete');
}

// Game Loop mit Render-Aufruf
function gameLoop() {
    // Update delta time
    updateDeltaTime();
    
    // Nur wenn das Spiel läuft
    if (gameState.gameRunning && gameState.currentState === GameState.PLAYING) {
        // Update player - Pass both keys and gameState
        updatePlayer(keys, gameState);
        
        // Update camera
        updateCamera(player);
        
        // Update drop buffs
        updateDropBuffs();
        
        // Spawn obstacles
        spawnObstacle(gameState.level, gameState.gameSpeed, gameState.timeSlowFactor);
        
        // Update all entities
        updateAllEntities(gameState);
        
        // Check collisions
        const gameOverResult = checkCollisions(gameState);
        if (gameOverResult) {
            gameOver();
            return;
        }
        
        // Check level completion
        checkLevelCompletion();
        
        // Update UI
        updateUI();
        updateEnhancedDisplays();
    }
    
    // KRITISCH: Render immer
    render(ctx);
    
    // Continue game loop
    gameLoopId = requestAnimationFrame(gameLoop);
}

function checkLevelCompletion() {
    if (gameState.bulletBoxesFound >= 4) {
        transitionToState(GameState.LEVEL_COMPLETE);
        gameState.gameRunning = false;
        showScreen('levelComplete');
        checkAchievements();
    }
}

// Game Control Functions
function startGame() {
    console.log('DEBUG: Starting game...');
    
    // Reset everything first
    resetGame();
    resetPlayer();
    resetCamera();
    clearArrays();
    resetBulletBoxesFound();
    
    // Then transition to playing
    transitionToState(GameState.PLAYING);
    gameState.gameRunning = true;
    
    // Hide all screens
    const screens = ['startScreen', 'levelComplete', 'gameOver', 'pauseScreen'];
    screens.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.style.display = 'none';
    });
    
    // Initialize sound
    soundManager.init();
    if (soundManager.audioContext) {
        soundManager.audioContext.resume();
    }
    soundManager.startBackgroundMusic();
    
    // Update UI
    updateUI();
    updateEnhancedDisplays();
    
    // Start game loop if not already running
    if (!gameLoopId) {
        gameLoop();
    }
    
    console.log('DEBUG: Game started successfully');
    console.log('Camera:', camera);
    console.log('Player:', player);
}

function restartGame() {
    console.log('DEBUG: Restarting game...');
    
    // Reset everything
    resetGame();
    resetPlayer();
    resetCamera();
    clearArrays();
    resetBulletBoxesFound();
    
    // Transition to playing
    transitionToState(GameState.PLAYING);
    gameState.gameRunning = true;
    
    // Hide all screens
    const screens = ['startScreen', 'levelComplete', 'gameOver', 'pauseScreen'];
    screens.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.style.display = 'none';
    });
    
    // Restart music
    soundManager.startBackgroundMusic();
    
    // Update UI
    updateUI();
    updateEnhancedDisplays();
    
    console.log('DEBUG: Game restarted successfully');
}

// Initialize Game
function initializeGame() {
    console.log('DEBUG: Initializing game...');
    
    // Initialize UI first
    initializeUI();
    displayHighscores();
    setupEventListeners();
    
    // Set initial state
    transitionToState(GameState.START);
    gameState.gameRunning = false;
    
    // Show start screen
    showScreen('startScreen');
    
    // Start the main game loop (it will render even when not playing)
    if (!gameLoopId) {
        gameLoop();
    }
    
    console.log('DEBUG: Game initialized successfully');
    console.log('DEBUG: Initial gameState:', {
        currentState: gameState.currentState,
        gameRunning: gameState.gameRunning,
        bullets: gameState.bullets,
        bulletBoxesFound: gameState.bulletBoxesFound
    });
}

// Start the game when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGame);
} else {
    initializeGame();
}

// Global functions
window.startGame = startGame;
window.pauseGame = pauseGame;
window.resumeGame = resumeGame;
window.restartGame = restartGame;

// Debug functions
window.debugGame = () => {
    console.log('=== GAME DEBUG INFO ===');
    console.log('Game State:', gameState.currentState);
    console.log('Game Running:', gameState.gameRunning);
    console.log('Level:', gameState.level);
    console.log('Score:', gameState.score);
    console.log('Lives:', gameState.lives);
    console.log('Bullets:', gameState.bullets);
    console.log('Player Position:', { x: player.x, y: player.y });
    console.log('Camera Position:', camera.x);
    console.log('Obstacles:', obstacles.length);
    console.log('Canvas Context:', ctx);
    console.log('======================');
};

window.forceUpdateUI = () => {
    updateUI();
    updateEnhancedDisplays();
    console.log('UI force updated');
};

window.forceStartGame = () => {
    console.log('DEBUG: Force starting game...');
    startGame();
};

// Export for other modules
export { gameLoop, startGame, restartGame };