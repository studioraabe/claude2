// ui-enhancements.js - Enhanced UI Visualizations - OPTIMIZED POSITIONING

import { gameState } from './core/gameState.js';
import { activeDropBuffs } from './systems.js';
import { DROP_INFO, DROP_CONFIG, CANVAS } from './core/constants.js';
import { camera } from './core/camera.js';

// Initialize enhanced UI containers with optimal positioning
export function initEnhancedContainers() {
    // Remove existing containers
    const existingBuff = document.getElementById('enhancedBuffs');
    const existingCombo = document.getElementById('comboDisplay');
    if (existingBuff) existingBuff.remove();
    if (existingCombo) existingCombo.remove();
    
    // Create enhanced buffs container - Links unten (temporäre Effekte)
    const buffContainer = document.createElement('div');
    buffContainer.id = 'enhancedBuffs';
    buffContainer.className = 'enhanced-buffs-container';
    buffContainer.style.cssText = `
        position: absolute !important;
        bottom: 20px !important;
        left: 16px !important;
        max-width: 180px !important;
        z-index: 20 !important;
        pointer-events: none !important;
        display: block !important;
        visibility: visible !important;
    `;
    document.getElementById('gameContainer').appendChild(buffContainer);
    
    // Create combo display container - Rechts unten (dynamisch)
    const comboDisplay = document.createElement('div');
    comboDisplay.id = 'comboDisplay';
    comboDisplay.className = 'combo-display-enhanced';
    comboDisplay.style.cssText = `
        position: absolute !important;
        bottom: 20px !important;
        right: 20px !important;
        text-align: center !important;
        z-index: 15 !important;
        pointer-events: none !important;
        transition: all 0.1s ease !important;
        padding: 0 !important;
        background: none !important;
        border: none !important;
        min-width: 0 !important;
        min-height: 0 !important;
        width: auto !important;
        height: auto !important;
    `;
    document.getElementById('gameContainer').appendChild(comboDisplay);
    
    // Create stats overlay
    createStatsOverlay();
    
    // Ensure game container positioning
    const gameContainer = document.getElementById('gameContainer');
    if (gameContainer && getComputedStyle(gameContainer).position === 'static') {
        gameContainer.style.position = 'relative';
    }
    
    console.log('Enhanced containers initialized with optimal positioning');
}

// Enhanced Combo Display - Rechts unten, dynamisch
let lastComboCount = 0;
let lastComboTimer = 0;
let displayWasVisible = false;

export function updateEnhancedComboDisplay() {
    if (!gameState) return;
    
    let comboDisplay = document.getElementById('comboDisplay');
    
    if (!comboDisplay) {
        comboDisplay = document.createElement('div');
        comboDisplay.id = 'comboDisplay';
        comboDisplay.className = 'combo-display-enhanced';
        comboDisplay.style.cssText = `
            position: absolute !important;
            bottom: 20px !important;
            right: 20px !important;
            text-align: center !important;
            z-index: 15 !important;
            pointer-events: none !important;
            transition: all 0.1s ease !important;
            padding: 0 !important;
            background: none !important;
            border: none !important;
            min-width: 0 !important;
            min-height: 0 !important;
            width: auto !important;
            height: auto !important;
        `;
        document.getElementById('gameContainer').appendChild(comboDisplay);
    }
    
    // Timer-Ablauf/Reset Detection
    const timerExpired = lastComboTimer > 0 && gameState.comboTimer <= 0;
    const comboReset = gameState.comboCount < lastComboCount;
    
    // Hide combo display
    if (timerExpired || comboReset) {
        comboDisplay.className = 'combo-display-enhanced';
        comboDisplay.style.display = 'none';
        comboDisplay.innerHTML = '';
        
        displayWasVisible = false;
        lastComboCount = gameState.comboCount;
        lastComboTimer = gameState.comboTimer;
        
        const canvas = document.getElementById('gameCanvas');
        if (canvas) canvas.style.filter = '';
        return;
    }
    
    // Update tracking
    lastComboCount = gameState.comboCount;
    lastComboTimer = gameState.comboTimer;
    
    // Show combo display
    const shouldShow = gameState.comboCount >= 1 && gameState.comboTimer > 0;
    
    if (shouldShow) {
        displayWasVisible = true;
        
        comboDisplay.style.display = 'block';
        comboDisplay.className = 'combo-display-enhanced combo-subtle';
        
        const getComboColor = (count) => {
            if (count >= 200) return '#FF00FF';
            if (count >= 100) return '#DC143C';
            if (count >= 50) return '#FF4500';
            if (count >= 30) return '#00ff88';
            if (count >= 20) return '#00ff88';
            if (count >= 10) return '#00ff88';
            if (count >= 5) return '#00ff88';
            return '#00ff88';
        };
        
        const timerPercent = Math.max(0, Math.min(100, (gameState.comboTimer / 300) * 100));
        const comboColor = getComboColor(gameState.comboCount);
        const shouldWiggle = gameState.comboCount > (lastComboCount - 1) && displayWasVisible;
        
        comboDisplay.innerHTML = `
            <div class="combo-number-subtle ${shouldWiggle ? 'combo-wiggle' : ''}" style="color: ${comboColor}">
                ${gameState.comboCount}x
            </div>
            <div class="combo-timer-subtle">
                <div class="combo-timer-fill-subtle" style="width: ${timerPercent}%; background-color: ${comboColor}"></div>
            </div>
            <div class="buff-name">Power-up Chance</div>
        `;
        
        // Canvas glow effect
        const canvas = document.getElementById('gameCanvas');
        if (canvas && gameState.comboCount >= 20) {
            const glowIntensity = Math.min((gameState.comboCount - 20) * 0.5, 10);
            canvas.style.filter = `drop-shadow(0 0 ${glowIntensity}px ${comboColor})`;
        } else if (canvas) {
            canvas.style.filter = '';
        }
        
        // Cleanup wiggle animation
        if (shouldWiggle) {
            setTimeout(() => {
                const numberEl = comboDisplay.querySelector('.combo-number-subtle');
                if (numberEl) numberEl.classList.remove('combo-wiggle');
            }, 300);
        }
        
    } else if (displayWasVisible) {
        // Hide when no longer needed
        comboDisplay.className = 'combo-display-enhanced';
        comboDisplay.style.display = 'none';
        comboDisplay.innerHTML = '';
        displayWasVisible = false;
        
        const canvas = document.getElementById('gameCanvas');
        if (canvas) canvas.style.filter = '';
    }
}

// Enhanced Buff Display - Links unten, slides von links
let previousBuffs = new Set();

export function updateEnhancedBuffDisplay() {
    if (!gameState) return;
    
    let buffContainer = document.getElementById('enhancedBuffs');
    
    if (!buffContainer) {
        buffContainer = document.createElement('div');
        buffContainer.id = 'enhancedBuffs';
        buffContainer.className = 'enhanced-buffs-container';
        buffContainer.style.cssText = `
            position: absolute !important;
            bottom: 20px !important;
            left: 16px !important;
            max-width: 180px !important;
            z-index: 20 !important;
            pointer-events: none !important;
            display: block !important;
            visibility: visible !important;
        `;
        document.getElementById('gameContainer').appendChild(buffContainer);
    }
    
    const activeBuffsHTML = [];
    const currentBuffs = new Set();
    
    // Temporary buffs with timers
    if (activeDropBuffs && typeof activeDropBuffs === 'object') {
        Object.keys(activeDropBuffs).forEach(buffKey => {
            const remaining = activeDropBuffs[buffKey];
            if (remaining <= 0) return;
            
            const dropInfo = getDropInfoByKey(buffKey);
            if (!dropInfo) return;
            
            const originalDuration = getOriginalDuration(buffKey);
            const percentage = (remaining / originalDuration) * 100;
            const isLow = remaining < 180; // Less than 3 seconds
            const isNew = !previousBuffs.has(buffKey);
            
            activeBuffsHTML.push(`
                <div class="buff-item ${isLow ? 'buff-expiring' : ''} buff-${buffKey} ${isNew ? 'buff-new' : ''}">
                    <div class="buff-icon">${dropInfo.icon}</div>
                    <div class="buff-info">
                        <div class="buff-name">${dropInfo.name}</div>
                        <div class="buff-timer">${Math.ceil(remaining / 60)}s</div>
                        <div class="buff-progress">
                            <div class="buff-progress-fill" style="width: ${percentage}%"></div>
                        </div>
                    </div>
                </div>
            `);
            currentBuffs.add(buffKey);
        });
    }
    
    // Shield indicator
    if (gameState.hasShield) {
        const isNew = !previousBuffs.has('shield');
        activeBuffsHTML.push(`
            <div class="buff-item buff-shield ${isNew ? 'buff-new' : ''}">
                <div class="buff-icon">🛡️</div>
                <div class="buff-info">
                    <div class="buff-name">Shield</div>
                    <div class="buff-status">ACTIVE</div>
                </div>
            </div>
        `);
        currentBuffs.add('shield');
    }
    
    // Update container
    buffContainer.innerHTML = activeBuffsHTML.join('');
    
    // Hide container if no buffs active
    if (activeBuffsHTML.length === 0) {
        buffContainer.style.display = 'none';
    } else {
        buffContainer.style.display = 'block';
    }
    
    // Update previous buffs for next call
    previousBuffs = currentBuffs;
}

// Stats Overlay
export function createStatsOverlay() {
    let overlay = document.getElementById('statsOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'statsOverlay';
        overlay.className = 'stats-overlay';
        overlay.style.display = 'none';
        document.getElementById('gameContainer').appendChild(overlay);
    }
}

export function updateStatsOverlay() {
    if (!gameState) return;
    
    const overlay = document.getElementById('statsOverlay');
    if (!overlay) return;
    
    const hitRate = gameState.bulletsHit > 0 && gameState.enemiesDefeated > 0
        ? Math.round((gameState.bulletsHit / (gameState.bulletsHit + (gameState.obstaclesAvoided || 0))) * 100) 
        : 0;
    
    // Achievement status
    const achievements = window.ACHIEVEMENTS || {};
    const unlockedCount = Object.values(achievements).filter(a => a.unlocked).length;
    const totalAchievements = Object.keys(achievements).length;
    
    overlay.innerHTML = `
        <div class="stats-overlay-content">
            <h3>📊 GAME STATISTICS</h3>
            
            <div class="stats-section">
                <h4>Performance</h4>
                <div class="stat-row">
                    <span>Current Score:</span>
                    <span class="stat-value">${gameState.score.toLocaleString()}</span>
                </div>
                <div class="stat-row">
                    <span>Current Combo:</span>
                    <span class="stat-value">${gameState.comboCount}x</span>
                </div>
                <div class="stat-row">
                    <span>Hit Rate:</span>
                    <span class="stat-value">${hitRate}%</span>
                </div>
                <div class="stat-row">
                    <span>Enemies Defeated:</span>
                    <span class="stat-value">${gameState.enemiesDefeated}</span>
                </div>
                <div class="stat-row">
                    <span>Obstacles Avoided:</span>
                    <span class="stat-value">${gameState.obstaclesAvoided || 0}</span>
                </div>
            </div>
            
            <div class="stats-section">
                <h4>Progress</h4>
                <div class="stat-row">
                    <span>Current Floor:</span>
                    <span class="stat-value">${gameState.level}</span>
                </div>
                <div class="stat-row">
                    <span>Bosses Killed:</span>
                    <span class="stat-value">${gameState.bossesKilled}</span>
                </div>
                <div class="stat-row">
                    <span>Lives:</span>
                    <span class="stat-value">${gameState.lives}/${gameState.maxLives}</span>
                </div>
                <div class="stat-row">
                    <span>Bolts:</span>
                    <span class="stat-value">${gameState.isBerserker ? '∞' : gameState.bullets}</span>
                </div>
                <div class="stat-row">
                    <span>Achievements:</span>
                    <span class="stat-value">${unlockedCount}/${totalAchievements}</span>
                </div>
            </div>
            
            <div class="stats-section">
                <h4>Multipliers & Bonuses</h4>
                <div class="stat-row">
                    <span>Score Multiplier:</span>
                    <span class="stat-value">${gameState.scoreMultiplier}x</span>
                </div>
                <div class="stat-row">
                    <span>Speed Multiplier:</span>
                    <span class="stat-value">${gameState.speedMultiplier.toFixed(1)}x</span>
                </div>
                <div class="stat-row">
                    <span>Drop Chance Bonus:</span>
                    <span class="stat-value">+${Math.min(gameState.comboCount, 20)}%</span>
                </div>
                <div class="stat-row">
                    <span>Achievement Drop Bonus:</span>
                    <span class="stat-value">${achievements.firstBlood?.unlocked ? '+10%' : '0%'}</span>
                </div>
            </div>
            
            <p class="stats-hint">Press TAB to close</p>
        </div>
    `;
}

export function toggleStatsOverlay() {
    const overlay = document.getElementById('statsOverlay');
    if (!overlay) return;
    
    if (overlay.style.display === 'block') {
        overlay.style.display = 'none';
    } else {
        updateStatsOverlay();
        overlay.style.display = 'block';
    }
}

// Achievement Popups
export function showAchievementPopup(achievement) {
    const popup = document.createElement('div');
    popup.className = 'achievement-popup';
    popup.innerHTML = `
        <div class="achievement-icon">🏆</div>
        <div class="achievement-content">
            <div class="achievement-title">${achievement.name}</div>
            <div class="achievement-desc">${achievement.desc}</div>
            <div class="achievement-reward">Reward: ${achievement.reward}</div>
        </div>
    `;
    
    document.getElementById('gameContainer').appendChild(popup);
    
    // Animate in
    setTimeout(() => popup.classList.add('achievement-show'), 10);
    
    // Remove after animation
    setTimeout(() => {
        popup.classList.remove('achievement-show');
        setTimeout(() => popup.remove(), 500);
    }, 4000);
}

// Damage Numbers
export function createDamageNumber(x, y, damage, critical = false) {
    const screenX = x - camera.x;
    if (screenX < -50 || screenX > CANVAS.width + 50) return;
    
    const damageNum = document.createElement('div');
    damageNum.className = `damage-number ${critical ? 'damage-critical' : ''}`;
    damageNum.textContent = damage;
    damageNum.style.left = `${screenX}px`;
    damageNum.style.top = `${y}px`;
    
    document.getElementById('gameContainer').appendChild(damageNum);
    
    // Animate and remove
    setTimeout(() => damageNum.remove(), 1000);
}

// Helper functions
function getDropInfoByKey(key) {
    const keyToType = {
        'speedBoost': 'speedBoost',
        'jumpBoost': 'jumpBoost',
        'scoreMultiplier': 'scoreMultiplier',
        'magnetMode': 'magnetMode',
        'berserkerMode': 'berserkerMode',
        'ghostWalk': 'ghostWalk',
        'timeSlow': 'timeSlow'
    };
    
    const dropType = keyToType[key];
    const dropInfo = DROP_INFO[dropType];
    
    // Fallback if not found
    if (!dropInfo) {
        return {
            icon: '⭐',
            name: key.charAt(0).toUpperCase() + key.slice(1)
        };
    }
    
    return dropInfo;
}

function getOriginalDuration(buffKey) {
    const allItems = [...DROP_CONFIG.boss.items, ...DROP_CONFIG.common.items];
    const config = allItems.find(item => {
        const keyMap = {
            'speedBoost': 'speedBoost',
            'jumpBoost': 'jumpBoost',
            'scoreMultiplier': 'scoreMultiplier',
            'magnetMode': 'magnetMode',
            'berserkerMode': 'berserkerMode',
            'ghostWalk': 'ghostWalk',
            'timeSlow': 'timeSlow'
        };
        return item.type === keyMap[buffKey];
    });
    
    return config?.duration || 600;
}

function createComboParticle() {
    const particle = document.createElement('div');
    particle.className = 'combo-particle';
    particle.style.left = `${50 + (Math.random() - 0.5) * 100}%`;
    particle.style.top = '100px';
    particle.style.setProperty('--random-x', (Math.random() - 0.5) * 2);
    
    document.getElementById('gameContainer').appendChild(particle);
    
    setTimeout(() => particle.remove(), 1000);
}

// Initialize enhancements with optimal positioning
export function initEnhancements() {
    // Initialize containers with optimal positioning
    initEnhancedContainers();
    
    // Add keyboard listener for stats overlay
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Tab' && gameState && gameState.gameRunning) {
            e.preventDefault();
            toggleStatsOverlay();
        }
    });
    
    console.log('Enhanced UI initialized with optimal positioning');
}