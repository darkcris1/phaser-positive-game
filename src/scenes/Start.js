// "Every great game begins with a single scene. Let's make this one unforgettable!"
export class Start extends Phaser.Scene {
    constructor() {
        super('Start'); // Unique key for this scene
    }

    preload() {
        // Preload any assets specific to the menu if needed.
        // For now, we'll just use text.
    }

    create() {
        // Set pink background
        this.input.addPointer(2);

        this.cameras.main.setBackgroundColor('#FFC0CB');

        // Add the game title with white text
        this.add.text(this.game.canvas.width / 2, this.game.canvas.height / 4, '🌸 Positive Game 🌸', {
            fontSize: '32px',
            fill: '#FFFFFF',
            fontFamily: 'sans-serif',
            stroke: '#FF69B4',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Get gameType from query parameters
        const urlParams = new URLSearchParams(window.location.search);
        const gameType = parseInt(urlParams.get('gameType')) || 1;

        // Create buttons based on gameType
        if (gameType === 2) {
            // LEVEL 2: MODERATE STRESS (Balance & Grounding)
            this.add.text(this.game.canvas.width / 2, this.game.canvas.height / 3 - 30, 'Game 2', {
                fontSize: '20px',
                fill: '#FFFFFF',
                fontFamily: 'sans-serif',
                stroke: '#FF69B4',
                strokeThickness: 2
            }).setOrigin(0.5);

            this.createButton('🧩 Postpartum Puzzle', 20, '#FFFFFF', 'PostpartumPuzzle', '#FF69B4');
            this.createButton('📝 Guided Journaling', 90, '#FFFFFF', 'GuidedJournaling', '#DB7093');
            this.createButton('🎯 Self-Care Spinner', 160, '#FFFFFF', 'SelfCareSpinner', '#FFB6C1');
        } else if (gameType === 3) {
            // LEVEL 3: HIGH STRESS/ANXIETY (Calming & Restorative)
            this.add.text(this.game.canvas.width / 2, this.game.canvas.height / 3 - 30, 'Game 3', {
                fontSize: '20px',
                fill: '#FFFFFF',
                fontFamily: 'sans-serif',
                stroke: '#FF69B4',
                strokeThickness: 3
            }).setOrigin(0.5);

            this.createButton('🏡 Safe Guided Escape', 20, '#FFFFFF', 'SafeSpaceEscape', '#FF69B4');
            this.createButton('💗 Heartbeat Sync', 90, '#FFFFFF', 'HeartbeatSync', '#DB7093');
            this.createButton('🎨 Color Therapy Art Pad', 160, '#FFFFFF', 'ColorTherapyArt', '#FFB6C1');
        } else {
            // Default: Original buttons (gameType === 1 or default)
            this.createButton('🧠 Memory Game', 40, '#FFFFFF', 'MemoryGame', '#FF69B4');
            this.createButton('🌺 Mood Garden', 120, '#FFFFFF', 'MoodGarden', '#DB7093');
            this.createButton('🌬️ Breath Rhythm', 200, '#FFFFFF', 'BreathRhythmGame', '#FFB6C1');
        }
    }

    createButton(text, yOffset, textColor, sceneName, bgColor) {
        // Create button background
        const bg = this.add.rectangle(
            this.game.canvas.width / 2,
            this.game.canvas.height / 3 + yOffset,
            this.game.canvas.width * 0.8, // 80% of canvas width
            60,
            Phaser.Display.Color.HexStringToColor(bgColor).color
        ).setOrigin(0.5);

        const button = this.add.text(
            this.game.canvas.width / 2, 
            this.game.canvas.height / 3 + yOffset, 
            text, 
            {
                fontSize: Math.min(this.game.canvas.width * 0.06, 24) + 'px', // Responsive font size
                fill: textColor,
                fontFamily: 'sans-serif',
                stroke: bgColor,
                strokeThickness: 2
            }
        )
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

        // Add hover and click interactions
        button.on('pointerover', () => {
            bg.setFillStyle(Phaser.Display.Color.HexStringToColor('#FFFFFF').color);
            button.setStyle({ fill: bgColor, stroke: '#FFFFFF' });
        });
        button.on('pointerout', () => {
            bg.setFillStyle(Phaser.Display.Color.HexStringToColor(bgColor).color);
            button.setStyle({ fill: textColor, stroke: bgColor });
        });
        button.on('pointerdown', () => {
            button.setScale(0.9);
            this.scene.start(sceneName);
        });
        button.on('pointerup', () => button.setScale(1));

        return button;
    }
}

// --- Main Game Scene ---
// This scene contains all the core gameplay logic for the emoji memory game.
