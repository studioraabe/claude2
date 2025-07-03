// main.js - Hauptspiel-Loop - Mit globaler gameState

import { gameState, resetGame, updateDeltaTime, transitionToState } from './core/gameState.js';
import { GameState, GAME_CONSTANTS, CANVAS } from './core/constants.js';
import { camera, updateCamera, resetCamera } from './core/camera.js';
import { player, updatePlayer, resetPlayer } from './core/player.js';
import { initInput, keys } from './core/input.js';
import { render } from './rendering/renderer.js';
import { 
    obstacles, bulletsFired, drops, 
    spawnObstacle, updateAllEntities, checkCollisions, clearArrays
} from './entities.js';
import { 
    updateDropBuffs, 
    checkAchievements, displayHighscores 
} from './systems.js';
import { 
    updateUI, updateEnhancedDisplays, initializeUI, 
    showScreen, gameOver, pauseGame, resumeGame 
} from './ui.js';

// KRITISCH: Mache gameState global verfügbar
window.gameState = gameState;

// Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// KRITISCH: Disable image smoothing für Pixel Art
ctx.imageSmoothingEnabled = false;

// Game Loop ID für Kontrolle
let gameLoopId = null;

// Event Listeners Setup
function setupEventListeners() {
    console.log('DEBUG: Setting up event listeners...');
    
    // Initialize input system
    initInput();
    
    // Focus Management - ENTFERNT für Debug
    // window.addEventListener('blur', () => {
    //     if (gameState.currentState === GameState.PLAYING) {
    //         pauseGame();
    //     }
    // });
    
    console.log('DEBUG: Event listeners setup complete');
}

// Game Loop mit Render-Aufruf
function gameLoop() {
    // Update delta time
    updateDeltaTime();
    
    // Nur wenn das Spiel läuft
    if (gameState.gameRunning && gameState.currentState === GameState.PLAYING) {
        // Update player
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
    
    resetGame();
    resetPlayer();
    resetCamera();
    clearArrays();
    
    transitionToState(GameState.PLAYING);
    gameState.gameRunning = true;
    
    const screens = ['startScreen', 'levelComplete', 'gameOver', 'pauseScreen'];
    screens.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.style.display = 'none';
    });
    
    updateUI();
    updateEnhancedDisplays();
    
    if (!gameLoopId) {
        gameLoop();
    }
    
    console.log('DEBUG: Game started successfully');
}

function restartGame() {
    console.log('DEBUG: Restarting game...');
    
    resetGame();
    resetPlayer();
    resetCamera();
    clearArrays();
    
    transitionToState(GameState.PLAYING);
    gameState.gameRunning = true;
    
    const screens = ['startScreen', 'levelComplete', 'gameOver', 'pauseScreen'];
    screens.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.style.display = 'none';
    });
    
    updateUI();
    updateEnhancedDisplays();
    
    console.log('DEBUG: Game restarted successfully');
}

// Initialize Game
function initializeGame() {
    console.log('DEBUG: Initializing game...');
    
    canvas.width = CANVAS.width;
    canvas.height = CANVAS.height;
    
    console.log(`DEBUG: Canvas size set to ${CANVAS.width}x${CANVAS.height}`);
    
    initializeUI();
    displayHighscores();
    setupEventListeners();
    
    transitionToState(GameState.START);
    gameState.gameRunning = false;
    
    showScreen('startScreen');
    
    // Start the main game loop
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