// core/player.js - Player Logic and State

import { GAME_CONSTANTS, CANVAS } from './constants.js';
import { updateCamera, camera } from './camera.js'; // KRITISCH: camera importieren!
import { soundManager, activeDropBuffs } from '../systems.js';
import { createDoubleJumpParticles } from '../entities.js';

export const player = {
    x: 120,
    y: -80,
    width: 40,
    height: 40,
    velocityY: 0,
    velocityX: 0,
    jumping: false,
    grounded: true,
    jumpHoldTime: 0,
    isHoldingJump: false,
    doubleJumpUsed: false,
    tripleJumpUsed: false,
    damageResistance: 0,
    facingDirection: 1
};

export function resetPlayer() {
    player.x = 120;
    player.y = 73;
    player.velocityY = 0;
    player.velocityX = 0;
    player.jumping = false;
    player.grounded = true;
    player.jumpHoldTime = 0;
    player.isHoldingJump = false;
    player.doubleJumpUsed = false;
    player.tripleJumpUsed = false;
    player.damageResistance = 0;
    player.facingDirection = 1;
}

export function updatePlayer(keys, gameState) {
    // TEMPORARILY SIMPLIFIED - removed all activeDropBuffs references
    const moveSpeed = GAME_CONSTANTS.PLAYER_MOVE_SPEED * gameState.speedMultiplier;
    
    // Horizontal movement
    if (keys.left && player.x > gameState.camera.x) {
        player.velocityX = -moveSpeed;
        player.facingDirection = -1;
    } else if (keys.right) {
        player.velocityX = moveSpeed;
        player.facingDirection = 1;
    } else {
        player.velocityX *= 0.8;
    }
    
    player.x += player.velocityX;
    player.x = Math.max(gameState.camera.x, player.x);
    
    // Update camera based on player position
    updateCamera(player);
    
    // Jump hold mechanics
    if (player.isHoldingJump && player.jumpHoldTime < GAME_CONSTANTS.MAX_JUMP_HOLD_TIME && player.velocityY < 0) {
        const holdStrength = 1 - (player.jumpHoldTime / GAME_CONSTANTS.MAX_JUMP_HOLD_TIME);
        player.velocityY -= 0.3 * holdStrength;
        player.jumpHoldTime++;
    }
    
    // Apply gravity
    const gravity = player.velocityY < 0 ? GAME_CONSTANTS.LIGHT_GRAVITY : GAME_CONSTANTS.GRAVITY;
    player.velocityY += gravity;
    player.y += player.velocityY;
    
    // Ground collision
    if (player.y >= CANVAS.groundY - player.height) {
        player.y = CANVAS.groundY - player.height;
        player.velocityY = 0;
        player.jumping = false;
        player.grounded = true;
        player.isHoldingJump = false;
        player.jumpHoldTime = 0;
        player.doubleJumpUsed = false;
        player.tripleJumpUsed = false;
    }
    
    // Update invulnerability timers
    if (player.damageResistance > 0) {
        player.damageResistance--;
    }
    if (gameState.postBuffInvulnerability > 0) {
        gameState.postBuffInvulnerability--;
    }
    if (gameState.postDamageInvulnerability > 0) {
        gameState.postDamageInvulnerability--;
    }
}

export function startJump(gameState) {
    if (player.grounded) {
        player.velocityY = GAME_CONSTANTS.JUMP_STRENGTH;
        player.jumping = true;
        player.grounded = false;
        player.isHoldingJump = true;
        player.jumpHoldTime = 0;
        player.doubleJumpUsed = false;
        player.tripleJumpUsed = false;
        soundManager.jump();
    } else if (!player.doubleJumpUsed && gameState.activeBuffs.shadowLeap > 0) {
        player.velocityY = GAME_CONSTANTS.DOUBLE_JUMP_STRENGTH;
        player.doubleJumpUsed = true;
        player.isHoldingJump = true;
        player.jumpHoldTime = 0;
        createDoubleJumpParticles(player.x, player.y);
        soundManager.jump();
    } else if (activeDropBuffs.jumpBoost > 0 && !player.tripleJumpUsed) {
        player.velocityY = GAME_CONSTANTS.DOUBLE_JUMP_STRENGTH;
        player.tripleJumpUsed = true;
        player.isHoldingJump = true;
        player.jumpHoldTime = 0;
        createDoubleJumpParticles(player.x, player.y);
        soundManager.jump();
    }
}

export function stopJump() {
    player.isHoldingJump = false;
}