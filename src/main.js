import { Start } from './scenes/Start.js';
import { MemoryGame } from './scenes/MemoryGame.js';
import { MoodGarden } from './scenes/MoodGarden.js';
import { BreathRhythmGame } from './scenes/BreathRhythmGame.js';

const config = {
    type: Phaser.AUTO,
    title: 'Positive Mobile Game',
    description: 'A mobile-optimized positive mental health game',
    parent: 'game-container',
    width: '100%',
    height: '100%',
    backgroundColor: '#FFC0CB',
    fontFamily: 'sans-serif',
    pixelArt: false,
    scene: [
        Start,
        MemoryGame,
        MoodGarden,
        BreathRhythmGame
    ],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: '100%',
        height: '100%',
        min: {
            width: 320,
            height: 480
        },
        max: {
            width: 1440,
            height: 2960
        }
    },
    input: {
        activePointers: 3
    },
    render: {
        antialias: true,
        pixelArt: false,
        roundPixels: false
    }
};

new Phaser.Game(config);
