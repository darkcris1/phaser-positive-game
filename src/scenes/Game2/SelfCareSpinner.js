export class SelfCareSpinner extends Phaser.Scene {
    constructor() {
        super('SelfCareSpinner');
        this.isSpinning = false;
        this.spinnerWheel = null;
        this.currentTask = null;
        this.completedTasks = [];
        this.spinnerContainer = null; // Container to hold the entire spinner
    }

    create() {
        this.cameras.main.setBackgroundColor('#FCE4EC'); // Soft pink background

        // Title
        this.add.text(this.game.canvas.width / 2, 50, '🎯 Self-Care Spinner', {
            fontSize: '28px',
            fill: '#BE185D',
            fontFamily: 'sans-serif'
        }).setOrigin(0.5);

        // Instructions
        this.add.text(this.game.canvas.width / 2, 90, 'Spin the wheel to get your next self-care task!', {
            fontSize: '16px',
            fill: '#A21CAF',
            fontFamily: 'sans-serif'
        }).setOrigin(0.5);

        // Self-care tasks - updated with pink-related colors
        this.tasks = [
            { text: '💧 Drink Water', description: 'Take a few sips of water and hydrate yourself', color: '#FBCFE8' },
            { text: '🧘 Deep Breath', description: 'Take 3 deep breaths in and out slowly', color: '#F9A8D4' },
            { text: '🤸 Stretch', description: 'Do gentle neck and shoulder stretches', color: '#E91E63' },
            { text: '☀️ Sunlight', description: 'Step outside or sit by a window for 2 minutes', color: '#F472B6' },
            { text: '😊 Smile', description: 'Give yourself a genuine smile in the mirror', color: '#FB7185' },
            { text: '📱 Rest Eyes', description: 'Close your eyes for 30 seconds and relax', color: '#C084FC' },
            { text: '🎵 Music', description: 'Listen to one calming song', color: '#E879F9' },
            { text: '✋ Self-Hug', description: 'Give yourself a gentle, loving hug', color: '#F08080' }
        ];

        this.createSpinnerWheel();
        this.createSpinButton();
        this.createTaskDisplay();
        this.createVoiceCoaching();

        // Back button
        this.createBackButton();
    }

    createSpinnerWheel() {
        const centerX = this.game.canvas.width / 2;
        const centerY = 220;
        const radius = 80;

        // Create a container to group all parts of the wheel
        this.spinnerContainer = this.add.container(centerX, centerY);

        const anglePerSegment = (2 * Math.PI) / this.tasks.length;

        for (let i = 0; i < this.tasks.length; i++) {
            const startAngle = i * anglePerSegment - Math.PI / 2;
            const endAngle = (i + 1) * anglePerSegment - Math.PI / 2;

            // Draw segment
            const segment = this.add.graphics();
            segment.fillStyle(Phaser.Display.Color.HexStringToColor(this.tasks[i].color).color);
            segment.beginPath();
            segment.moveTo(0, 0); // relative to container position
            segment.arc(0, 0, radius, startAngle, endAngle);
            segment.closePath();
            segment.fillPath();
            segment.lineStyle(2, 0xFFFFFF);
            segment.strokePath();

            this.spinnerContainer.add(segment);

            // Add emoji inside each segment
            const textAngle = startAngle + anglePerSegment / 2;
            const textX = Math.cos(textAngle) * (radius * 0.7);
            const textY = Math.sin(textAngle) * (radius * 0.7);

            const emoji = this.add.text(textX, textY, this.tasks[i].text.split(' ')[0], {
                fontSize: '16px',
                fontFamily: 'sans-serif'
            }).setOrigin(0.5);

            this.spinnerContainer.add(emoji);
        }

        // Center circle
        const centerCircle = this.add.circle(0, 0, 15, 0xFFFFFF).setStrokeStyle(2, 0xBE185D);
        this.spinnerContainer.add(centerCircle);

        this.spinnerWheel = { centerX, centerY, radius, anglePerSegment };
    }

    createSpinButton() {
        this.spinButton = this.add.text(this.game.canvas.width / 2, 330, '🎲 SPIN!', {
            fontSize: '24px',
            fill: '#FFFFFF',
            fontFamily: 'sans-serif',
            backgroundColor: '#BE185D',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.spinButton.on('pointerdown', () => {
            if (!this.isSpinning) {
                this.spinWheel();
            }
        });

        // Hover effects
        this.spinButton.on('pointerover', () => {
            this.spinButton.setStyle({ backgroundColor: '#A21CAF' });
        });
        this.spinButton.on('pointerout', () => {
            this.spinButton.setStyle({ backgroundColor: '#BE185D' });
        });
    }

    spinWheel() {
        if (this.isSpinning) return;
        this.isSpinning = true;
        this.spinButton.setAlpha(0.5);
    
        const spins = 3 + Math.random() * 3; // 3-6 full rotations
        const finalSegment = Math.floor(Math.random() * this.tasks.length);
        const segmentsCount = this.tasks.length;
        const degreesPerSegment = 360 / segmentsCount;
    
        // We want to stop so that the center of the chosen segment is pointing up (under the fixed arrow)
        // In Phaser, rotating a container uses degrees where 0 is right-facing → increasing clockwise
        // So we rotate so that the center of the selected segment ends up at -90 degrees (top)
        const targetAngleDeg = 360 - ((finalSegment * degreesPerSegment) + degreesPerSegment / 2) - 90;
    
        const totalRotationDegrees = spins * 360 + targetAngleDeg;
    
        this.tweens.add({
            targets: this.spinnerContainer,
            angle: totalRotationDegrees,
            duration: 4000,
            ease: 'Cubic.easeOut',
            onComplete: () => {
                this.selectTask(finalSegment);
                this.isSpinning = false;
                this.spinButton.setAlpha(1);
            }
        });
    }

    selectTask(segmentIndex) {
        this.currentTask = this.tasks[segmentIndex];

        this.taskTitle.setText(this.currentTask.text);
        this.taskDescription.setText(this.currentTask.description);
        this.taskTitle.setStyle({ fill: this.currentTask.color });

        this.completeButton.setVisible(true);

        this.updateVoiceCoaching(`Great! Your task: ${this.currentTask.text}`);
    }

    createTaskDisplay() {
        this.add.rectangle(this.game.canvas.width / 2, 420, this.game.canvas.width - 40, 100, 0xFDF2F8)
            .setStrokeStyle(2, 0xBE185D);

        this.taskTitle = this.add.text(this.game.canvas.width / 2, 400, 'Spin to get your task!', {
            fontSize: '18px',
            fill: '#BE185D',
            fontFamily: 'sans-serif',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.taskDescription = this.add.text(this.game.canvas.width / 2, 430, 'Click the spin button above to begin your self-care journey', {
            fontSize: '14px',
            fill: '#A21CAF',
            fontFamily: 'sans-serif',
            wordWrap: { width: this.game.canvas.width - 60 },
            align: 'center'
        }).setOrigin(0.5);

        this.completeButton = this.add.text(this.game.canvas.width / 2, 490, '✅ I Did It!', {
            fontSize: '16px',
            fill: '#FFFFFF',
            fontFamily: 'sans-serif',
            backgroundColor: '#BE185D',
            padding: { x: 15, y: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setVisible(false);

        this.completeButton.on('pointerdown', () => {
            this.completeTask();
        });
    }

    completeTask() {
        if (this.currentTask) {
            this.completedTasks.push(this.currentTask);

            this.updateVoiceCoaching(`Wonderful! You completed: ${this.currentTask.text}. You're taking great care of yourself!`);

            this.taskTitle.setText('Ready for another task?');
            this.taskDescription.setText('Spin again to continue your self-care routine');
            this.completeButton.setVisible(false);
            this.currentTask = null;

            this.progressText.setText(`Completed: ${this.completedTasks.length} tasks`);
        }
    }

    createVoiceCoaching() {
        this.add.rectangle(this.game.canvas.width / 2, 540, this.game.canvas.width - 40, 60, 0xFDF2F8)
            .setStrokeStyle(1, 0xE91E63);

        this.coachingText = this.add.text(this.game.canvas.width / 2, 540, '🗣️ Welcome! Self-care is important. Take your time with each task.', {
            fontSize: '12px',
            fill: '#A21CAF',
            fontFamily: 'sans-serif',
            wordWrap: { width: this.game.canvas.width - 60 },
            align: 'center'
        }).setOrigin(0.5);

        this.progressText = this.add.text(this.game.canvas.width / 2, 590, 'Completed: 0 tasks', {
            fontSize: '12px',
            fill: '#BE185D',
            fontFamily: 'sans-serif'
        }).setOrigin(0.5);
    }

    updateVoiceCoaching(message) {
        this.coachingText.setText(`🗣️ ${message}`);

        this.time.delayedCall(4000, () => {
            this.coachingText.setText('🗣️ Take your time. Every small step counts toward your wellbeing.');
        });
    }

    createBackButton() {
        const backButton = this.add.text(50, this.game.canvas.height - 50, '← Back', {
            fontSize: '18px',
            fill: '#BE185D',
            fontFamily: 'sans-serif'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        backButton.on('pointerdown', () => {
            this.scene.start('Start');
        });
    }
}