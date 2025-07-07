export class HeartbeatSync extends Phaser.Scene {
    constructor() {
        super('HeartbeatSync');
        this.heartbeatBPM = 60; // Start at 60 BPM (calm)
        this.targetBPM = 60;
        this.currentBeat = 0;
        this.isPlaying = false;
        this.syncScore = 0;
        this.perfectTaps = 0;
        this.totalTaps = 0;
        this.heartbeatTimer = null;
    }

    create() {
        this.cameras.main.setBackgroundColor('#FCE4EC'); // Soft pink background

        // Title
        this.add.text(this.game.canvas.width / 2, 50, '💗 Heartbeat Sync', {
            fontSize: '28px',
            fill: '#BE185D',
            fontFamily: 'sans-serif'
        }).setOrigin(0.5);

        // Instructions
        this.add.text(this.game.canvas.width / 2, 90, 'Tap along with the gentle heartbeat rhythm to find your calm', {
            fontSize: '16px',
            fill: '#A21CAF',
            fontFamily: 'sans-serif',
            align: 'center',
            wordWrap: { width: this.game.canvas.width - 60 }
        }).setOrigin(0.5);

        this.createHeartDisplay();
        this.createBPMControls();
        this.createSyncIndicator();
        this.createStatsDisplay();
        this.createBackButton();

        // Start with gentle heartbeat
        this.startHeartbeat();
    }

    createHeartDisplay() {
        // Main heart container
        this.heartContainer = this.add.container(this.game.canvas.width / 2, 250);

        // Heart background circle
        this.heartBg = this.add.circle(0, 0, 80, 0xFBCFE8, 0.8)
            .setStrokeStyle(4, 0xBE185D);

        // Main heart emoji
        this.heartEmoji = this.add.text(0, 0, '💗', {
            fontSize: '80px'
        }).setOrigin(0.5);

        // Pulse rings
        this.pulseRings = [];
        for (let i = 0; i < 3; i++) {
            const ring = this.add.circle(0, 0, 90 + (i * 20), 0xF472B6, 0.1)
                .setStrokeStyle(2, 0xF472B6, 0.3);
            this.pulseRings.push(ring);
            this.heartContainer.add(ring);
        }

        this.heartContainer.add([this.heartBg, this.heartEmoji]);

        // Make heart interactive
        this.heartBg.setInteractive({ useHandCursor: true });
        this.heartBg.on('pointerdown', () => {
            this.handleHeartTap();
        });

        // Beat indicator
        this.beatIndicator = this.add.text(this.game.canvas.width / 2, 350, '♪', {
            fontSize: '24px',
            fill: '#BE185D',
            fontFamily: 'sans-serif'
        }).setOrigin(0.5).setAlpha(0);
    }

    createBPMControls() {
        this.add.text(this.game.canvas.width / 2, 400, 'Choose Your Rhythm', {
            fontSize: '18px',
            fill: '#BE185D',
            fontFamily: 'sans-serif',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // BPM selection buttons
        const bpmOptions = [
            { bpm: 50, label: '🌙 Very Calm (50 BPM)', color: '#C084FC' },
            { bpm: 60, label: '🕊️ Peaceful (60 BPM)', color: '#BE185D' },
            { bpm: 70, label: '🌸 Gentle (70 BPM)', color: '#E91E63' },
            { bpm: 80, label: '🌿 Active Calm (80 BPM)', color: '#F472B6' }
        ];

        this.bpmButtons = [];
        bpmOptions.forEach((option, index) => {
            const button = this.add.text(
                this.game.canvas.width / 2, 
                430 + (index * 35), 
                option.label, 
                {
                    fontSize: '14px',
                    fill: '#FFFFFF',
                    fontFamily: 'sans-serif',
                    backgroundColor: option.color,
                    padding: { x: 15, y: 6 }
                }
            ).setOrigin(0.5).setInteractive({ useHandCursor: true });

            button.on('pointerdown', () => {
                this.changeBPM(option.bpm);
                this.updateBPMButtonStyles(button);
            });

            button.on('pointerover', () => {
                button.setStyle({ backgroundColor: '#FFFFFF', fill: option.color });
            });

            button.on('pointerout', () => {
                if (this.targetBPM !== option.bpm) {
                    button.setStyle({ backgroundColor: option.color, fill: '#FFFFFF' });
                }
            });

            this.bpmButtons.push({ button, bpm: option.bpm, color: option.color });
        });

        // Set initial button state
        this.updateBPMButtonStyles(this.bpmButtons[1].button); // 60 BPM is default
    }

    createSyncIndicator() {
        this.add.text(this.game.canvas.width / 2, 580, 'Sync Quality', {
            fontSize: '16px',
            fill: '#BE185D',
            fontFamily: 'sans-serif'
        }).setOrigin(0.5);

        // Sync hearts
        this.syncHearts = [];
        for (let i = 0; i < 5; i++) {
            const heart = this.add.text(
                this.game.canvas.width / 2 - 80 + (i * 40), 
                610, 
                '🤍', 
                { fontSize: '20px' }
            ).setOrigin(0.5);
            this.syncHearts.push(heart);
        }
    }

    createStatsDisplay() {
        this.bpmDisplay = this.add.text(this.game.canvas.width - 20, 120, 'BPM: 60', {
            fontSize: '16px',
            fill: '#BE185D',
            fontFamily: 'sans-serif'
        }).setOrigin(1, 0);

        this.accuracyDisplay = this.add.text(this.game.canvas.width - 20, 145, 'Accuracy: --', {
            fontSize: '14px',
            fill: '#A21CAF',
            fontFamily: 'sans-serif'
        }).setOrigin(1, 0);

        this.sessionDisplay = this.add.text(20, 120, 'Taps: 0', {
            fontSize: '14px',
            fill: '#A21CAF',
            fontFamily: 'sans-serif'
        });
    }

    changeBPM(newBPM) {
        this.targetBPM = newBPM;
        this.heartbeatBPM = newBPM;
        this.bpmDisplay.setText(`BPM: ${newBPM}`);
        
        // Restart heartbeat with new timing
        if (this.isPlaying) {
            this.stopHeartbeat();
            this.startHeartbeat();
        }
    }

    updateBPMButtonStyles(activeButton) {
        this.bpmButtons.forEach(({ button, bpm, color }) => {
            if (button === activeButton) {
                button.setStyle({ backgroundColor: '#FFFFFF', fill: color });
            } else {
                button.setStyle({ backgroundColor: color, fill: '#FFFFFF' });
            }
        });
    }

    startHeartbeat() {
        if (this.isPlaying) return;
        
        this.isPlaying = true;
        const interval = (60 / this.heartbeatBPM) * 1000; // Convert BPM to milliseconds
        
        this.heartbeatTimer = this.time.addEvent({
            delay: interval,
            callback: this.doBeat,
            callbackScope: this,
            loop: true
        });
    }

    stopHeartbeat() {
        this.isPlaying = false;
        if (this.heartbeatTimer) {
            this.heartbeatTimer.destroy();
            this.heartbeatTimer = null;
        }
    }

    doBeat() {
        this.currentBeat++;
        
        // Heart pulse animation
        this.tweens.add({
            targets: this.heartEmoji,
            scale: { from: 1, to: 1.2 },
            duration: 150,
            yoyo: true,
            ease: 'Power2'
        });

        // Background pulse
        this.tweens.add({
            targets: this.heartBg,
            scale: { from: 1, to: 1.1 },
            duration: 200,
            yoyo: true,
            ease: 'Power1'
        });

        // Pulse rings
        this.pulseRings.forEach((ring, index) => {
            this.tweens.add({
                targets: ring,
                scale: { from: 1, to: 1.5 },
                alpha: { from: 0.3, to: 0 },
                duration: 800,
                delay: index * 100,
                ease: 'Power2'
            });
        });

        // Beat indicator
        this.tweens.add({
            targets: this.beatIndicator,
            alpha: { from: 0, to: 1 },
            scale: { from: 0.5, to: 1 },
            duration: 100,
            onComplete: () => {
                this.tweens.add({
                    targets: this.beatIndicator,
                    alpha: 0,
                    duration: 300
                });
            }
        });
    }

    handleHeartTap() {
        this.totalTaps++;
        
        // Calculate timing accuracy
        const beatInterval = (60 / this.heartbeatBPM) * 1000;
        const timeSinceLastBeat = this.heartbeatTimer ? 
            (this.time.now % beatInterval) : 0;
        
        const accuracy = Math.max(0, 1 - (Math.abs(timeSinceLastBeat - beatInterval/2) / (beatInterval/2)));
        
        if (accuracy > 0.7) {
            this.perfectTaps++;
            this.syncScore += Math.floor(accuracy * 100);
            this.showTapFeedback('Perfect! 💖', '#4ADE80');
        } else if (accuracy > 0.4) {
            this.syncScore += Math.floor(accuracy * 50);
            this.showTapFeedback('Good sync! 💗', '#F59E0B');
        } else {
            this.showTapFeedback('Keep trying! 💙', '#6B7280');
        }

        this.updateSyncDisplay();
        this.updateStats();

        // Tap animation
        this.tweens.add({
            targets: this.heartEmoji,
            scale: { from: 1, to: 0.9 },
            duration: 100,
            yoyo: true
        });
    }

    updateSyncDisplay() {
        const syncLevel = this.totalTaps > 0 ? 
            Math.floor((this.perfectTaps / this.totalTaps) * 5) : 0;

        this.syncHearts.forEach((heart, index) => {
            if (index < syncLevel) {
                heart.setText('💖');
            } else {
                heart.setText('🤍');
            }
        });
    }

    updateStats() {
        this.sessionDisplay.setText(`Taps: ${this.totalTaps}`);
        
        if (this.totalTaps > 0) {
            const accuracy = Math.round((this.perfectTaps / this.totalTaps) * 100);
            this.accuracyDisplay.setText(`Accuracy: ${accuracy}%`);
        }
    }

    showTapFeedback(message, color) {
        if (this.tapFeedback) {
            this.tapFeedback.destroy();
        }

        this.tapFeedback = this.add.text(this.game.canvas.width / 2, 190, message, {
            fontSize: '18px',
            fill: color,
            fontFamily: 'sans-serif',
            stroke: '#FFFFFF',
            strokeThickness: 2
        }).setOrigin(0.5);

        this.tweens.add({
            targets: this.tapFeedback,
            y: 170,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                if (this.tapFeedback) {
                    this.tapFeedback.destroy();
                    this.tapFeedback = null;
                }
            }
        });
    }

    createBackButton() {
        const backButton = this.add.text(50, this.game.canvas.height - 50, '← Back', {
            fontSize: '18px',
            fill: '#BE185D',
            fontFamily: 'sans-serif'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        backButton.on('pointerdown', () => {
            this.stopHeartbeat();
            this.scene.start('Start');
        });
    }

    update() {
        // Continuous gentle background changes based on sync quality
        if (this.totalTaps > 0) {
            const syncQuality = this.perfectTaps / this.totalTaps;
            const bgAlpha = 0.1 + (syncQuality * 0.2);
            this.cameras.main.setBackgroundColor(
                Phaser.Display.Color.Interpolate.ColorWithColor(
                    { r: 252, g: 228, b: 236 },
                    { r: 236, g: 72, b: 153 },
                    1000,
                    Math.floor(syncQuality * 100)
                )
            );
        }
    }
}