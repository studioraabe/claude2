// rendering/player.js - Dungeon Character Rendering

import { activeDropBuffs } from '../systems.js';

export function drawPlayer(ctx, x, y, player, gameState) {
    const scale = 1.5;
    const isInvulnerable = gameState.postBuffInvulnerability > 0 || gameState.postDamageInvulnerability > 0;
    const isDead = gameState.lives <= 0;
    const facingLeft = player.facingDirection === -1;
    
    // Blink effect when invulnerable
    if (isInvulnerable) {
        const blinkFrequency = 8;
        const activeInvulnerability = Math.max(gameState.postBuffInvulnerability, gameState.postDamageInvulnerability);
        
        if (Math.floor(activeInvulnerability / blinkFrequency) % 2 === 0) {
            return;
        }
    }
    
    ctx.save();
    
    // Apply scaling
    ctx.translate(x + player.width/2, y + player.height/2);
    ctx.scale(scale, scale);
    ctx.translate(-player.width/2, -player.height/2);
    
    // Ghost Walking transparency
    if (gameState.isGhostWalking) {
        ctx.globalAlpha = 0.5;
    }
    
    // Speed Boost effect
    if (activeDropBuffs.speedBoost) {
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(0 - 10 - i * 5, 10 + i * 10);
            ctx.lineTo(0 - 20 - i * 10, 10 + i * 10);
            ctx.stroke();
        }
    }
    
    // Draw the dungeon character
    drawDungeonCharacter(ctx, 0, 0, facingLeft, isDead);
    
    ctx.restore();
}

function drawDungeonCharacter(ctx, x, y, facingLeft = false, isDead = false) {
    ctx.save();
    
    if (facingLeft) {
        ctx.scale(-1, 1);
        x = -x - 40; // player.width
    }
    
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(x + 8, y + 60, 28, 4);
    
    // Armor - Main body
    ctx.fillStyle = '#5F9F5F';
    ctx.fillRect(x + 8, y + 6, 22, 18);
    
    // Armor highlights
    ctx.fillStyle = '#90EE90';
    ctx.fillRect(x + 10, y + 6, 20, 18);
    ctx.fillRect(x + 6, y + 6, 24, 4);
    ctx.fillStyle = '#7FDF7F';
    ctx.fillRect(x + 6, y + 6, 24, 2);
    
    // Helmet
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 4, y, 30, 8);
    ctx.fillRect(x + 33, y + 2, 3, 4);
    ctx.fillRect(x + 2, y + 1, 3, 5);
    ctx.fillRect(x + 24, y - 1, 2, 3);
    ctx.fillRect(x + 10, y - 1, 2, 3);
    
    // Helmet detail
    ctx.fillStyle = '#228B22';
    ctx.fillRect(x + 10, y + 8, 16, 1);
    ctx.fillStyle = '#1A6B1A';
    ctx.fillRect(x + 10, y + 9, 16, 1);
    ctx.fillStyle = '#000000';
    for (let i = 0; i < 5; i++) {
        ctx.fillRect(x + 11 + i * 3, y + 7, 1, 1);
        ctx.fillRect(x + 11 + i * 3, y + 10, 1, 1);
        ctx.fillRect(x + 12 + i * 3, y + 8, 1, 2);
    }
    
    // Electric gauntlets
    const boltGlow = 0.7 + Math.sin(Date.now() * 0.008) * 0.3;
    
    ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
    ctx.fillRect(x + 1, y + 15, 8, 5);
    ctx.fillRect(x + 31, y + 15, 10, 5);
    
    ctx.fillStyle = '#C0C0C0';
    ctx.fillRect(x + 4, y + 16, 5, 3);
    ctx.fillRect(x + 33, y + 16, 6, 3);
    
    ctx.fillStyle = '#808080';
    ctx.fillRect(x + 5, y + 16, 3, 3);
    ctx.fillRect(x + 34, y + 16, 4, 3);
    
    // Electric sparks on gauntlets
    if (window.gameState.bullets > 0 || Math.random() > 0.7 || window.gameState.isBerserker) {
        ctx.fillStyle = `rgba(0, 255, 255, ${boltGlow})`;
        ctx.fillRect(x + 3, y + 15, 1, 1);
        ctx.fillRect(x + 2, y + 18, 1, 1);
        ctx.fillRect(x + 6, y + 14, 1, 1);
        ctx.fillRect(x + 38, y + 15, 1, 1);
        ctx.fillRect(x + 39, y + 17, 1, 1);
        ctx.fillRect(x + 37, y + 14, 1, 1);
    }
    
    // Eyes
    if (isDead) {
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(x + 15, y + 11, 3, 3);
        ctx.fillRect(x + 24, y + 11, 3, 3);
        ctx.fillStyle = '#000000';
        // X pattern for dead eyes
        ctx.fillRect(x + 15, y + 11, 1, 1);
        ctx.fillRect(x + 17, y + 13, 1, 1);
        ctx.fillRect(x + 17, y + 11, 1, 1);
        ctx.fillRect(x + 15, y + 13, 1, 1);
        ctx.fillRect(x + 24, y + 11, 1, 1);
        ctx.fillRect(x + 26, y + 13, 1, 1);
        ctx.fillRect(x + 26, y + 11, 1, 1);
        ctx.fillRect(x + 24, y + 13, 1, 1);
    } else {
        // Eye glow
        ctx.fillStyle = 'rgba(255, 255, 0, 0.2)';
        ctx.fillRect(x + 14, y + 10, 5, 5);
        ctx.fillRect(x + 23, y + 10, 5, 5);
        
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + 15, y + 11, 3, 3);
        ctx.fillRect(x + 24, y + 11, 3, 3);
        
        ctx.fillStyle = '#00FFFF';
        ctx.fillRect(x + 16, y + 11, 1, 1);
        ctx.fillRect(x + 25, y + 11, 1, 1);
    }
    
    // Mouth/breathing apparatus
    ctx.fillStyle = '#1A6B1A';
    ctx.fillRect(x + 18, y + 19, 7, 3);
    ctx.fillStyle = '#228B22';
    ctx.fillRect(x + 18, y + 19, 6, 2);
    
    // Shoulder detail
    ctx.fillStyle = '#228B22';
    ctx.fillRect(x + 13, y + 14, 1, 6);
    ctx.fillRect(x + 28, y + 16, 1, 1);
    ctx.fillRect(x + 29, y + 17, 1, 1);
    ctx.fillRect(x + 30, y + 18, 1, 1);
    
    // Armor joints
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 12, y + 15, 1, 1);
    ctx.fillRect(x + 14, y + 15, 1, 1);
    ctx.fillRect(x + 12, y + 18, 1, 1);
    ctx.fillRect(x + 14, y + 18, 1, 1);
    
    // Chest piece
    ctx.fillStyle = '#5F9F5F';
    ctx.fillRect(x + 8, y + 24, 22, 24);
    
    ctx.fillStyle = '#90EE90';
    ctx.fillRect(x + 10, y + 24, 20, 24);
    
    // Dark undersuit
    ctx.fillStyle = '#1A2A2A';
    ctx.fillRect(x + 10, y + 26, 22, 20);
    
    ctx.fillStyle = '#2F4F4F';
    ctx.fillRect(x + 12, y + 26, 20, 20);
    
    // Glowing chest details
    ctx.fillStyle = '#90EE90';
    ctx.fillRect(x + 11, y + 30, 4, 6);
    ctx.fillRect(x + 22, y + 35, 3, 4);
    ctx.fillRect(x + 17, y + 28, 2, 8);
    
    // Arms
    ctx.fillStyle = '#5F9F5F';
    ctx.fillRect(x + 6, y + 28, 7, 16);
    ctx.fillStyle = '#90EE90';
    ctx.fillRect(x + 4, y + 28, 6, 16);
    
    ctx.fillStyle = '#90EE90';
    ctx.fillRect(x + 26, y + 28, 8, 16);
    
    // Legs
    ctx.fillStyle = '#5F9F5F';
    ctx.fillRect(x + 12, y + 48, 6, 14);
    ctx.fillRect(x + 20, y + 48, 6, 14);
    
    ctx.fillStyle = '#90EE90';
    ctx.fillRect(x + 14, y + 48, 6, 14);
    ctx.fillRect(x + 22, y + 48, 6, 14);
    
    // Orb weapon (if has bullets or berserker)
    if (window.gameState.bullets > 0 || window.gameState.isBerserker) {
        const energyPulse = 0.6 + Math.sin(Date.now() * 0.01) * 0.4;
        
        // Orb glow
        ctx.fillStyle = `rgba(0, 255, 255, ${energyPulse * 0.4})`;
        ctx.fillRect(x + 28, y + 26, 16, 16);
        
        // Orb core
        ctx.fillStyle = window.gameState.activeBuffs.chainLightning > 0 || window.gameState.isBerserker ? '#FF4500' : '#00FFFF';
        ctx.fillRect(x + 33, y + 31, 6, 6);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + 35, y + 33, 2, 2);
        
        // Energy ring
        ctx.strokeStyle = `rgba(0, 255, 255, ${energyPulse})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x + 36, y + 34, 4, 0, Math.PI * 2);
        ctx.stroke();
        
        // Chain lightning effects
        if (window.gameState.activeBuffs.chainLightning > 0 || window.gameState.isBerserker) {
            ctx.fillStyle = `rgba(255, 215, 0, ${energyPulse})`;
            ctx.fillRect(x + 31, y + 29, 2, 2);
            ctx.fillRect(x + 39, y + 35, 2, 2);
            ctx.fillRect(x + 36, y + 27, 1, 1);
        }
        
        // Lightning bolt
        ctx.strokeStyle = `rgba(0, 255, 255, ${energyPulse * 0.8})`;
        ctx.beginPath();
        ctx.moveTo(x + 36, y + 34);
        ctx.lineTo(x + 42, y + 32);
        ctx.lineTo(x + 40, y + 34);
        ctx.lineTo(x + 44, y + 36);
        ctx.stroke();
        
        // Floating spark
        const sparkX = x + 36 + Math.sin(Date.now() * 0.02) * 3;
        const sparkY = y + 34 + Math.cos(Date.now() * 0.015) * 3;
        ctx.fillStyle = `rgba(255, 255, 255, ${energyPulse})`;
        ctx.fillRect(sparkX, sparkY, 1, 1);
        
        // Berserker mode extra effects
        if (window.gameState.isBerserker) {
            ctx.strokeStyle = `rgba(255, 0, 0, ${energyPulse * 0.8})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x + 36, y + 34);
            ctx.lineTo(x + 44 + Math.random() * 5, y + 34 + Math.random() * 5 - 2.5);
            ctx.stroke();
        }
    }
    
    ctx.restore();
}