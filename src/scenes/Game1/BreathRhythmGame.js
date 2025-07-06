export class BreathRhythmGame extends Phaser.Scene {
    constructor() {
        super('BreathRhythmGame');
        this.breathState = 'inhale'; // 'inhale' or 'exhale'
        this.breathTimer = 0;
        this.breathDuration = 3000; // ms for inhale/exhale
        this.isBreathing = false;
        this.tapFeedback = null;
    }

    preload() {}

    create() {
        const width = this.game.canvas.width;
        const height = this.game.canvas.height;
        this.cameras.main.setBackgroundColor('#ffe0f0'); // Soft pink

        // Title
        this.add.text(width/2, 40, 'Breath Rhythm Game 💗', {
            fontSize: '26px',
            fill: '#e75480',
            fontFamily: 'sans-serif',
            stroke: '#fff',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Instructions
        this.add.text(width/2, 80, 'Tap the circle to sync with the rhythm!\nFollow the emoji cues.', {
            fontSize: '16px',
            fill: '#e75480',
            fontFamily: 'sans-serif',
            align: 'center'
        }).setOrigin(0.5).setWordWrapWidth(width-40);

        // Breathing circle
        this.breathCircle = this.add.circle(width/2, height/2, 80, 0xffb6d5, 1)
            .setStrokeStyle(6, 0xe75480)
            .setInteractive({ useHandCursor: true });

        // Emoji cues
        this.emojiCue = this.add.text(width/2, height/2, '😮‍💨', {
            fontSize: '60px',
            align: 'center'
        }).setOrigin(0.5);

        // Tap feedback
        this.tapFeedback = this.add.text(width/2, height/2 + 120, '', {
            fontSize: '22px',
            fill: '#e75480',
            fontFamily: 'sans-serif',
            align: 'center'
        }).setOrigin(0.5);

        // Tap to sync
        this.breathCircle.on('pointerdown', () => {
            if (!this.isBreathing) {
                this.startBreathing();
            } else {
                this.handleTap();
            }
        });

        // Back button
        this.backButton = this.add.text(width/2, height - 40, 'Back to Menu', {
            fontSize: '18px',
            fill: '#fff',
            fontFamily: 'sans-serif',
            stroke: '#e75480',
            strokeThickness: 2,
            backgroundColor: '#e75480',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        this.backButton.on('pointerdown', () => {
            this.scene.start('Start');
        });
    }

    startBreathing() {
        this.isBreathing = true;
        this.breathState = 'inhale';
        this.breathTimer = 0;
        this.emojiCue.setText('😮‍💨'); // Inhale emoji
        this.breathCircle.setFillStyle(0xffb6d5, 1);
        this.breathTween = this.tweens.add({
            targets: this.breathCircle,
            radius: 120,
            duration: this.breathDuration,
            yoyo: true,
            repeat: -1,
            onYoyo: () => this.toggleBreathState(),
            onRepeat: () => this.toggleBreathState()
        });
    }

    toggleBreathState() {
        if (this.breathState === 'inhale') {
            this.breathState = 'exhale';
            this.emojiCue.setText('🌬️'); // Exhale emoji
            this.breathCircle.setFillStyle(0xf8bbd0, 1); // Lighter pink
        } else {
            this.breathState = 'inhale';
            this.emojiCue.setText('😮‍💨'); // Inhale emoji
            this.breathCircle.setFillStyle(0xffb6d5, 1);
        }
    }

    handleTap() {
        // Give feedback if tap is in sync (within 500ms of state change)
        const now = this.time.now;
        const phase = (now % (this.breathDuration * 2)) / (this.breathDuration * 2);
        let feedback = '';
        if ((this.breathState === 'inhale' && phase < 0.25) || (this.breathState === 'exhale' && phase > 0.75)) {
            feedback = 'Perfect! 💖';
        } else {
            feedback = 'Try to sync! 💡';
        }
        this.tapFeedback.setText(feedback);
        this.time.delayedCall(800, () => this.tapFeedback.setText(''));
    }

    update() {}
}