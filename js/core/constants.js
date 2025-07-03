// core/constants.js - Alle Spielkonstanten für Dungeon Runner

export const GAME_CONSTANTS = {
    MAX_LEVEL_PROGRESS: 100,
    GRAVITY: 1.25,
    LIGHT_GRAVITY: 0.6,
    JUMP_STRENGTH: -10.5,
    DOUBLE_JUMP_STRENGTH: -6,
    BULLET_SPEED: 10,
    FPS: 60,
    PLAYER_MOVE_SPEED: 5,
    DAMAGE_RESISTANCE_TIME: 60,
    MAX_JUMP_HOLD_TIME: 90,
    ANIMATION_SPEED: 0.75,  // Neue Konstante für Animations-Geschwindigkeit
    BULLET_SPEED_MULTIPLIER: 1  // Bullet speed adjustment
};

export const CAMERA_CONSTANTS = {
    DEAD_ZONE_RATIO: 0.44,
    FOLLOW_ZONE_RATIO: 0.56
};

export const GameState = {
    START: 'start',
    PLAYING: 'playing',
    PAUSED: 'paused',
    LEVEL_COMPLETE: 'levelComplete',
    GAME_OVER: 'gameOver'
};

export const DropType = {
    EXTRA_LIFE: 'extraLife',
    MEGA_BULLETS: 'megaBullets',
    SPEED_BOOST: 'speedBoost',
    JUMP_BOOST: 'jumpBoost',
    SHIELD: 'shield',
    SCORE_MULTIPLIER: 'scoreMultiplier',
    MAGNET_MODE: 'magnetMode',
    BERSERKER_MODE: 'berserkerMode',
    GHOST_WALK: 'ghostWalk',
    TIME_SLOW: 'timeSlow'
};

export const DROP_CONFIG = {
    boss: {
        chance: 0.50,
        items: [
            { type: DropType.EXTRA_LIFE, chance: 0.25, duration: 0 },
            { type: DropType.MEGA_BULLETS, chance: 0.25, duration: 0 },
            { type: DropType.SPEED_BOOST, chance: 0.20, duration: 600 },
            { type: DropType.JUMP_BOOST, chance: 0.30, duration: 1800 }
        ]
    },
    common: {
        chance: 0.01,
        items: [
            { type: DropType.SHIELD, chance: 0.20, duration: 0 },
            { type: DropType.SCORE_MULTIPLIER, chance: 0.30, duration: 1200 },
            { type: DropType.MAGNET_MODE, chance: 0.20, duration: 1200 },
            { type: DropType.BERSERKER_MODE, chance: 0.15, duration: 600 },
            { type: DropType.GHOST_WALK, chance: 0.10, duration: 300 },
            { type: DropType.TIME_SLOW, chance: 0.05, duration: 300 }
        ]
    }
};

export const ACHIEVEMENTS = {
    firstBlood: { 
        id: 'firstBlood', 
        name: 'First Blood', 
        desc: 'Defeat your first boss', 
        reward: 'Higher drop rates', 
        unlocked: false 
    },
    untouchable: { 
        id: 'untouchable', 
        name: 'Untouchable', 
        desc: 'Complete a level without damage', 
        reward: 'Start with shield', 
        unlocked: false 
    },
    sharpshooter: { 
        id: 'sharpshooter', 
        name: 'Sharpshooter', 
        desc: '50 hits in a row', 
        reward: 'Piercing bullets', 
        unlocked: false 
    },
    speedDemon: { 
        id: 'speedDemon', 
        name: 'Speed Demon', 
        desc: '1000 points in 30 seconds', 
        reward: '+10% permanent speed', 
        unlocked: false 
    }
};

export const DUNGEON_THEME = {
    name: 'Dungeon\'s Escape',
    title: '⚡ Dungeon\'s Escape',
    labels: {
        score: 'Score',
        level: 'Level',
        bullets: '🗲',
        lives: 'Lives',
        highScore: 'High Score',
        enemies: 'Monsters',
        gameOver: '💀 Final Death! 💀',
        finalScore: 'Final Score'
    },
    buffs: [
        { 
            id: 'chainLightning', 
            title: '⚡ Chain Lightning', 
            desc: 'Unleash 3 bolts at once that arc between enemies' 
        },
        { 
            id: 'undeadResilience', 
            title: '🧟 Undead Vigor', 
            desc: 'Gain extra life every 10 (15) bullet hits' 
        },
        { 
            id: 'shadowLeap', 
            title: '🌙 Shadow Leap', 
            desc: 'Unlock double jump with ethereal shadow form' 
        }
    ],
    enemies: ['bat', 'vampire', 'spider', 'alphaWolf', 'skeleton', 'boltBox', 'rock', 'wolf', 'teslaCoil', 'frankensteinTable'],
    groundColor: '#2F2F2F',
    floorDetailColor: '#1A1A1A',
    startButton: 'Begin Nightmare'
};

export const HIGHSCORE_API = {
    URL: 'https://getpantry.cloud/apiv1/pantry/ee242f67-6e52-4018-a364-df8225b9e51b/basket/highscores'
};

export const MIN_SPAWN_DISTANCE = 60;
export const SPAWN_INTERVAL_DISTANCE = 1;

// Canvas dimensions (will be set by main.js)
export const CANVAS = {
    width: 800,
    height: 480,
    groundY: 340
};

// Enemy spawn chances by level
export const SPAWN_CHANCES = {
    getBossChance: (level) => Math.min(0.05 + (level * 0.020), 0.3),
    getFlyingChance: (level, bossChance) => bossChance + Math.min(0.45, 0.20 + (level * 0.015)),
    getMediumChance: (level, flyingChance) => flyingChance + Math.min(0.20, 0.10 + (level * 0.01)),
    getHumanChance: (level, mediumChance) => mediumChance + Math.min(0.10, 0.05 + (level * 0.005)),
    getStaticChance: (humanChance) => humanChance + 0.30
};

// Enemy configurations
export const ENEMY_CONFIG = {
    skeleton: {
        width: 34,
        height: 60,
        health: 1,
        points: 20,
        timerBase: 80,
        timerMin: 20
    },
    bat: {
        width: 56,
        height: 28,
        health: 1,
        points: 40,
        timerBase: 100,
        timerMin: 20
    },
    vampire: {
        width: 40,
        height: 42,
        health: 2,
        points: 25,
        timerBase: 100,
        timerMin: 20
    },
    spider: {
        width: 52,
        height: 44,
        health: 2,
        points: 50,
        timerBase: 120,
        timerMin: 30
    },
    wolf: {
        width: 48,
        height: 32,
        health: 3,
        points: 35,
        timerBase: 120,
        timerMin: 30
    },
    alphaWolf: {
        width: 90,
        height: 50,
        health: 5,
        points: 100,
        timerBase: 180,
        timerMin: 50
    },
    rock: {
        width: 30,
        height: 35,
        health: 1,
        points: 10,
        timerBase: 70,
        timerMin: 15
    },
    boltBox: {
        width: 24,
        height: 16,
        health: 1,
        points: 0,
        timerBase: 100,
        timerMin: 40
    },
    teslaCoil: {
        width: 32,
        height: 60,
        health: 1,
        points: 0,  // Keine Punkte da es ein Hindernis ist
        timerBase: 140,  // Halb so häufig wie rock (70 * 2)
        timerMin: 30
    },
    frankensteinTable: {
        width: 48,
        height: 60,
        health: 1,
        points: 0,  // Keine Punkte da es ein Hindernis ist
        timerBase: 160,  // Seltener als Tesla Coil
        timerMin: 40
    }
};

// Drop visual configurations
export const DROP_INFO = {
    [DropType.EXTRA_LIFE]: { icon: '❤️', color: '#FF0000', name: 'Extra Life' },
    [DropType.MEGA_BULLETS]: { icon: '📦', color: '#FFD700', name: 'Mega Bolts' },
    [DropType.SPEED_BOOST]: { icon: '⚡', color: '#00FFFF', name: 'Speed Boost' },
    [DropType.JUMP_BOOST]: { icon: '🚀', color: '#FF4500', name: 'Jump Boost' },
    [DropType.SHIELD]: { icon: '🛡️', color: '#4169E1', name: 'Shield' },
    [DropType.SCORE_MULTIPLIER]: { icon: '💰', color: '#FFD700', name: '2x Score' },
    [DropType.MAGNET_MODE]: { icon: '🌟', color: '#FF69B4', name: 'Magnet' },
    [DropType.BERSERKER_MODE]: { icon: '🔥', color: '#FF0000', name: 'Berserker' },
    [DropType.GHOST_WALK]: { icon: '👻', color: '#9370DB', name: 'Ghost Walk' },
    [DropType.TIME_SLOW]: { icon: '⏰', color: '#00CED1', name: 'Time Slow' }
};