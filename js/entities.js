// entities.js - Alle Entity-Logik (Obstacles, Bullets, Effects, Environment, Collisions) - BULLET COUNTER KORRIGIERT

import { GAME_CONSTANTS, SPAWN_CHANCES, ENEMY_CONFIG, MIN_SPAWN_DISTANCE, CANVAS } from './core/constants.js';
import { camera, getScreenX } from './core/camera.js';
import { player } from './core/player.js';
import { gameState } from './core/gameState.js';
import { soundManager, rollForDrop, collectDrop } from './systems.js';
import { createDamageNumber } from './ui-enhancements.js';

// Entity Arrays
export const obstacles = [];
export const bulletsFired = [];
export const explosions = [];
export const environmentElements = [];
export const bloodParticles = [];
export const lightningEffects = [];
export const scorePopups = [];
export const doubleJumpParticles = [];
export const dropParticles = [];
export const drops = []; // Drops array here

// Spawn tracking
export const recentSpawnPositions = [];
export let obstacleTimer = 0;
export let lastSpawnPosition = 0;
// ENTFERNT: bulletBoxesFound ist jetzt in gameState
// export let bulletBoxesFound = 0;

// KORRIGIERT: Verwende gameState.bulletBoxesFound
export function resetBulletBoxesFound() {
    gameState.bulletBoxesFound = 0;
}

// Clear all arrays
export function clearArrays() {
    obstacles.length = 0;
    bulletsFired.length = 0;
    explosions.length = 0;
    bloodParticles.length = 0;
    lightningEffects.length = 0;
    scorePopups.length = 0;
    doubleJumpParticles.length = 0;
    drops.length = 0;
    dropParticles.length = 0;
}

// Spawn validation
function isSpawnPositionValid(x, width) {
    for (const spawn of recentSpawnPositions) {
        if (x < spawn.x + spawn.width + MIN_SPAWN_DISTANCE && 
            x + width + MIN_SPAWN_DISTANCE > spawn.x) {
            return false;
        }
    }
    return true;
}

// Spawn timer calculation
function calculateSpawnTimer(baseTimer, minTimer, level) {
    const maxReductionPercent = 0.65;
    const maxReduction = baseTimer * maxReductionPercent;
    
    const reductionProgress = 1 - Math.exp(-level * 0.25);
    const totalReduction = maxReduction * reductionProgress;
    
    const finalTimer = Math.floor(baseTimer - totalReduction);
    
    const effectiveMinTimer = Math.max(minTimer, Math.floor(baseTimer * 0.25));
    return Math.max(finalTimer, effectiveMinTimer);
}

// SANFTE LEVEL-ABHÄNGIGE spawnObstacle() Funktion
export function spawnObstacle(level, gameSpeed, timeSlowFactor) {
    // FPS-normalisiert: Timer läuft jetzt mit deltaTime
    obstacleTimer -= gameState.deltaTime * timeSlowFactor;
    
    if (obstacleTimer <= 0) {
        const obstacleType = Math.random();
        let spawnX = camera.x + CANVAS.width;
        let attemptCount = 0;
        const maxAttempts = 5;
        
        // Determine obstacle type and size
        let obstacleWidth, obstacleHeight, obstacleTypeStr, obstacleY;
        let timerValue;
        
        // SANFTE LEVEL-ABHÄNGIGE SPAWN-RATEN
        const levelFactor = Math.min(level, 20); // Cap bei Level 20
        
        // BoltBox bleibt konstant (immer verfügbar) - KORRIGIERT: Verwende gameState
        const boltBoxChance = 0.15; // Immer 15%
        
        // Boss steigt langsam
        const bossChance = boltBoxChance + Math.min(0.05 + (levelFactor * 0.005), 0.15); // 5% bis 15%
        
        // Flying steigt moderat
        const flyingChance = bossChance + Math.min(0.15 + (levelFactor * 0.005), 0.25); // 15% bis 25%
        
        // Medium steigt leicht
        const mediumChance = flyingChance + Math.min(0.10 + (levelFactor * 0.003), 0.15); // 10% bis 15%
        
        // Human steigt minimal
        const humanChance = mediumChance + Math.min(0.03 + (levelFactor * 0.002), 0.08); // 3% bis 8%
        
        // Skeleton sinkt LANGSAM (bleibt hoch)
        const skeletonChance = humanChance + Math.max(0.12, 0.20 - (levelFactor * 0.004)); // 20% bis 12%
        
        // Rock sinkt SEHR LANGSAM (bleibt verfügbar)
        const rockChance = skeletonChance + Math.max(0.08, 0.12 - (levelFactor * 0.002)); // 12% bis 8%
        
        // Tesla steigt langsam
        const teslaChance = rockChance + Math.min(0.03 + (levelFactor * 0.003), 0.10); // 3% bis 10%
        
        // Frankenstein steigt sehr langsam
        const frankensteinChance = teslaChance + Math.min(0.02 + (levelFactor * 0.002), 0.08); // 2% bis 8%
        
        // Determine obstacle type - KORRIGIERT: Verwende gameState.bulletBoxesFound
        if (obstacleType < boltBoxChance && gameState.bulletBoxesFound < 4) {
            obstacleTypeStr = 'boltBox';
        } else if (obstacleType < bossChance) {
            obstacleTypeStr = 'alphaWolf';
        } else if (obstacleType < flyingChance) {
            obstacleTypeStr = 'bat';
        } else if (obstacleType < mediumChance) {
            obstacleTypeStr = 'spider';
        } else if (obstacleType < mediumChance + 0.05) {
            obstacleTypeStr = 'wolf';
        } else if (obstacleType < humanChance) {
            obstacleTypeStr = 'vampire';
        } else if (obstacleType < skeletonChance) {
            obstacleTypeStr = 'skeleton';
        } else if (obstacleType < rockChance) {
            obstacleTypeStr = 'rock';
        } else if (obstacleType < teslaChance) {
            obstacleTypeStr = 'teslaCoil';
        } else if (obstacleType < frankensteinChance) {
            obstacleTypeStr = 'frankensteinTable';
        } else {
            // Fallback zu Skeleton (für alle Werte über frankensteinChance)
            obstacleTypeStr = 'skeleton';
        }
        
        // Setze Properties basierend auf Typ
        const config = ENEMY_CONFIG[obstacleTypeStr];
        obstacleWidth = config.width;
        obstacleHeight = config.height;
        timerValue = calculateSpawnTimer(config.timerBase, config.timerMin, level);
        
        // Setze Y-Position basierend auf Typ
        switch(obstacleTypeStr) {
            case 'boltBox':
                obstacleY = CANVAS.groundY - obstacleHeight;
                break;
            case 'alphaWolf':
                obstacleY = CANVAS.groundY - obstacleHeight;
                break;
            case 'bat':
                obstacleY = 150 + Math.random() * 100;
                break;
            case 'spider':
                obstacleY = CANVAS.groundY - 20;
                break;
            case 'wolf':
                obstacleY = CANVAS.groundY - 25;
                break;
            case 'vampire':
                obstacleY = CANVAS.groundY - 35;
                break;
            case 'skeleton':
                obstacleY = CANVAS.groundY - obstacleHeight;
                break;
            case 'rock':
                obstacleY = CANVAS.groundY - 20;
                break;
            case 'teslaCoil':
                obstacleY = 0; // An der Decke
                break;
            case 'frankensteinTable':
                obstacleY = CANVAS.groundY - obstacleHeight + 150;
                break;
            default:
                obstacleY = CANVAS.groundY - obstacleHeight;
        }
        
        // Try to find valid spawn position
        while (attemptCount < maxAttempts && !isSpawnPositionValid(spawnX, obstacleWidth)) {
            spawnX += MIN_SPAWN_DISTANCE + Math.random() * 40;
            attemptCount++;
        }
        
        if (attemptCount >= maxAttempts) {
            obstacleTimer = 300;
            return;
        }
        
        // Create obstacle
        const newObstacle = createObstacle(obstacleTypeStr, spawnX, obstacleY, obstacleWidth, obstacleHeight);
        
        // Add special properties
        if (config.health > 1) {
            newObstacle.health = config.health;
            newObstacle.maxHealth = config.health;
        }
        
        if (obstacleTypeStr === 'alphaWolf') {
            const jumpFrequency = Math.max(60 - (level * 5), 20);
            newObstacle.verticalMovement = 0;
            newObstacle.jumpTimer = jumpFrequency;
            newObstacle.originalY = obstacleY;
        }
        
        // KORRIGIERT: Verwende gameState.bulletBoxesFound
        if (obstacleTypeStr === 'boltBox') {
            gameState.bulletBoxesFound++;
            console.log(`DEBUG: BoltBox spawned, total found: ${gameState.bulletBoxesFound}`);
        }
        
        // Tesla Coil spezielle Properties
        if (obstacleTypeStr === 'teslaCoil') {
            newObstacle.chargeTime = 120;
            newObstacle.zapDuration = 100;
            newObstacle.cooldown = 120;
            newObstacle.state = 'charging';
            newObstacle.stateTimer = newObstacle.chargeTime;
            newObstacle.zapActive = false;
            newObstacle.isPermanent = true;
            newObstacle.isIndestructible = true;
        }
        
        // Frankenstein Table spezielle Properties
        if (obstacleTypeStr === 'frankensteinTable') {
            newObstacle.chargeTime = 120;
            newObstacle.zapDuration = 100;
            newObstacle.cooldown = 120;
            newObstacle.state = 'charging';
            newObstacle.stateTimer = newObstacle.chargeTime;
            newObstacle.zapActive = false;
            newObstacle.isPermanent = true;
            newObstacle.isIndestructible = true;
        }
        
        obstacles.push(newObstacle);
        
        // Track spawn position
        recentSpawnPositions.push({ x: spawnX, width: obstacleWidth });
        recentSpawnPositions.splice(0, recentSpawnPositions.length - 10);
        
        obstacleTimer = Math.floor(timerValue / timeSlowFactor);
    }
    
    // Check visible enemies and adjust timer
    const visibleEnemies = obstacles.filter(o => {
        const screenX = getScreenX(o.x);
        return screenX > -100 && screenX < CANVAS.width + 200;
    }).length;
    
    if (visibleEnemies < 2) {
        obstacleTimer = Math.min(obstacleTimer, 30);
    }
    
    if (visibleEnemies === 0 && obstacleTimer > 5) {
        obstacleTimer = 5;
    }
}

function createObstacle(type, x, y, width, height) {
    return {
        x: x,
        y: y,
        width: width,
        height: height,
        type: type,
        passed: false,
        health: 1,
        maxHealth: 1,
        animationTime: Math.random() * 1000
    };
}

// Update obstacles
export function updateObstacles(gameSpeed, enemySlowFactor, level, magnetRange, gameStateParam) {
    const speed = gameSpeed * enemySlowFactor * 0.7;
    
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obstacle = obstacles[i];
        
        // Stationary objects don't move
        const isStationary = obstacle.type === 'boltBox' || obstacle.type === 'rock' || obstacle.type === 'teslaCoil' || obstacle.type === 'frankensteinTable';
        
        // PERMANENT Tesla Coils und Frankenstein Tables bleiben absolut stationär
        if (!isStationary || ((obstacle.type === 'teslaCoil' || obstacle.type === 'frankensteinTable') && !obstacle.isPermanent)) {
            obstacle.x -= speed * gameState.deltaTime; // FPS-normalisiert
        }
        
        // NEUE Tesla Coil State Machine
        if (obstacle.type === 'teslaCoil') {
            obstacle.stateTimer -= gameState.deltaTime;
            
            switch(obstacle.state) {
                case 'idle':
                    if (obstacle.stateTimer <= 0) {
                        obstacle.state = 'charging';
                        obstacle.stateTimer = obstacle.chargeTime;
                    }
                    break;
                    
                case 'charging':
                    if (obstacle.stateTimer <= 0) {
                        obstacle.state = 'zapping';
                        obstacle.stateTimer = obstacle.zapDuration;
                        obstacle.zapActive = true;
                        
                        // Create lightning effect
                        createLightningEffect(
                            obstacle.x + obstacle.width/2, 
                            obstacle.y + obstacle.height
                        );
                    }
                    break;
                    
                case 'zapping':
                    if (obstacle.stateTimer <= 0) {
                        obstacle.state = 'cooldown';
                        obstacle.stateTimer = obstacle.cooldown;
                        obstacle.zapActive = false;
                    }
                    break;
                    
                case 'cooldown':
                    if (obstacle.stateTimer <= 0) {
                        obstacle.state = 'charging'; // DIREKT zurück zum Laden
                        obstacle.stateTimer = obstacle.chargeTime;
                    }
                    break;
            }
        }
        
        // NEUER Frankenstein Table State Machine (ähnlich Tesla Coil)
        if (obstacle.type === 'frankensteinTable') {
            obstacle.stateTimer -= gameState.deltaTime;
            
            switch(obstacle.state) {
                case 'idle':
                    if (obstacle.stateTimer <= 0) {
                        obstacle.state = 'charging';
                        obstacle.stateTimer = obstacle.chargeTime;
                    }
                    break;
                    
                case 'charging':
                    if (obstacle.stateTimer <= 0) {
                        obstacle.state = 'zapping';
                        obstacle.stateTimer = obstacle.zapDuration;
                        obstacle.zapActive = true;
                        
                        // Create lightning effect
                        createLightningEffect(
                            obstacle.x + obstacle.width/2, 
                            obstacle.y
                        );
                    }
                    break;
                    
                case 'zapping':
                    if (obstacle.stateTimer <= 0) {
                        obstacle.state = 'cooldown';
                        obstacle.stateTimer = obstacle.cooldown;
                        obstacle.zapActive = false;
                    }
                    break;
                    
                case 'cooldown':
                    if (obstacle.stateTimer <= 0) {
                        obstacle.state = 'idle';
                        obstacle.stateTimer = Math.random() * 120 + 60; // 1-3 Sekunden Pause
                    }
                    break;
            }
        }
        
        // Flying enemy movement
        if (obstacle.type === 'bat') {
            // FPS-normalisiert: Verwende deltaTime für konsistente Animation
            obstacle.y += Math.sin(Date.now() * 0.01 * enemySlowFactor + i) * 1.5 * gameState.deltaTime;
        }
        
        if (obstacle.type === 'skeleton') {
            obstacle.y += Math.sin(Date.now() * 0.008 * enemySlowFactor + i) * 0.5 * gameState.deltaTime;
        }

        if (obstacle.type === 'spider') {
            obstacle.y += Math.sin(Date.now() * 0.003 * enemySlowFactor + i) * 0.5 * gameState.deltaTime;
        }
        
        // Boss jumps
        if (obstacle.type === 'alphaWolf' && obstacle.jumpTimer !== undefined) {
            obstacle.jumpTimer -= enemySlowFactor * gameState.deltaTime; // FPS-normalisiert
            
            if (obstacle.verticalMovement !== undefined && 
                (obstacle.verticalMovement !== 0 || obstacle.y < obstacle.originalY)) {
                
                obstacle.y += obstacle.verticalMovement * enemySlowFactor * gameState.deltaTime; // FPS-normalisiert
                obstacle.verticalMovement += 0.5 * enemySlowFactor * gameState.deltaTime; // FPS-normalisiert
                
                if (obstacle.y >= obstacle.originalY) {
                    obstacle.y = obstacle.originalY;
                    obstacle.verticalMovement = 0;
                }
            }
            
            if (obstacle.jumpTimer <= 0 && obstacle.y >= obstacle.originalY && 
                (obstacle.verticalMovement === 0 || obstacle.verticalMovement === undefined)) {
                
                obstacle.verticalMovement = -5;
                const jumpFrequency = Math.max(60 - (level * 5), 60);
                obstacle.jumpTimer = Math.random() * jumpFrequency * 2 + jumpFrequency;
            }
        }
        
        // FPS-normalisiert: Animation Time mit deltaTime
        obstacle.animationTime = Date.now();
        
        // Magnet effect for bolt boxes
        if (magnetRange > 0 && obstacle.type === 'boltBox') {
            const dx = (player.x + player.width/2) - (obstacle.x + obstacle.width/2);
            const dy = (player.y + player.height/2) - (obstacle.y + obstacle.height/2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < magnetRange) {
                const force = (magnetRange - distance) / magnetRange * 0.5;
                obstacle.x += dx * force * 0.2;
                obstacle.y += dy * force * 0.2;
                
                if (obstacle.y > CANVAS.groundY - obstacle.height) {
                    obstacle.y = CANVAS.groundY - obstacle.height;
                }
            }
        }
        
        // Check if passed player
        if (!obstacle.passed && obstacle.x + obstacle.width < player.x) {
            obstacle.passed = true;
            const points = 10 * gameStateParam.scoreMultiplier;
            gameStateParam.score += points;
            gameStateParam.obstaclesAvoided++;
            gameStateParam.levelProgress += 2;
            
            gameStateParam.comboCount++;
            // Only start timer when we have an actual combo (2+ hits)
            if (gameStateParam.comboCount >= 2) {
                gameStateParam.comboTimer = 300; // 5 Sekunden Timer (300 frames bei 60 FPS)
            }
            
            if (gameStateParam.obstaclesAvoided % 10 === 0) {
                gameStateParam.bullets += 5;
                console.log(`DEBUG: Obstacle avoided bonus, bullets now: ${gameStateParam.bullets}`);
            }
        }
        
        // Remove if off screen - ALLE Obstacles (auch Tesla Coils und Frankenstein Tables)
        if (obstacle.x + obstacle.width < camera.x - 100) {
            obstacles.splice(i, 1);
        }
    }
}

// Bullet system - KORRIGIERT: Bessere Bullet-Verwaltung
export function shoot(gameStateParam) {
    if (!gameStateParam.gameRunning || (gameStateParam.bullets <= 0 && !gameStateParam.isBerserker)) {
        console.log(`DEBUG: Cannot shoot - gameRunning: ${gameStateParam.gameRunning}, bullets: ${gameStateParam.bullets}, isBerserker: ${gameStateParam.isBerserker}`);
        return;
    }
    
    const canUseMultiShot = gameStateParam.activeBuffs.chainLightning > 0 && (gameStateParam.bullets >= 3 || gameStateParam.isBerserker);
    const bulletCount = canUseMultiShot ? 3 : 1;
    const enhanced = canUseMultiShot;
    
    for (let i = 0; i < bulletCount; i++) {
        const offsetY = bulletCount > 1 ? (i - 1) * 8 : 0;
        const startX = player.facingDirection === 1 ? player.x + player.width : player.x;
        const bulletSpeed = GAME_CONSTANTS.BULLET_SPEED * player.facingDirection * GAME_CONSTANTS.BULLET_SPEED_MULTIPLIER;
        
        bulletsFired.push({
            x: startX,
            y: player.y + player.height / 1.5 + offsetY,
            speed: bulletSpeed,
            enhanced: enhanced,
            direction: player.facingDirection,
            piercing: gameStateParam.hasPiercingBullets
        });
    }
    
    if (!gameStateParam.isBerserker) {
        gameStateParam.bullets -= bulletCount;
        console.log(`DEBUG: Bullets used: ${bulletCount}, remaining: ${gameStateParam.bullets}`);
    }
    soundManager.shoot();
}

export function updateBullets(gameStateParam) {
    for (let i = bulletsFired.length - 1; i >= 0; i--) {
        const bullet = bulletsFired[i];
        bullet.x += bullet.speed * gameState.deltaTime; // FPS-normalisiert
        
        let hitSomething = false;
        
        for (let j = obstacles.length - 1; j >= 0; j--) {
            const obstacle = obstacles[j];
            
            // TESLA COIL und FRANKENSTEIN TABLE ÜBERSPRINGEN - Bullets gehen durch
            if (obstacle.type === 'teslaCoil' || obstacle.type === 'frankensteinTable' || obstacle.type === 'boltBox') {
                continue; // Keine Kollision mit Tesla Coil oder Frankenstein Table
            }
            
            if (bullet.x < obstacle.x + obstacle.width &&
                bullet.x + 8 > obstacle.x &&
                bullet.y < obstacle.y + obstacle.height &&
                bullet.y + 4 > obstacle.y) {
                
                const damage = bullet.enhanced ? 2 : 1;
                obstacle.health -= damage;
                
                createLightningEffect(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2);
                
                gameStateParam.consecutiveHits++;
                hitSomething = true;
                
                if (obstacle.health <= 0) {
                    handleObstacleDestroyed(obstacle, j, gameStateParam);
                }
                
                if (!bullet.piercing || !gameStateParam.hasPiercingBullets) {
                    bulletsFired.splice(i, 1);
                    break;
                }
            }
        }
        
        if (bullet && (bullet.x > camera.x + CANVAS.width + 100 || bullet.x < camera.x - 100)) {
            bulletsFired.splice(i, 1);
        }
    }
}

function handleObstacleDestroyed(obstacle, index, gameStateParam) {
    const config = ENEMY_CONFIG[obstacle.type];
    const basePoints = config?.points || 10;
    const levelBonus = (gameStateParam.level - 1) * 5;
    const points = (basePoints + levelBonus) * gameStateParam.scoreMultiplier;
    
    gameStateParam.score += points;
    createScorePopup(obstacle.x + obstacle.width/2, obstacle.y, points);

    const isCritical = gameStateParam.comboCount >= 20;
    createDamageNumber(
        obstacle.x + obstacle.width/2, 
        obstacle.y + obstacle.height/2, 
        points, 
        isCritical
    );
    
    const currentTime = Date.now();
    if (currentTime - gameStateParam.lastScoreTime < 30000) {
        gameStateParam.scoreIn30Seconds += points;
    } else {
        gameStateParam.scoreIn30Seconds = points;
        gameStateParam.lastScoreTime = currentTime;
    }
    
    rollForDrop(obstacle.type, obstacle.x + obstacle.width/2, obstacle.y);
    
    if (obstacle.type === 'alphaWolf') {
        gameStateParam.bossesKilled++;
    }
    
    obstacles.splice(index, 1);
    gameStateParam.enemiesDefeated++;
    gameStateParam.bulletsHit++;
    gameStateParam.levelProgress += 3;
    soundManager.hit();
    
    gameStateParam.comboCount++;
    // Only start timer when we have an actual combo (2+ hits)
    if (gameStateParam.comboCount >= 2) {
        gameStateParam.comboTimer = 300; // 5 Sekunden Timer (300 frames bei 60 FPS)
    }
    
    const bulletsNeeded = gameStateParam.activeBuffs.undeadResilience > 0 ? 10 : 15;
    if (gameStateParam.bulletsHit >= bulletsNeeded) {
        if (gameStateParam.lives < 5) {
            gameStateParam.lives++;
            if (gameStateParam.lives > gameStateParam.maxLives) gameStateParam.maxLives = gameStateParam.lives;
        } else {
            gameStateParam.score += 500 * gameStateParam.scoreMultiplier;
            createScorePopup(player.x + player.width/2, player.y, '+500 Bonus!');
        }
        gameStateParam.bulletsHit = 0;
    }
}

// Effects
export function createLightningEffect(x, y) {
    lightningEffects.push({
        x: x,
        y: y,
        life: 15,
        maxLife: 15,
        branches: Math.floor(Math.random() * 3) + 2
    });
}

export function createBloodParticles(x, y) {
    for (let i = 0; i < 8; i++) {
        bloodParticles.push({
            x: x + Math.random() * 20 - 10,
            y: y + Math.random() * 20 - 10,
            velocityX: (Math.random() - 0.5) * 6,
            velocityY: (Math.random() - 0.5) * 6 - 2,
            life: 30,
            maxLife: 30
        });
    }
}

export function createScorePopup(x, y, points) {
    scorePopups.push({
        x: x,
        y: y,
        points: points,
        life: 60,
        maxLife: 60
    });
}

export function createDoubleJumpParticles(x, y) {
    const particleCount = 8;
    
    for (let i = 0; i < particleCount; i++) {
        doubleJumpParticles.push({
            x: x + 20 + Math.random() * 20 - 10,
            y: y + 20 + Math.random() * 20 - 10,
            velocityX: (Math.random() - 0.5) * 6,
            velocityY: (Math.random() - 0.5) * 6,
            life: 30,
            maxLife: 30,
            size: 1 + Math.random() * 2
        });
    }
}

export function updateExplosions() {
    for (let i = explosions.length - 1; i >= 0; i--) {
        explosions[i].frame += gameState.deltaTime; // FPS-normalisiert
        if (explosions[i].frame > 15) {
            explosions.splice(i, 1);
        }
    }
}

export function updateEffects(timeSlowFactor, gameStateParam) {
    // KORRIGIERTE Combo Timer Logic
    if (gameStateParam.comboTimer > 0) {
        gameStateParam.comboTimer -= gameState.deltaTime;
        
        // WICHTIG: Timer und Count gleichzeitig auf 0 setzen
        if (gameStateParam.comboTimer <= 0) {
            gameStateParam.comboTimer = 0;  // Explizit auf 0 setzen
            gameStateParam.comboCount = 0;  // Count auch zurücksetzen
            console.log('Combo timer expired - reset both timer and count to 0');
        }
    }
    // Update blood particles
    for (let i = bloodParticles.length - 1; i >= 0; i--) {
        const particle = bloodParticles[i];
        particle.x += particle.velocityX * gameState.deltaTime; // FPS-normalisiert
        particle.y += particle.velocityY * gameState.deltaTime; // FPS-normalisiert
        particle.velocityY += 0.2 * gameState.deltaTime; // FPS-normalisiert
        particle.life -= gameState.deltaTime; // FPS-normalisiert
        
        if (particle.life <= 0) {
            bloodParticles.splice(i, 1);
        }
    }

    // Update lightning effects
    for (let i = lightningEffects.length - 1; i >= 0; i--) {
        const effect = lightningEffects[i];
        effect.life -= gameState.deltaTime; // FPS-normalisiert
        
        if (effect.life <= 0) {
            lightningEffects.splice(i, 1);
        }
    }

    // Update score popups
    for (let i = scorePopups.length - 1; i >= 0; i--) {
        const popup = scorePopups[i];
        popup.y -= gameState.deltaTime; // FPS-normalisiert
        popup.life -= gameState.deltaTime; // FPS-normalisiert
        
        if (popup.life <= 0) {
            scorePopups.splice(i, 1);
        }
    }

    // Update double jump particles
    for (let i = doubleJumpParticles.length - 1; i >= 0; i--) {
        const particle = doubleJumpParticles[i];
        particle.x += particle.velocityX * gameState.deltaTime; // FPS-normalisiert
        particle.y += particle.velocityY * gameState.deltaTime; // FPS-normalisiert
        particle.velocityY += 0.1 * gameState.deltaTime; // FPS-normalisiert
        particle.life -= gameState.deltaTime; // FPS-normalisiert
        
        if (particle.life <= 0) {
            doubleJumpParticles.splice(i, 1);
        }
    }
    
    // Update drop particles
    for (let i = dropParticles.length - 1; i >= 0; i--) {
        const particle = dropParticles[i];
        particle.x += particle.velocityX * gameState.deltaTime; // FPS-normalisiert
        particle.y += particle.velocityY * gameState.deltaTime; // FPS-normalisiert
        particle.velocityX *= Math.pow(0.95, gameState.deltaTime); // FPS-normalisiert
        particle.velocityY *= Math.pow(0.95, gameState.deltaTime); // FPS-normalisiert
        particle.life -= gameState.deltaTime; // FPS-normalisiert
        
        if (particle.life <= 0) {
            dropParticles.splice(i, 1);
        }
    }
}

// Environment
export function initEnvironmentElements() {
    environmentElements.length = 0;
}

export function updateEnvironmentElements(gameSpeed, timeSlowFactor) {
    // Currently empty as torches are rendered with the ground
}

// Update drops
export function updateDrops(gameSpeed, magnetRange, gameStateParam) {
    for (let i = drops.length - 1; i >= 0; i--) {
        const drop = drops[i];
        
        drop.velocityY += 0.3 * gameState.deltaTime; // FPS-normalisiert
        drop.y += drop.velocityY * gameState.deltaTime; // FPS-normalisiert
        
        if (drop.y >= CANVAS.groundY - drop.height) {
            drop.y = CANVAS.groundY - drop.height;
            drop.velocityY = -drop.velocityY * 0.5;
        }
        
        // FPS-normalisiert: Rotation und Glow mit deltaTime
        drop.rotation += 0.05 * gameState.deltaTime;
        drop.glowIntensity = 0.5 + Math.sin(Date.now() * 0.001) * 0.3;
        
        // Magnet effect with proper speed
        if (magnetRange > 0) {
            const dx = (player.x + player.width/2) - (drop.x + drop.width/2);
            const dy = (player.y + player.height/2) - (drop.y + drop.height/2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < magnetRange) {
                const force = (magnetRange - distance) / magnetRange * 0.5;
                drop.x += dx * force * 0.2;
                drop.y += dy * force * 0.2;
                
                if (drop.y > CANVAS.groundY - drop.height) {
                    drop.y = CANVAS.groundY - drop.height;
                }
            }
        }
        
        // Check collection
        if (player.x < drop.x + drop.width &&
            player.x + player.width > drop.x &&
            player.y < drop.y + drop.height &&
            player.y + player.height > drop.y) {
            
            collectDrop(drop);
            drops.splice(i, 1);
            continue;
        }
        
        // Remove if off screen
        if (drop.x + drop.width < camera.x - 100) {
            drops.splice(i, 1);
        }
    }
}

// Export important functions for game loop
export function updateAllEntities(gameStateParam) {
    updateObstacles(gameStateParam.gameSpeed, gameStateParam.enemySlowFactor, gameStateParam.level, gameStateParam.magnetRange, gameStateParam);
    updateBullets(gameStateParam);
    updateExplosions();
    updateEnvironmentElements(gameStateParam.gameSpeed, gameStateParam.timeSlowFactor);
    updateDrops(gameStateParam.gameSpeed, gameStateParam.magnetRange, gameStateParam);
    updateEffects(gameStateParam.timeSlowFactor, gameStateParam);
}

// Collisions
export function getObstacleHitbox(obstacle) {
    const reduction = 0.2;
    const widthReduction = obstacle.width * reduction;
    const heightReduction = obstacle.height * reduction;
    
    return {
        x: obstacle.x + widthReduction / 2,
        y: obstacle.y + heightReduction / 2,
        width: obstacle.width - widthReduction,
        height: obstacle.height - heightReduction
    };
}

export function isPlayerInvulnerable(gameStateParam) {
    return player.damageResistance > 0 || 
           gameStateParam.postBuffInvulnerability > 0 || 
           gameStateParam.postDamageInvulnerability > 0 || 
           gameStateParam.hasShield || 
           gameStateParam.isGhostWalking;
}

export function checkCollisions(gameStateParam) {
    if (isPlayerInvulnerable(gameStateParam)) {
        if (gameStateParam.hasShield && !gameStateParam.isGhostWalking) {
            for (let i = obstacles.length - 1; i >= 0; i--) {
                const obstacle = obstacles[i];
                const hitbox = getObstacleHitbox(obstacle);
                
                if (player.x < hitbox.x + hitbox.width &&
                    player.x + player.width > hitbox.x &&
                    player.y < hitbox.y + hitbox.height &&
                    player.y + player.height > hitbox.y) {
                    
                    if (obstacle.type === 'boltBox') {
                        gameStateParam.bullets += 10;
                        createScorePopup(obstacle.x + obstacle.width/2, obstacle.y, '+10 Bolts');
                        obstacles.splice(i, 1);
                        console.log(`DEBUG: BoltBox collected, bullets now: ${gameStateParam.bullets}`);
                        continue;
                    }
                    
                    // Rocks machen keinen Schaden - überspringen
                    if (obstacle.type === 'rock') {
                        continue;
                    }
                    
                    // Tesla Coil Shield-Kollision - NUR Körper, NICHT bei aktivem Strahl
                    if (obstacle.type === 'teslaCoil') {
                        if (obstacle.state === 'zapping' && obstacle.zapActive) {
                            // Bei aktivem Strahl: Shield zerstören
                            gameStateParam.hasShield = false;
                            createScorePopup(player.x + player.width/2, player.y, 'Shield Broken by Tesla!');
                            soundManager.hit();
                            break;
                        }
                        // Bei inaktivem Strahl: Ignorieren (permanente Spule)
                        continue;
                    }
                    
                    // Frankenstein Table Shield-Kollision - NUR Körper, NICHT bei aktivem Blitz
                    if (obstacle.type === 'frankensteinTable') {
                        if (obstacle.state === 'zapping' && obstacle.zapActive) {
                            // Bei aktivem Blitz: Shield zerstören
                            gameStateParam.hasShield = false;
                            createScorePopup(player.x + player.width/2, player.y, 'Shield Broken by Frankenstein!');
                            soundManager.hit();
                            break;
                        }
                        // Bei inaktivem Blitz: Ignorieren (permanenter Tisch)
                        continue;
                    }
                    
                    gameStateParam.hasShield = false;
                    createScorePopup(player.x + player.width/2, player.y, 'Shield Broken!');
                    obstacles.splice(i, 1);
                    soundManager.hit();
                    break;
                }
            }
        }
        return;
    }

    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obstacle = obstacles[i];
        
        // TESLA COIL SPEZIAL-BEHANDLUNG
        if (obstacle.type === 'teslaCoil') {
            // NUR Strahl-Kollision prüfen, wenn Strahl aktiv ist
            if (obstacle.state === 'zapping' && obstacle.zapActive) {
                // Strahl-Hitbox: von Tesla Coil bis zum Boden
                const zapX = obstacle.x + obstacle.width/2 - 8; // 16px breiter Strahl
                const zapY = obstacle.y + obstacle.height; // Startet am unteren Ende der Tesla Coil
                const zapWidth = 16;
                const zapHeight = CANVAS.height - zapY; // Bis Bildschirmrand

                
                // Check collision mit Strahl
                if (player.x < zapX + zapWidth &&
                    player.x + player.width > zapX &&
                    player.y < zapY + zapHeight &&
                    player.y + player.height > zapY) {
                    
                    // Sofortiger Tod durch Tesla Strahl
                    gameStateParam.lives--;
                    gameStateParam.damageThisLevel++;
                    createBloodParticles(player.x + player.width/2, player.y + player.height/2);
                    
                    // Zusätzliche Tesla-Effekte
                    createLightningEffect(player.x + player.width/2, player.y + player.height/2);
                    
                    gameStateParam.postDamageInvulnerability = 60;
                    player.damageResistance = GAME_CONSTANTS.DAMAGE_RESISTANCE_TIME;
                    
                    // Reset combo
                    gameStateParam.bulletsHit = 0;
                    gameStateParam.comboCount = 0;
                    gameStateParam.comboTimer = 0;
                    gameStateParam.consecutiveHits = 0;
                    
                    soundManager.hit(); // GLEICHER SOUND wie andere Hindernisse
                    
                    if (gameStateParam.lives <= 0) {
                        return true; // Signal game over
                    }
                    return false; // Wichtig: Früh beenden nach Tesla-Treffer
                }
            }
            // Tesla Coil Körper verursacht KEINEN Schaden - weiter zur nächsten Obstacle
            continue;
        }
        
        // FRANKENSTEIN TABLE SPEZIAL-BEHANDLUNG
        if (obstacle.type === 'frankensteinTable') {
            // NUR Blitz-Kollision prüfen, wenn Blitz aktiv ist
            if (obstacle.state === 'zapping' && obstacle.zapActive) {
                // Blitz-Hitbox: von Frankenstein Table bis zur Decke
                const zapX = obstacle.x + obstacle.width/2 - 12; // 24px breiter Blitz
                const zapY = 0; // Startet an der Decke
                const zapWidth = 24;
                const zapHeight = obstacle.y + obstacle.height - 55; // Bis zu den Elektroden
                
                // Check collision mit Blitz
                if (player.x < zapX + zapWidth &&
                    player.x + player.width > zapX &&
                    player.y < zapY + zapHeight &&
                    player.y + player.height > zapY) {
                    
                    // Sofortiger Tod durch Frankenstein-Blitz
                    gameStateParam.lives--;
                    gameStateParam.damageThisLevel++;
                    createBloodParticles(player.x + player.width/2, player.y + player.height/2);
                    
                    // Zusätzliche Frankenstein-Effekte
                    createLightningEffect(player.x + player.width/2, player.y + player.height/2);
                    
                    gameStateParam.postDamageInvulnerability = 60;
                    player.damageResistance = GAME_CONSTANTS.DAMAGE_RESISTANCE_TIME;
                    
                    // Reset combo
                    gameStateParam.bulletsHit = 0;
                    gameStateParam.comboCount = 0;
                    gameStateParam.comboTimer = 0;
                    gameStateParam.consecutiveHits = 0;
                    
                    soundManager.hit();
                    
                    if (gameStateParam.lives <= 0) {
                        return true; // Signal game over
                    }
                    return false; // Früh beenden nach Frankenstein-Treffer
                }
            }
            // Frankenstein Table Körper verursacht KEINEN Schaden
            continue;
        }
        
        const hitbox = getObstacleHitbox(obstacle);
        
        if (player.x < hitbox.x + hitbox.width &&
            player.x + player.width > hitbox.x &&
            player.y < hitbox.y + hitbox.height &&
            player.y + player.height > hitbox.y) {
            
            if (obstacle.type === 'boltBox') {
                gameStateParam.bullets += 10;
                createScorePopup(obstacle.x + obstacle.width/2, obstacle.y, '+10 Bolts');
                obstacles.splice(i, 1);
                console.log(`DEBUG: BoltBox collected, bullets now: ${gameStateParam.bullets}`);
                continue;
            }
            
            // Rocks machen keinen Schaden - überspringen
            if (obstacle.type === 'rock') {
                continue;
            }
            
            // Alle anderen Obstacles (NICHT Tesla Coil oder Frankenstein Table)
            gameStateParam.lives--;
            gameStateParam.damageThisLevel++;
            createBloodParticles(player.x + player.width/2, player.y + player.height/2);
            
            gameStateParam.postDamageInvulnerability = 60;
            player.damageResistance = GAME_CONSTANTS.DAMAGE_RESISTANCE_TIME;
            
            gameStateParam.bulletsHit = 0;
            gameStateParam.comboCount = 0;
            gameStateParam.comboTimer = 0;
            gameStateParam.consecutiveHits = 0;
            obstacles.splice(i, 1);
            soundManager.hit();
            
            if (gameStateParam.lives <= 0) {
                return true; // Signal game over
            }
            break;
        }
    }
    
    return false;
}