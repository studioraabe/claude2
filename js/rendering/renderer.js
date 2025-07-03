// rendering/renderer.js - KORRIGIERTE IMPORTS

import { gameState } from '../core/gameState.js';
import { GameState } from '../core/constants.js';
import { getScreenX, camera } from '../core/camera.js';
import { player } from '../core/player.js';  // Player-Daten
import { obstacles, bulletsFired, drops } from '../entities.js';
import { CANVAS } from '../core/constants.js';

import { drawEnvironment } from './environment.js';
import { drawPlayer } from './player.js';  // KORRIGIERT: ./player.js statt ../core/player.js
import { drawEnemy } from './enemies.js';
import { drawEffects, drawBullet, drawDrop } from './effects.js';

let renderCount = 0;
let lastDebugLog = 0;

export function render(ctx) {
    renderCount++;
    
    // Debug log every 60 frames (once per second at 60fps)
    const now = Date.now();
    if (now - lastDebugLog > 5000) { // Every 5 seconds
        console.log(`DEBUG: Rendering - State: ${gameState.currentState}, Frame: ${renderCount}, Camera: ${camera.x}, Player: ${player.x}, Objects: ${obstacles.length} obstacles`);
        lastDebugLog = now;
    }
    
    // Clear canvas
    ctx.clearRect(0, 0, CANVAS.width, CANVAS.height);
    
    // Always render something for debugging
    if (gameState.currentState === GameState.START) {
        // Render a simple background for start screen
        ctx.fillStyle = '#0a0a0f';
        ctx.fillRect(0, 0, CANVAS.width, CANVAS.height);
        
        // Draw some test content
        ctx.fillStyle = '#00ff88';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Ready - Press Start!', CANVAS.width / 2, CANVAS.height / 2);
        
        return;
    }
    
    // Only render game content when playing or paused
    if (gameState.currentState !== GameState.PLAYING && gameState.currentState !== GameState.PAUSED) {
        return;
    }
    
    // Time slow effect overlay
    if (gameState.timeSlowFactor < 1) {
        ctx.fillStyle = 'rgba(0, 206, 209, 0.01)';
        ctx.fillRect(0, 0, CANVAS.width, CANVAS.height);
    }
    
    // 1. Draw environment (background, ground, torches)
    drawEnvironment(ctx, camera);
    
    // 2. Draw drops
    for (const drop of drops) {
        const screenX = getScreenX(drop.x);
        if (screenX > -50 && screenX < CANVAS.width + 50) {
            drawDrop(ctx, drop);
        }
    }
    
    // 3. Draw obstacles/enemies with proper depth sorting
    const backgroundObjects = [];
    const dynamicObjects = [];
    const foregroundObjects = [];

    // Sammle alle Objekte und kategorisiere sie
    for (const obstacle of obstacles) {
        const screenX = getScreenX(obstacle.x);
        if (screenX > -200 && screenX < CANVAS.width + 200) {
            if (obstacle.type === 'frankensteinTable' || obstacle.type === 'teslaCoil') {
                foregroundObjects.push({
                    type: 'obstacle',
                    object: obstacle,
                    y: obstacle.y + obstacle.height,
                    screenX: screenX
                });
            }
            else if (obstacle.type === 'boltBox' || obstacle.type === 'rock') {
                backgroundObjects.push({
                    type: 'obstacle',
                    object: obstacle,
                    y: obstacle.y + obstacle.height,
                    screenX: screenX
                });
            }
            else {
                dynamicObjects.push({
                    type: 'obstacle',
                    object: obstacle,
                    y: obstacle.y + obstacle.height,
                    screenX: screenX
                });
            }
        }
    }

    // Füge Player zu den dynamischen Objekten hinzu
    const playerScreenX = getScreenX(player.x);
    dynamicObjects.push({
        type: 'player',
        object: player,
        y: player.y + player.height,
        screenX: playerScreenX
    });

    // Sortiere jede Kategorie nach Y-Position
    backgroundObjects.sort((a, b) => a.y - b.y);
    dynamicObjects.sort((a, b) => a.y - b.y);
    foregroundObjects.sort((a, b) => a.y - b.y);

    // Rendere in der korrekten Reihenfolge:
    // 1. Background Obstacles
    for (const item of backgroundObjects) {
        drawEnemy(item.object, ctx);
    }

    // 2. Dynamic Objects (Player + Enemies)
    for (const item of dynamicObjects) {
        if (item.type === 'obstacle') {
            drawEnemy(item.object, ctx);
        } else if (item.type === 'player') {
            drawPlayer(ctx, item.screenX, item.object.y, item.object, gameState);
        }
    }

    // 3. Foreground Obstacles
    for (const item of foregroundObjects) {
        drawEnemy(item.object, ctx);
    }
    
    // 4. Draw bullets
    for (const bullet of bulletsFired) {
        const screenX = getScreenX(bullet.x);
        if (screenX > -20 && screenX < CANVAS.width + 20) {
            drawBullet(ctx, screenX, bullet.y, bullet.enhanced, gameState.hasPiercingBullets);
        }
    }
    
    // 5. Draw all effects
    drawEffects(ctx, {
        bloodParticles: window.bloodParticles || [],
        lightningEffects: window.lightningEffects || [],
        scorePopups: window.scorePopups || [],
        doubleJumpParticles: window.doubleJumpParticles || [],
        dropParticles: window.dropParticles || [],
        explosions: window.explosions || []
    });
    
    // Debug overlay
    if (renderCount % 60 === 0) {
        ctx.fillStyle = 'rgba(0, 255, 136, 0.8)';
        ctx.font = '12px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`Render: ${renderCount} | State: ${gameState.currentState}`, 10, CANVAS.height - 10);
        ctx.fillText(`Objects: ${obstacles.length + bulletsFired.length + drops.length} | Camera: ${camera.x.toFixed(0)}`, 10, CANVAS.height - 25);
        ctx.fillText(`Player: ${player.x.toFixed(0)}, ${player.y.toFixed(0)}`, 10, CANVAS.height - 40);
    }
}