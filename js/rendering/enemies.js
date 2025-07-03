// rendering/enemies.js - Alle Enemy Render-Funktionen für Dungeon Theme - FPS KORRIGIERT

import { getScreenX } from '../core/camera.js';
import { gameState } from '../core/gameState.js';
import { CANVAS } from '../core/constants.js';

function drawTeslaCoil(ctx, x, y, width, height, obstacle) {
    const scale = 1.2;
    const timeScale = Date.now() * 0.001;
    
    // HÄNGT VON DECKE: Y-Position wird an die Decke gesetzt
    const ceilingY = 0; // Decke des Spielfelds
    const actualY = ceilingY; // Tesla Coil hängt direkt an der Decke
    
    // Ceiling mount/attachment
    ctx.fillStyle = '#2F2F2F';
    ctx.fillRect(x + 8, actualY, width - 16, 8); // Befestigung an der Decke
    
    // Main coil body (hängend)
    ctx.fillStyle = '#4A4A4A';
    ctx.fillRect(x + 6, actualY + 8, width - 12, height - 16);
    
    // Copper coils (von oben nach unten)
    ctx.fillStyle = '#B87333';
    for (let i = 0; i < 8; i++) {
        const coilY = actualY + 12 + i * 4;
        ctx.fillRect(x + 4, coilY, width - 8, 2);
    }
    
    // Bottom electrode (UNTEN statt oben - Schussrichtung nach unten)
    ctx.fillStyle = '#C0C0C0';
    ctx.fillRect(x + 8, actualY + height - 20, width - 16, 15);
    ctx.fillRect(x + 10, actualY + height - 10, width - 20, 10);
    
    // State-based effects
    if (obstacle.state === 'charging') {
        // VERSTÄRKTE Charging glow für bessere Warnung
        const chargeIntensity = (obstacle.chargeTime - obstacle.stateTimer) / obstacle.chargeTime;
        const glowAlpha = Math.min(chargeIntensity * 1.5, 1.0); // Stärker sichtbar
        
        // Hauptglow
        ctx.fillStyle = `rgba(0, 255, 255, ${glowAlpha})`;
        const glowSize = chargeIntensity * 15; // Größerer Glow
        ctx.fillRect(x + 8 - glowSize/2, actualY + height - 20 - glowSize/2, width - 16 + glowSize, 15 + glowSize);
        
        // Zusätzlicher Warnglow um die gesamte Spule
        ctx.fillStyle = `rgba(255, 100, 0, ${glowAlpha * 0.6})`; // Orange Warnung
        const warningGlow = chargeIntensity * 20;
        ctx.fillRect(x - warningGlow/2, actualY - warningGlow/2, width + warningGlow, height + warningGlow);
        
        // Verstärkte Sparks
        if (Math.random() > 0.5) { // Häufiger
            ctx.fillStyle = '#FFFF00';
            for (let s = 0; s < 3; s++) { // Mehr Funken
                const sparkX = x + 8 + Math.random() * (width - 16);
                const sparkY = actualY + height - 15 + Math.random() * 10;
                ctx.fillRect(sparkX, sparkY, 3, 3); // Größere Funken
            }
        }
        
        // Pulsierende Warnung bei fast vollständiger Ladung
        if (chargeIntensity > 0.8) {
            const pulse = Math.sin(Date.now() * 0.02) * 0.5 + 0.5;
            ctx.fillStyle = `rgba(255, 0, 0, ${pulse * 0.8})`; // Rote Warnung
            ctx.fillRect(x - 5, actualY - 5, width + 10, height + 10);
        }
    }
    
    if (obstacle.state === 'zapping' && obstacle.zapActive) {
        // Active energy beam (VON DECKE BIS ZUM BODEN) - LÄNGER SICHTBAR
        const beamX = x + width/2 - 8;
        const beamY = actualY + height; // Startet am unteren Ende der Tesla Coil
        const beamWidth = 16;
        const beamHeight = CANVAS.height - beamY; // Bis zum Boden
        
        // VERSTÄRKTER Main beam
        ctx.fillStyle = 'rgba(0, 255, 255, 1.0)'; // Vollständig sichtbar
        ctx.fillRect(beamX, beamY, beamWidth, beamHeight);
        
        // HELLERER Beam core
        ctx.fillStyle = 'rgba(255, 255, 255, 1.0)'; // Weißer Kern
        ctx.fillRect(beamX + 4, beamY, beamWidth - 8, beamHeight);
        
        // Zusätzliche äußere Glow-Schichten
        ctx.fillStyle = 'rgba(0, 255, 255, 0.6)';
        ctx.fillRect(beamX - 4, beamY, beamWidth + 8, beamHeight); // Breitere Aura
        
        ctx.fillStyle = 'rgba(100, 200, 255, 0.3)';
        ctx.fillRect(beamX - 8, beamY, beamWidth + 16, beamHeight); // Noch breitere Aura
        
        // MEHR Lightning arcs
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.9)';
        ctx.lineWidth = 3; // Dickere Blitze
        for (let i = 0; i < 6; i++) { // Mehr Blitze
            ctx.beginPath();
            ctx.moveTo(beamX + Math.random() * beamWidth, beamY);
            ctx.lineTo(beamX + Math.random() * beamWidth, beamY + beamHeight);
            ctx.stroke();
        }
        
        // VERSTÄRKTER Ground impact
        ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
        const impactSize = 30; // Größerer Einschlag
        ctx.fillRect(beamX - impactSize/2 + beamWidth/2, CANVAS.height - 16, impactSize, 16); // Am Bildschirmrand
        
        // Zusätzliche Impact-Partikel
        ctx.fillStyle = 'rgba(255, 150, 0, 0.5)';
        for (let p = 0; p < 8; p++) {
            const particleX = beamX + beamWidth/2 + (Math.random() - 0.5) * 40;
            const particleY = CANVAS.height - Math.random() * 30; // Über den gesamten unteren Bereich
            ctx.fillRect(particleX, particleY, 2, 2);
        }
        
        // VERSTÄRKTER Screen flash effect
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'; // Stärker sichtbar
        ctx.fillRect(0, 0, CANVAS.width, CANVAS.height);
    }
    
    // VERSTÄRKTE elektrische Effekte während Cooldown für bessere Sichtbarkeit
    if (obstacle.state === 'cooldown') {
        // Kontinuierliche blaue Aura um die gesamte Spule
        const idleGlow = 0.3 + Math.sin(timeScale * 6) * 0.2;
        ctx.fillStyle = `rgba(0, 150, 255, ${idleGlow})`;
        const auraSize = 8 + Math.sin(timeScale * 4) * 3;
        ctx.fillRect(x - auraSize/2, actualY - auraSize/2, width + auraSize, height + auraSize);
        
        // Häufigere elektrische Bögen am unteren Ende
        if (Math.sin(timeScale * 12) > 0.3) { // Viel häufiger als vorher
            ctx.strokeStyle = 'rgba(0, 255, 255, 0.8)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x + 8, actualY + height - 10);
            ctx.lineTo(x + width - 8, actualY + height - 5);
            ctx.stroke();
            
            // Zusätzlicher Bogen
            ctx.strokeStyle = 'rgba(100, 200, 255, 0.6)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x + 6, actualY + height - 15);
            ctx.lineTo(x + width - 6, actualY + height - 8);
            ctx.stroke();
        }
        
        // Kleine tanzende Funken um die Spule
        for (let i = 0; i < 4; i++) {
            const sparkAngle = timeScale * 8 + i * Math.PI/2;
            const sparkRadius = 15 + Math.sin(timeScale * 5 + i) * 5;
            const sparkX = x + width/2 + Math.cos(sparkAngle) * sparkRadius;
            const sparkY = actualY + height/2 + Math.sin(sparkAngle) * sparkRadius * 0.6;
            
            const sparkAlpha = 0.4 + Math.sin(timeScale * 10 + i * 2) * 0.4;
            ctx.fillStyle = `rgba(0, 255, 255, ${sparkAlpha})`;
            ctx.fillRect(sparkX - 1, sparkY - 1, 3, 3);
        }
        
        // Pulsierende Elektrode
        const electrodePulse = 0.5 + Math.sin(timeScale * 7) * 0.3;
        ctx.fillStyle = `rgba(0, 200, 255, ${electrodePulse})`;
        ctx.fillRect(x + 8, actualY + height - 20, width - 16, 15);
        
        // Vertikale Blitze zwischen den Spulen
        if (Math.sin(timeScale * 15) > 0.6) {
            ctx.strokeStyle = 'rgba(100, 255, 255, 0.7)';
            ctx.lineWidth = 1;
            for (let i = 0; i < 3; i++) {
                const boltX = x + 8 + i * ((width - 16) / 2);
                ctx.beginPath();
                ctx.moveTo(boltX, actualY + 12);
                ctx.lineTo(boltX + (Math.random() - 0.5) * 6, actualY + height - 25);
                ctx.stroke();
            }
        }
    }
}

function drawFrankensteinTable(ctx, x, y, width, height, obstacle) {
    const scale = 1.1;
    const timeScale = Date.now() * 0.001;
    
    // Tisch steht auf dem Boden
    const tableY = y; // Y-Position am Boden
    
    // Tisch-Basis (schwerer Stein/Metall)
    ctx.fillStyle = '#2F2F2F';
    ctx.fillRect(x + 4, tableY + height - 12, width - 8, 12); // Basis
    
    // Tisch-Beine (eiserne Säulen)
    ctx.fillStyle = '#1A1A1A';
    ctx.fillRect(x + 2, tableY + height - 20, 6, 8); // Linkes Bein
    ctx.fillRect(x + width - 8, tableY + height - 20, 6, 8); // Rechtes Bein
    
    // Haupt-Tischplatte
    ctx.fillStyle = '#3A3A3A';
    ctx.fillRect(x, tableY + height - 25, width, 8);
    
    // Metallrahmen
    ctx.fillStyle = '#4A4A4A';
    ctx.fillRect(x + 2, tableY + height - 27, width - 4, 2);
    ctx.fillRect(x + 2, tableY + height - 18, width - 4, 2);
    
    // KORRIGIERT: Frankenstein-Körper auf dem Tisch - DEUTLICH SICHTBARER
    // Körper liegt AUF der Tischplatte (nicht darunter)
    const bodyY = tableY + height - 50; // 25 Pixel über der Tischplatte
    
    // Körper-Hauptteil (größer und deutlicher)
    ctx.fillStyle = '#8FBC8F'; // Grünliche Haut
    ctx.fillRect(x + 8, bodyY, width - 16, 25); // Torso - größer und höher
    
    // Kopf (größer und deutlicher positioniert)
    ctx.fillStyle = '#98FB98'; // Hellere grüne Haut für bessere Sichtbarkeit
    ctx.fillRect(x + 12, bodyY - 12, width - 24, 12); // Kopf über dem Körper
    
    // Körper-Details (deutlicher sichtbar)
    ctx.fillStyle = '#556B2F'; // Dunklere Haut-Schatten
    ctx.fillRect(x + width/2 - 1, bodyY, 2, 20); // Mittlere Bauch-Naht
    ctx.fillRect(x + 10, bodyY + 5, width - 20, 1); // Horizontale Naht
    ctx.fillRect(x + 10, bodyY + 15, width - 20, 1); // Weitere horizontale Naht
    ctx.fillRect(x + width/2 - 1, bodyY - 10, 2, 8); // Hals-Naht
    
    // Arme (deutlicher sichtbar)
    ctx.fillStyle = '#8FBC8F';
    ctx.fillRect(x + 4, bodyY + 5, 8, 15); // Linker Arm
    ctx.fillRect(x + width - 12, bodyY + 5, 8, 15); // Rechter Arm
    
    // Hände
    ctx.fillStyle = '#7CFC00'; // Hellere Farbe für bessere Sichtbarkeit
    ctx.fillRect(x + 2, bodyY + 18, 4, 6); // Linke Hand
    ctx.fillRect(x + width - 6, bodyY + 18, 4, 6); // Rechte Hand
    
    // Beine (auf der Tischplatte sichtbar)
    ctx.fillStyle = '#8FBC8F';
    ctx.fillRect(x + 12, bodyY + 20, 6, 8); // Linkes Bein
    ctx.fillRect(x + width - 18, bodyY + 20, 6, 8); // Rechtes Bein
    
    // Füße
    ctx.fillStyle = '#7CFC00';
    ctx.fillRect(x + 10, bodyY + 26, 8, 4); // Linker Fuß
    ctx.fillRect(x + width - 18, bodyY + 26, 8, 4); // Rechter Fuß
    
    // Metall-Bolzen im Kopf (prominenter)
    ctx.fillStyle = '#C0C0C0';
    ctx.fillRect(x + 10, bodyY - 8, 4, 4); // Linker Bolzen
    ctx.fillRect(x + width - 14, bodyY - 8, 4, 4); // Rechter Bolzen
    
    // Augen (immer leicht sichtbar)
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 16, bodyY - 8, 2, 2); // Linkes Auge
    ctx.fillRect(x + width - 18, bodyY - 8, 2, 2); // Rechtes Auge
    
    // Mund/Naht
    ctx.fillStyle = '#556B2F';
    ctx.fillRect(x + 14, bodyY - 4, width - 28, 1); // Mund-Naht
    
    // Labor-Ausrüstung um den Tisch (Equipment float bleibt)
    const equipmentFloat = Math.sin(timeScale * 3) * 1;
    
    // Tesla-Spulen an den Seiten
    ctx.fillStyle = '#B87333'; // Kupfer
    ctx.fillRect(x - 8, tableY + height - 35 + equipmentFloat, 4, 15); // Linke Spule
    ctx.fillRect(x + width + 4, tableY + height - 35 + equipmentFloat, 4, 15); // Rechte Spule
    
    // Spulen-Details
    for (let i = 0; i < 5; i++) {
        const coilY = tableY + height - 32 + i * 2 + equipmentFloat;
        ctx.fillRect(x - 9, coilY, 6, 1); // Linke Spulen-Windungen
        ctx.fillRect(x + width + 3, coilY, 6, 1); // Rechte Spulen-Windungen
    }
    
    // Elektroden über dem Körper (höher positioniert)
    ctx.fillStyle = '#C0C0C0';
    ctx.fillRect(x + 8, bodyY - 20, 3, 12); // Linke Elektrode
    ctx.fillRect(x + width - 11, bodyY - 20, 3, 12); // Rechte Elektrode
    
    // Verkabelung
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 9, bodyY - 8); // Von linker Elektrode
    ctx.lineTo(x - 6, tableY + height - 30 + equipmentFloat); // Zur linken Spule
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(x + width - 9, bodyY - 8); // Von rechter Elektrode
    ctx.lineTo(x + width + 6, tableY + height - 30 + equipmentFloat); // Zur rechten Spule
    ctx.stroke();
    
    // State-based effects
    if (obstacle.state === 'charging') {
        // VERSTÄRKTE Charging glow für bessere Warnung
        const chargeIntensity = (obstacle.chargeTime - obstacle.stateTimer) / obstacle.chargeTime;
        const glowAlpha = Math.min(chargeIntensity * 1.2, 1.0);
        
        // Elektroden-Glow
        ctx.fillStyle = `rgba(0, 255, 255, ${glowAlpha})`;
        const glowSize = chargeIntensity * 10;
        ctx.fillRect(x + 8 - glowSize/2, bodyY - 20 - glowSize/2, 3 + glowSize, 12 + glowSize);
        ctx.fillRect(x + width - 11 - glowSize/2, bodyY - 20 - glowSize/2, 3 + glowSize, 12 + glowSize);
        
        // Körper-Glow (Monster wird belebt)
        ctx.fillStyle = `rgba(255, 255, 0, ${glowAlpha * 0.6})`;
        ctx.fillRect(x + 6, bodyY - 14, width - 12, 35); // Umhüllt den ganzen Körper
        
        // Spulen-Funken
        if (Math.random() > 0.4) {
            ctx.fillStyle = '#FFFF00';
            for (let s = 0; s < 4; s++) {
                const sparkX = x - 8 + Math.random() * 6;
                const sparkY = tableY + height - 35 + Math.random() * 15 + equipmentFloat;
                ctx.fillRect(sparkX, sparkY, 2, 2);
                
                const sparkX2 = x + width + 4 + Math.random() * 6;
                const sparkY2 = tableY + height - 35 + Math.random() * 15 + equipmentFloat;
                ctx.fillRect(sparkX2, sparkY2, 2, 2);
            }
        }
        
        // Monster-Zuckungen bei fast vollständiger Ladung
        if (chargeIntensity > 0.8) {
            const twitch = Math.sin(Date.now() * 0.05) * 2;
            ctx.fillStyle = '#90EE90'; // Heller grün
            ctx.fillRect(x + 8 + twitch, bodyY, width - 16, 25);
            
            // Augen leuchten auf
            ctx.fillStyle = `rgba(255, 0, 0, ${Math.sin(Date.now() * 0.03)})`;
            ctx.fillRect(x + 16, bodyY - 8, 3, 3); // Linkes Auge größer
            ctx.fillRect(x + width - 19, bodyY - 8, 3, 3); // Rechtes Auge größer
        }
        
        // Pulsierende Warnung bei fast vollständiger Ladung
        if (chargeIntensity > 0.9) {
            const pulse = Math.sin(Date.now() * 0.04) * 0.5 + 0.5;
            ctx.fillStyle = `rgba(255, 100, 0, ${pulse * 0.6})`;
            ctx.fillRect(x - 10, bodyY - 25, width + 20, 60);
        }
    }
    
    if (obstacle.state === 'zapping' && obstacle.zapActive) {
        // FRANKENSTEIN-BLITZ: VON TISCH NACH OBEN ZUR DECKE
        const beamX = x + width/2 - 12; // Zentriert über dem Tisch
        const beamY = 0; // Startet an der Decke
        const beamWidth = 24; // Breiter Blitz
        const beamHeight = bodyY - 20; // Bis zu den Elektroden
        
        // VERSTÄRKTER Haupt-Blitz
        ctx.fillStyle = 'rgba(255, 255, 0, 1.0)'; // Gelber Frankenstein-Blitz
        ctx.fillRect(beamX, beamY, beamWidth, beamHeight);
        
        // HELLERER Blitz-Kern
        ctx.fillStyle = 'rgba(255, 255, 255, 1.0)';
        ctx.fillRect(beamX + 6, beamY, beamWidth - 12, beamHeight);
        
        // Zusätzliche äußere Glow-Schichten
        ctx.fillStyle = 'rgba(255, 255, 0, 0.7)';
        ctx.fillRect(beamX - 6, beamY, beamWidth + 12, beamHeight);
        
        ctx.fillStyle = 'rgba(255, 200, 0, 0.4)';
        ctx.fillRect(beamX - 12, beamY, beamWidth + 24, beamHeight);
        
        // MEHR Zick-Zack Lightning-Effekte
        ctx.strokeStyle = 'rgba(255, 255, 0, 0.9)';
        ctx.lineWidth = 4;
        for (let i = 0; i < 8; i++) {
            ctx.beginPath();
            const startX = beamX + Math.random() * beamWidth;
            ctx.moveTo(startX, beamY);
            
            // Zick-Zack-Linie nach unten
            for (let h = 0; h < beamHeight; h += 15) {
                const zigX = startX + (Math.random() - 0.5) * 20;
                ctx.lineTo(zigX, beamY + h);
            }
            ctx.stroke();
        }
        
        // VERSTÄRKTER Decken-Impact
        ctx.fillStyle = 'rgba(255, 255, 255, 1.0)';
        const ceilingImpactSize = 40;
        ctx.fillRect(beamX - ceilingImpactSize/2 + beamWidth/2, 0, ceilingImpactSize, 12);
        
        // Monster wird "lebendig" während des Blitzes
        const monsterTwitch = Math.sin(Date.now() * 0.1) * 3;
        ctx.fillStyle = '#90EE90'; // Sehr helle grüne Haut
        ctx.fillRect(x + 8 + monsterTwitch, bodyY, width - 16, 25);
        
        // Augen leuchten hell auf
        ctx.fillStyle = 'rgba(255, 0, 0, 1.0)';
        ctx.fillRect(x + 16, bodyY - 8, 4, 4);
        ctx.fillRect(x + width - 20, bodyY - 8, 4, 4);
        
        // Zusätzliche Impact-Partikel an der Decke
        ctx.fillStyle = 'rgba(255, 200, 0, 0.8)';
        for (let p = 0; p < 12; p++) {
            const particleX = beamX + beamWidth/2 + (Math.random() - 0.5) * 60;
            const particleY = Math.random() * 25;
            ctx.fillRect(particleX, particleY, 3, 3);
        }
        
        // VERSTÄRKTER Screen flash effect
        ctx.fillStyle = 'rgba(255, 255, 200, 0.04)';
        ctx.fillRect(0, 0, CANVAS.width, CANVAS.height);
    }
    
    // Idle electric arcs zwischen Spulen
    if (obstacle.state === 'idle' && Math.sin(timeScale * 6) > 0.7) {
        ctx.strokeStyle = 'rgba(0, 200, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - 6, tableY + height - 25 + equipmentFloat);
        ctx.lineTo(x + width + 6, tableY + height - 25 + equipmentFloat);
        ctx.stroke();
        
        // Kleine Funken auf dem Körper
        ctx.fillStyle = 'rgba(255, 255, 0, 0.6)';
        const sparkX = x + 8 + Math.random() * (width - 16);
        const sparkY = bodyY + Math.random() * 25;
        ctx.fillRect(sparkX, sparkY, 2, 2);
    }
    
    // Labor-Details: Reagenzgläser und Instrumente
    const glassGlow = 0.6 + Math.sin(timeScale * 4) * 0.3;
    
    // Reagenzglas links
    ctx.fillStyle = 'rgba(0, 255, 0, 0.3)'; // Grüne Flüssigkeit
    ctx.fillRect(x - 12, tableY + height - 20, 3, 8);
    ctx.fillStyle = '#808080'; // Glas
    ctx.fillRect(x - 13, tableY + height - 21, 5, 1); // Glasrand
    
    // Reagenzglas rechts  
    ctx.fillStyle = 'rgba(255, 0, 255, 0.3)'; // Lila Flüssigkeit
    ctx.fillRect(x + width + 9, tableY + height - 18, 3, 6);
    ctx.fillStyle = '#808080';
    ctx.fillRect(x + width + 8, tableY + height - 19, 5, 1);
    
    // Blubbernde Effekte in den Gläsern
    if (Math.random() > 0.8) {
        ctx.fillStyle = `rgba(255, 255, 255, ${glassGlow})`;
        ctx.fillRect(x - 11, tableY + height - 18, 1, 1); // Bubble links
        ctx.fillRect(x + width + 10, tableY + height - 16, 1, 1); // Bubble rechts
    }
}
export function drawEnemy(obstacle, ctx) {
    const scale = 5;
    const screenX = getScreenX(obstacle.x);
    const animTime = obstacle.animationTime || 0;
    
    switch(obstacle.type) {
        case 'skeleton': 
            drawSkeleton(ctx, screenX, obstacle.y, animTime); 
            break;
        case 'bat': 
            drawBat(ctx, screenX, obstacle.y); 
            break;
        case 'vampire': 
            drawVampire(ctx, screenX, obstacle.y, animTime); 
            break;
        case 'spider': 
            drawSpider(ctx, screenX, obstacle.y, false, animTime); 
            break;
        case 'wolf': 
            drawWolf(ctx, screenX, obstacle.y, false, animTime); 
            break;
        case 'alphaWolf': 
            drawWolf(ctx, screenX, obstacle.y, true, animTime); 
            break;
        case 'rock': 
            drawRock(ctx, screenX, obstacle.y, obstacle.width, obstacle.height, animTime); 
            break;
        case 'boltBox': 
            drawBoltBox(ctx, screenX, obstacle.y, animTime); 
            break;
        case 'teslaCoil': 
            drawTeslaCoil(ctx, screenX, obstacle.y, obstacle.width, obstacle.height, obstacle); 
            break;
        case 'frankensteinTable': 
            drawFrankensteinTable(ctx, screenX, obstacle.y, obstacle.width, obstacle.height, obstacle); 
            break;
    }
    
    // Health Bar nur für bewegliche Enemies (nicht Environment-Objekte)
    const movingEnemies = ['skeleton', 'bat', 'vampire', 'spider', 'wolf', 'alphaWolf'];
    if (obstacle.health >= 1 && obstacle.maxHealth >= 1 && 
        movingEnemies.includes(obstacle.type)) {
        drawHealthBar(ctx, screenX, obstacle.y - 8, obstacle.width, obstacle.health, obstacle.maxHealth, obstacle.type);
    }
}




function drawHealthBar(ctx, x, y, width, health, maxHealth, type) {
    const barHeight = 4;
    const healthPercent = health / maxHealth;
    const segmentCount = maxHealth; // Ein Segment pro Leben
    const gapSize = 2; // Pixel zwischen Segmenten
    const segmentWidth = (width - (gapSize * (segmentCount - 1))) / segmentCount;
    
    // Draw each health segment separately
    for (let i = 0; i < segmentCount; i++) {
        const segmentX = x + (i * (segmentWidth + gapSize));
        
        // Background für jedes Segment
        ctx.fillStyle = '#666666';
        ctx.fillRect(segmentX, y, segmentWidth, barHeight);
        
        // Health-Segment nur wenn noch Leben vorhanden
        if (i < health) {
            const healthColor = (type === 'alphaWolf') ? '#FF0000' : '#FF0000';
            ctx.fillStyle = healthColor;
            ctx.fillRect(segmentX, y, segmentWidth, barHeight);
        }
    }
}

function drawSkeleton(ctx, x, y, animTime = 0) {
    const scale = 1.5; // 20% größer
    // FPS-normalisiert: Verwende animTime statt Date.now() für konsistente Animation
    const timeScale = animTime * 0.001; // Langsamer als vorher
    
    const rattle = Math.sin(timeScale * 15) * 0.5 * scale;
    const sway = Math.sin(timeScale * 6) * 0.4 * scale;
    const boneBobble = Math.sin(timeScale * 10) * 0.3 * scale;
    
    // Skull
    ctx.fillStyle = '#F5F5DC';
    ctx.fillRect(x + 12 * scale + sway, y + 8 * scale + boneBobble, 16 * scale, 16 * scale);
    
    // Eye sockets with glow
    const eyeGlow = 0.6 + Math.sin(timeScale * 8) * 0.4;
    ctx.fillStyle = `rgba(255, 0, 0, ${eyeGlow})`;
    ctx.fillRect(x + 16 * scale + sway, y + 12 * scale + boneBobble, 3 * scale, 3 * scale);
    ctx.fillRect(x + 21 * scale + sway, y + 12 * scale + boneBobble, 3 * scale, 3 * scale);
    
    // Jaw chattering
    const jawChatter = Math.sin(timeScale * 20) > 0.5 ? 1 * scale : 0;
    ctx.fillStyle = '#F5F5DC';
    ctx.fillRect(x + 14 * scale + sway, y + 20 * scale + boneBobble + jawChatter, 12 * scale, 4 * scale);
    
    // Spine
    ctx.fillRect(x + 18 * scale + sway + rattle, y + 24 * scale, 4 * scale, 20 * scale);
    
    // Ribs
    for (let i = 0; i < 3; i++) {
        const ribRattle = Math.sin(timeScale * 12 + i * 0.5) * 0.3 * scale;
        ctx.fillRect(x + 12 * scale + sway + ribRattle, y + 28 * scale + i * 4 * scale, 16 * scale, 2 * scale);
    }
    
    // Arms
    const leftArmRattle = Math.sin(timeScale * 14) * 0.8 * scale;
    const rightArmRattle = Math.sin(timeScale * 16) * 0.8 * scale;
    
    ctx.fillRect(x + 8 * scale + leftArmRattle, y + 30 * scale, 8 * scale, 4 * scale);
    ctx.fillRect(x + 24 * scale + rightArmRattle, y + 30 * scale, 8 * scale, 4 * scale);
    ctx.fillRect(x + 6 * scale + leftArmRattle, y + 32 * scale, 4 * scale, 8 * scale);
    ctx.fillRect(x + 30 * scale + rightArmRattle, y + 32 * scale, 4 * scale, 8 * scale);
    
    // Legs
    const leftLegRattle = Math.sin(timeScale * 13) * 0.4 * scale;
    const rightLegRattle = Math.sin(timeScale * 17) * 0.4 * scale;
    
    ctx.fillRect(x + 14 * scale + sway + leftLegRattle, y + 44 * scale, 4 * scale, 16 * scale);
    ctx.fillRect(x + 22 * scale + sway + rightLegRattle, y + 44 * scale, 4 * scale, 16 * scale);
    
    // Bone dust effect
    if (Math.sin(timeScale * 9) > 0.7) {
        ctx.fillStyle = 'rgba(245, 245, 220, 0.5)';
        const dustX = x + 15 * scale + sway + Math.sin(timeScale * 20) * 3 * scale;
        const dustY = y + 35 * scale + Math.cos(timeScale * 20) * 2 * scale;
        ctx.fillRect(dustX, dustY, 1 * scale, 1 * scale);
        ctx.fillRect(dustX + 3 * scale, dustY - 2 * scale, 1 * scale, 1 * scale);
    }
}

function drawBat(ctx, x, y) {
    // FPS-normalisiert: Verwende konsistente Zeit für Animation
    const currentTime = Date.now() * 0.001; // Einheitliche Zeitbasis
    const wingFlap = Math.sin(currentTime * 10) * 5;
    const hover = Math.sin(currentTime * 5) * 2;
    
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(x + 14, y + 24 + hover, 28, 4);
    
    // Body
    ctx.fillStyle = '#0A0A0A';
    ctx.fillRect(x + 23, y + 10 + hover, 14, 14);
    ctx.fillStyle = '#1A1A1A';
    ctx.fillRect(x + 21, y + 10 + hover, 12, 16);
    
    // Wings - Left
    ctx.fillStyle = '#2F2F2F';
    ctx.fillRect(x + 2 + wingFlap, y + 10 + hover, 19, 8);
    ctx.fillRect(x + 4 + wingFlap, y + 8 + hover, 14, 12);
    ctx.fillRect(x + 7 + wingFlap, y + 6 + hover, 8, 16);
    
    // Wings - Right
    ctx.fillRect(x + 35 - wingFlap, y + 10 + hover, 19, 8);
    ctx.fillRect(x + 38 - wingFlap, y + 8 + hover, 14, 12);
    ctx.fillRect(x + 41 - wingFlap, y + 6 + hover, 8, 16);
    
    // Wing membrane detail
    ctx.fillStyle = '#1A1A1A';
    ctx.fillRect(x + 4 + wingFlap, y + 10 + hover, 12, 4);
    ctx.fillRect(x + 6 + wingFlap, y + 8 + hover, 8, 8);
    ctx.fillRect(x + 8 + wingFlap, y + 6 + hover, 4, 10);
    
    ctx.fillRect(x + 26 - wingFlap, y + 10 + hover, 12, 4);
    ctx.fillRect(x + 28 - wingFlap, y + 8 + hover, 8, 8);
    ctx.fillRect(x + 30 - wingFlap, y + 6 + hover, 4, 10);
    
    // Wing struts
    ctx.fillStyle = '#0A0A0A';
    ctx.fillRect(x + 7 + wingFlap, y + 9 + hover, 1, 7);
    ctx.fillRect(x + 10 + wingFlap, y + 8 + hover, 1, 8);
    ctx.fillRect(x + 13 + wingFlap, y + 9 + hover, 1, 6);
    ctx.fillRect(x + 29 - wingFlap, y + 9 + hover, 1, 7);
    ctx.fillRect(x + 32 - wingFlap, y + 8 + hover, 1, 8);
    ctx.fillRect(x + 35 - wingFlap, y + 9 + hover, 1, 6);
    
    // Eyes
    ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.fillRect(x + 15, y + 10 + hover, 4, 4);
    ctx.fillRect(x + 21, y + 10 + hover, 4, 4);
    
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(x + 16, y + 11 + hover, 2, 2);
    ctx.fillRect(x + 22, y + 11 + hover, 2, 2);
    
    // Fangs
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + 18, y + 14 + hover, 1, 2);
    ctx.fillRect(x + 21, y + 14 + hover, 1, 2);
}

function drawVampire(ctx, x, y, animTime = 0) {
    // GEÄNDERT: Von 1.5 auf 2.2 für deutlich größeren Vampir
    const scale = 1.85; // War: 1.5, Jetzt: 2.2 (47% größer)
    
    const timeScale = animTime * 0.001;
    const sway = Math.sin(timeScale * 1.5) * 1;
    const capeFlutter = Math.sin(timeScale * 3.5) * 2;
    
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(x + 10 * scale + sway, y + 58 * scale, 20 * scale, 4 * scale);
    
    // Cape
    ctx.fillStyle = '#4B0000';
    ctx.fillRect(x + 7 * scale + sway - capeFlutter, y + 20 * scale, 32 * scale + capeFlutter, 30 * scale);
    ctx.fillStyle = '#8B0000';
    ctx.fillRect(x + 5 * scale + sway - capeFlutter, y + 20 * scale, 28 * scale + capeFlutter, 28 * scale);
    ctx.fillStyle = '#660000';
    ctx.fillRect(x + 4 * scale + sway - capeFlutter, y + 22 * scale, 2 * scale, 24 * scale);
    ctx.fillRect(x + 33 * scale + sway + capeFlutter, y + 22 * scale, 2 * scale, 24 * scale);
    
    // Face
    ctx.fillStyle = '#F5F5DC';
    ctx.fillRect(x + 12 * scale + sway, y + 8 * scale, 16 * scale, 16 * scale);
    
    // Hair
    ctx.fillStyle = '#000000';
    const hairFlow = Math.sin(timeScale * 2) * 1;
    ctx.fillRect(x + 10 * scale + sway + hairFlow, y + 4 * scale, 20 * scale, 8 * scale);
    ctx.fillRect(x + 8 * scale + sway + hairFlow, y + 6 * scale, 2 * scale, 4 * scale);
    ctx.fillRect(x + 30 * scale + sway + hairFlow, y + 6 * scale, 2 * scale, 4 * scale);
    
    // Eyes with glow
    const eyeGlow = 0.7 + Math.sin(timeScale * 4) * 0.3;
    ctx.fillStyle = `rgba(255, 0, 0, ${eyeGlow})`;
    ctx.fillRect(x + 14 * scale + sway, y + 11 * scale, 4 * scale, 4 * scale);
    ctx.fillRect(x + 22 * scale + sway, y + 11 * scale, 4 * scale, 4 * scale);
    
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(x + 15 * scale + sway, y + 12 * scale, 2 * scale, 2 * scale);
    ctx.fillRect(x + 23 * scale + sway, y + 12 * scale, 2 * scale, 2 * scale);
    
    // Fangs
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + 17 * scale + sway, y + 18 * scale, 1 * scale, 3 * scale);
    ctx.fillRect(x + 22 * scale + sway, y + 18 * scale, 1 * scale, 3 * scale);
    
    // Body
    ctx.fillStyle = '#2F2F2F';
    ctx.fillRect(x + 10 * scale + sway, y + 24 * scale, 20 * scale, 20 * scale);
    ctx.fillStyle = '#1A1A1A';
    ctx.fillRect(x + 12 * scale + sway, y + 26 * scale, 16 * scale, 16 * scale);
    
    // Arms
    const armSway = Math.sin(timeScale * 3) * 0.5;
    ctx.fillStyle = '#F5F5DC';
    ctx.fillRect(x + 6 * scale + sway - armSway, y + 26 * scale, 6 * scale, 12 * scale);
    ctx.fillRect(x + 28 * scale + sway + armSway, y + 26 * scale, 6 * scale, 12 * scale);
    
    // Legs
    ctx.fillStyle = '#2F2F2F';
    ctx.fillRect(x + 12 * scale, y + 48 * scale, 6 * scale, 14 * scale);
    ctx.fillRect(x + 20 * scale, y + 48 * scale, 6 * scale, 14 * scale);
}

function drawSpider(ctx, x, y, isBoss = false, animTime = 0) {
    const scale = isBoss ? 2.2 : 1.90;
    const scaledWidth = 42 * scale;
    const scaledHeight = 28 * scale;
    
    const timeScale = animTime * 0.001;
    const scuttle = Math.sin(timeScale * 8) * 1.0;
    const bodyBob = Math.sin(timeScale * 8) * 0.2;
    
    // Boss glow
    if (isBoss) {
        const gradient = ctx.createRadialGradient(
            x + scaledWidth/2, y + scaledHeight/2, 0,
            x + scaledWidth/2, y + scaledHeight/2, scaledWidth * 0.8
        );
        gradient.addColorStop(0, 'rgba(139, 0, 139, 0.6)');
        gradient.addColorStop(0.5, 'rgba(75, 0, 130, 0.3)');
        gradient.addColorStop(1, 'rgba(75, 0, 130, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x - 15, y - 15, scaledWidth + 30, scaledHeight + 30);
    }
    
    // Main body
    ctx.fillStyle = isBoss ? '#4B0082' : '#1A1A1A';
    ctx.fillRect(x + 20 * scale, y + 8 * scale + bodyBob, 18 * scale, 14 * scale);
    ctx.fillRect(x + 22 * scale, y + 6 * scale + bodyBob, 14 * scale, 18 * scale);
    
    // Markings
    ctx.fillStyle = isBoss ? '#8B008B' : '#8B0000';
    ctx.fillRect(x + 24 * scale, y + 10 * scale + bodyBob, 10 * scale, 2 * scale);
    ctx.fillRect(x + 26 * scale, y + 14 * scale + bodyBob, 6 * scale, 2 * scale);
    ctx.fillRect(x + 25 * scale, y + 18 * scale + bodyBob, 8 * scale, 2 * scale);
    
    // Head segment
    ctx.fillStyle = isBoss ? '#4B0082' : '#2F2F2F';
    ctx.fillRect(x + 12 * scale, y + 12 * scale + bodyBob, 12 * scale, 10 * scale);
    
    // Eyes
    const eyeGlow = isBoss ? 1 : 0.8 + Math.sin(timeScale * 7) * 0.2;
    ctx.fillStyle = isBoss ? `rgba(138, 43, 226, ${eyeGlow})` : `rgba(255, 0, 0, ${eyeGlow})`;
    
    // Main eyes
    ctx.fillRect(x + 14 * scale, y + 14 * scale + bodyBob, 2 * scale, 2 * scale);
    ctx.fillRect(x + 18 * scale, y + 14 * scale + bodyBob, 2 * scale, 2 * scale);
    
    // Additional eyes
    ctx.fillRect(x + 13 * scale, y + 12 * scale + bodyBob, 1 * scale, 1 * scale);
    ctx.fillRect(x + 20 * scale, y + 12 * scale + bodyBob, 1 * scale, 1 * scale);
    ctx.fillRect(x + 12 * scale, y + 16 * scale + bodyBob, 1 * scale, 1 * scale);
    ctx.fillRect(x + 21 * scale, y + 16 * scale + bodyBob, 1 * scale, 1 * scale);
    ctx.fillRect(x + 15 * scale, y + 12 * scale + bodyBob, 1 * scale, 1 * scale);
    ctx.fillRect(x + 18 * scale, y + 12 * scale + bodyBob, 1 * scale, 1 * scale);
    
    // Fangs
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + 15 * scale, y + 17 * scale + bodyBob, 1 * scale, 3 * scale);
    ctx.fillRect(x + 18 * scale, y + 17 * scale + bodyBob, 1 * scale, 3 * scale);
    
    // Legs
    const legColors = isBoss ? '#4B0082' : '#1A1A1A';
    ctx.fillStyle = legColors;
    
    // Left legs
    for (let i = 0; i < 4; i++) {
        const legMovement = Math.sin(timeScale * 10 + i * 0.5) * 1.5;
        const legY = y + 10 * scale + i * 3 * scale + bodyBob;
        
        ctx.fillRect(x + (2 + legMovement) * scale, legY, 6 * scale, 2 * scale);
        ctx.fillRect(x + (1 + legMovement) * scale, legY + 2 * scale, 4 * scale, 2 * scale);
        ctx.fillRect(x + legMovement * scale, legY + 4 * scale, 3 * scale, 1 * scale);
    }
    
    // Right legs
    for (let i = 0; i < 4; i++) {
        const legMovement = Math.sin(timeScale * 10 + i * 0.5 + Math.PI) * 1.5;
        const legY = y + 10 * scale + i * 3 * scale + bodyBob;
        
        ctx.fillRect(x + (34 - legMovement) * scale, legY, 6 * scale, 2 * scale);
        ctx.fillRect(x + (37 - legMovement) * scale, legY + 2 * scale, 4 * scale, 2 * scale);
        ctx.fillRect(x + (39 - legMovement) * scale, legY + 4 * scale, 3 * scale, 1 * scale);
    }
    
    // Pedipalps
    const palpMovement = Math.sin(timeScale * 12) * 0.3;
    ctx.fillStyle = isBoss ? '#663399' : '#404040';
    ctx.fillRect(x + (10 + palpMovement) * scale, y + 15 * scale + bodyBob, 3 * scale, 1 * scale);
    ctx.fillRect(x + (21 - palpMovement) * scale, y + 15 * scale + bodyBob, 3 * scale, 1 * scale);
    
    // Web strand
    if (Math.sin(timeScale * 5) > 0.7) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + 18 * scale, y);
        ctx.lineTo(x + 18 * scale, y + 8 * scale + bodyBob);
        ctx.stroke();
    }
    
    // Boss-specific features
    if (isBoss) {
        // Venom drip
        const venomDrip = Math.sin(timeScale * 9) * 2;
        ctx.fillStyle = '#32CD32';
        ctx.fillRect(x + 15 * scale, y + 20 * scale + bodyBob + venomDrip, 1 * scale, 2 * scale);
        ctx.fillRect(x + 18 * scale, y + 20 * scale + bodyBob + venomDrip, 1 * scale, 2 * scale);
        
        // Glowing markings
        const markingGlow = 0.6 + Math.sin(timeScale * 8) * 0.4;
        ctx.fillStyle = `rgba(138, 43, 226, ${markingGlow})`;
        ctx.fillRect(x + 27 * scale, y + 12 * scale + bodyBob, 4 * scale, 2 * scale);
        ctx.fillRect(x + 28 * scale, y + 14 * scale + bodyBob, 2 * scale, 2 * scale);
        ctx.fillRect(x + 27 * scale, y + 16 * scale + bodyBob, 4 * scale, 2 * scale);
    }
    
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(x + 10 * scale, y + 22 * scale + bodyBob, 24 * scale, 2 * scale);
}

function drawWolf(ctx, x, y, isAlpha = false, animTime = 0) {
    const scale = isAlpha ? 2.3 : 1.75;
    const timeScale = animTime * 0.001;
    const prowl = Math.sin(timeScale * 2) * 0.8;
    const breathe = Math.sin(timeScale * 2.5) * 0.3;
    
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(x + 8 * scale, y + 32 * scale + prowl, 36 * scale, 4 * scale);
    
    // Body
    ctx.fillStyle = isAlpha ? '#2F2F2F' : '#696969';
    ctx.fillRect(x + 10 * scale, y + 12 * scale + prowl + breathe, 28 * scale, 16 * scale);
    ctx.fillRect(x + 8 * scale, y + 12 * scale + prowl + breathe, 26 * scale, 16 * scale);
    
    // Head
    ctx.fillStyle = isAlpha ? '#4A4A4A' : '#696969';
    ctx.fillRect(x + 2 * scale, y + 8 * scale + prowl + breathe, 14 * scale, 12 * scale);
    ctx.fillRect(x, y + 10 * scale + prowl + breathe, 6 * scale, 8 * scale);
    
    // Ears
    const earTwitch = Math.sin(timeScale * 6) * 0.5;
    ctx.fillStyle = '#2F2F2F';
    ctx.fillRect(x + 4 * scale, y + 4 * scale + prowl + earTwitch, 3 * scale, 6 * scale);
    ctx.fillRect(x + 9 * scale, y + 4 * scale + prowl - earTwitch, 3 * scale, 6 * scale);
    
    // Eyes
    const eyeGlow = isAlpha ? 1 : 0.8 + Math.sin(timeScale * 3) * 0.2;
    ctx.fillStyle = isAlpha ? `rgba(255, 255, 0, ${eyeGlow})` : `rgba(255, 0, 0, ${eyeGlow})`;
    ctx.fillRect(x + 5 * scale, y + 10 * scale + prowl + breathe, 2 * scale, 2 * scale);
    ctx.fillRect(x + 9 * scale, y + 10 * scale + prowl + breathe, 2 * scale, 2 * scale);
    
    // Mouth/teeth
    ctx.fillStyle = '#8B0000';
    ctx.fillRect(x + 2 * scale, y + 15 * scale + prowl + breathe, 8 * scale, 3 * scale);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + 3 * scale, y + 15 * scale + prowl + breathe, 1 * scale, 2 * scale);
    ctx.fillRect(x + 5 * scale, y + 15 * scale + prowl + breathe, 1 * scale, 2 * scale);
    ctx.fillRect(x + 7 * scale, y + 15 * scale + prowl + breathe, 1 * scale, 2 * scale);
    
    // Legs
    const legMove = Math.sin(timeScale * 1.5) * 0.3;
    ctx.fillStyle = '#2F2F2F';
    ctx.fillRect(x + 10 * scale + legMove, y + 26 * scale, 4 * scale, 8 * scale);
    ctx.fillRect(x + 16 * scale - legMove, y + 26 * scale, 4 * scale, 8 * scale);
    ctx.fillRect(x + 22 * scale + legMove, y + 26 * scale, 4 * scale, 8 * scale);
    ctx.fillRect(x + 28 * scale - legMove, y + 26 * scale, 4 * scale, 8 * scale);
    
    // Claws
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + 11 * scale + legMove, y + 33 * scale, 1 * scale, 2 * scale);
    ctx.fillRect(x + 17 * scale - legMove, y + 33 * scale, 1 * scale, 2 * scale);
    ctx.fillRect(x + 23 * scale + legMove, y + 33 * scale, 1 * scale, 2 * scale);
    ctx.fillRect(x + 29 * scale - legMove, y + 33 * scale, 1 * scale, 2 * scale);
    
    // Tail
    const tailWag = Math.sin(timeScale * 4) * 3;
    ctx.fillStyle = isAlpha ? '#4A4A4A' : '#696969';
    ctx.fillRect(x + 36 * scale + tailWag, y + 14 * scale + prowl, 8 * scale, 3 * scale);
    
    // Alpha crown
    if (isAlpha) {
        const crownGlow = 0.6 + Math.sin(timeScale * 3.5) * 0.4;
        ctx.fillStyle = `rgba(255, 215, 0, ${crownGlow})`;
        ctx.fillRect(x + 5 * scale, y + 2 * scale + prowl, 2 * scale, 3 * scale);
        ctx.fillRect(x + 8 * scale, y + 1 * scale + prowl, 2 * scale, 4 * scale);
        ctx.fillRect(x + 11 * scale, y + 2 * scale + prowl, 2 * scale, 3 * scale);
    }
}

function drawRock(ctx, x, y, width, height) {
    const scale = 1.0;
    
    // Shadow beneath the rock
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(x - 2 * scale, y + height - 4 * scale, width + 4 * scale, 6 * scale);
    
    // Base stone layers
    ctx.fillStyle = '#2F2F2F';
    ctx.fillRect(x, y + height - 8 * scale, width, 8 * scale);
    ctx.fillRect(x - 2 * scale, y + height - 4 * scale, width + 4 * scale, 4 * scale);
    
    // Main rock body
    ctx.fillStyle = '#4A4A4A';
    ctx.fillRect(x + 5 * scale, y + 6 * scale, width - 5 * scale, height - 14 * scale);
    
    ctx.fillStyle = '#696969';
    ctx.fillRect(x + 3 * scale, y + 6 * scale, width - 6 * scale, height - 14 * scale);
    
    // Rock top shape
    ctx.fillRect(x + 5 * scale, y + 2 * scale, width - 10 * scale, 8 * scale);
    ctx.fillRect(x + 7 * scale, y, width - 14 * scale, 6 * scale);
    ctx.fillRect(x + 10 * scale, y - 2 * scale, width - 20 * scale, 4 * scale);
    
    // Highlights
    ctx.fillStyle = '#808080';
    ctx.fillRect(x + 3 * scale, y + 4 * scale, 2 * scale, height - 16 * scale);
    ctx.fillRect(x + 5 * scale, y + 2 * scale, width - 12 * scale, 2 * scale);
    
    // Cracks and details
    ctx.fillStyle = '#1A1A1A';
    ctx.fillRect(x + 12 * scale, y + 4 * scale, 1 * scale, height - 18 * scale);
    ctx.fillRect(x + 8 * scale, y + height/2, 12 * scale, 1 * scale);
    ctx.fillRect(x + 18 * scale, y + 8 * scale, 1 * scale, 15 * scale);
    ctx.fillRect(x + 6 * scale, y + height - 10 * scale, 8 * scale, 1 * scale);
    
    // Moss patches
    ctx.fillStyle = '#556B2F';
    ctx.fillRect(x + 5 * scale, y + 10 * scale, 4 * scale, 8 * scale);
    ctx.fillRect(x + width - 7 * scale, y + height - 20 * scale, 5 * scale, 10 * scale);
    ctx.fillRect(x + 15 * scale, y + height - 12 * scale, 8 * scale, 4 * scale);
    
    // Dark center rune
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + width/2, y + 8 * scale, 2 * scale, 10 * scale);
    ctx.fillRect(x + width/2 - 4 * scale, y + 12 * scale, 10 * scale, 2 * scale);
    
    // Additional shading
    ctx.fillStyle = '#2F2F2F';
    ctx.fillRect(x + 8 * scale, y + 20 * scale, width - 16 * scale, 1 * scale);
    ctx.fillRect(x + 10 * scale, y + 23 * scale, width - 20 * scale, 1 * scale);
    ctx.fillRect(x + 9 * scale, y + 26 * scale, width - 18 * scale, 1 * scale);
    
    // Candle on side (dungeon theme detail) - FPS-normalisiert
    const currentTime = Date.now() * 0.001;
    const flicker = Math.sin(currentTime * 8) * 2;
    
    // Candle body
    ctx.fillStyle = '#F5F5DC';
    ctx.fillRect(x + width + 2 * scale, y + height - 12 * scale, 4 * scale, 12 * scale);
    
    // Melted wax
    ctx.fillStyle = '#FFFACD';
    ctx.fillRect(x + width + 1 * scale, y + height - 10 * scale, 6 * scale, 2 * scale);
    ctx.fillRect(x + width + 2 * scale, y + height - 8 * scale, 5 * scale, 1 * scale);
    
    // Wick
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + width + 4 * scale, y + height - 14 * scale, 1 * scale, 3 * scale);
    
    // Flame
    const flameHeight = 6 + flicker;
    ctx.fillStyle = '#FF4500';
    ctx.fillRect(x + width + 3 * scale, y + height - 18 * scale - flicker, 3 * scale, flameHeight);
    
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(x + width + 4 * scale, y + height - 17 * scale - flicker, 1 * scale, flameHeight - 2);
    
    // Flame glow
    ctx.fillStyle = 'rgba(255, 165, 0, 0.3)';
    ctx.fillRect(x + width + 1 * scale, y + height - 20 * scale - flicker, 7 * scale, 10 * scale);
    
    // Wax drips
    ctx.fillStyle = '#FFFACD';
    ctx.fillRect(x + width + 1 * scale, y + height - 7 * scale, 1 * scale, 4 * scale);
    ctx.fillRect(x + width + 6 * scale, y + height - 5 * scale, 1 * scale, 3 * scale);
}

function drawBoltBox(ctx, x, y, animTime = 0) {
    const scale = 1.30;
    const timeScale = animTime * 0.001;
    const float = Math.sin(timeScale * 4) * 2.5;
    const electricPulse = 0.5 + Math.sin(timeScale * 8) * 0.5;
    
    // Electric aura
    const centerX = x + 12 * scale;
    const centerY = y + 8 * scale + float;
    const glowRadius = 32 * scale;
    
    const gradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, glowRadius
    );
    
    gradient.addColorStop(0, `rgba(0, 255, 255, ${electricPulse * 0.8})`);
    gradient.addColorStop(0.2, `rgba(0, 255, 255, ${electricPulse * 0.6})`);
    gradient.addColorStop(0.4, `rgba(0, 255, 255, ${electricPulse * 0.4})`);
    gradient.addColorStop(0.6, `rgba(0, 255, 255, ${electricPulse * 0.2})`);
    gradient.addColorStop(0.8, `rgba(0, 255, 255, ${electricPulse * 0.1})`);
    gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(
        centerX - glowRadius,
        centerY - glowRadius,
        glowRadius * 2,
        glowRadius * 2
    );
    
    // Box with electric shake
    const electricShake = Math.sin(timeScale * 25) * 0.2;
    ctx.fillStyle = '#2F2F2F';
    ctx.fillRect(x + electricShake, y + float, 24 * scale, 16 * scale);
    
    // Box highlights
    ctx.fillStyle = '#4A4A4A';
    ctx.fillRect(x + 2 * scale + electricShake, y + 2 * scale + float, 20 * scale, 2 * scale);
    ctx.fillRect(x + 2 * scale + electricShake, y + 2 * scale + float, 2 * scale, 12 * scale);
    
    // Box shadows
    ctx.fillStyle = '#1A1A1A';
    ctx.fillRect(x + 20 * scale + electricShake, y + 4 * scale + float, 4 * scale, 12 * scale);
    ctx.fillRect(x + 4 * scale + electricShake, y + 12 * scale + float, 20 * scale, 4 * scale);
    
    // Lightning bolt icon
    const boltGlow = 0.8 + Math.sin(timeScale * 10) * 0.2;
    ctx.fillStyle = `rgba(0, 255, 255, ${boltGlow})`;
    ctx.fillRect(x + 10 * scale + electricShake, y + 6 * scale + float, 2 * scale, 4 * scale);
    ctx.fillRect(x + 8 * scale + electricShake, y + 7 * scale + float, 6 * scale, 2 * scale);
    ctx.fillRect(x + 12 * scale + electricShake, y + 8 * scale + float, 4 * scale, 2 * scale);
    
    // Electric sparks
    ctx.fillStyle = `rgba(255, 255, 0, ${electricPulse})`;
    const spark1X = x + 12 * scale + Math.sin(timeScale * 20) * 4 * scale;
    const spark1Y = y + 8 * scale + float + Math.cos(timeScale * 20) * 3 * scale;
    const spark2X = x + 16 * scale + Math.sin(timeScale * 18) * 3 * scale;
    const spark2Y = y + 6 * scale + float + Math.cos(timeScale * 22) * 4 * scale;
    
    ctx.fillRect(spark1X, spark1Y, 1 * scale, 1 * scale);
    ctx.fillRect(spark2X, spark2Y, 1 * scale, 1 * scale);
    
    // Lightning arcs
    if (Math.sin(timeScale * 15) > 0.6) {
        ctx.strokeStyle = `rgba(0, 255, 255, ${electricPulse * 0.8})`;
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.moveTo(x + 8 * scale, y + 4 * scale + float);
        ctx.lineTo(x + 18 * scale + Math.sin(timeScale * 30) * 2 * scale, y + 10 * scale + float);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(x + 20 * scale, y + 6 * scale + float);
        ctx.lineTo(x + 14 * scale + Math.cos(timeScale * 25) * 2 * scale, y + 12 * scale + float);
        ctx.stroke();
    }
    
    // Bright center flash
    if (Math.sin(timeScale * 12) > 0.4) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(x + 11 * scale + electricShake, y + 7 * scale + float, 2 * scale, 2 * scale);
    }
}