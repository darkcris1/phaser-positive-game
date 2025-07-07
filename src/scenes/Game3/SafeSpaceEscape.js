export class SafeSpaceEscape extends Phaser.Scene {
    constructor() {
        super('SafeSpaceEscape');
        this.currentStoryIndex = 0;
        this.storyProgress = 0;
        this.choicesMade = [];
        this.breathingState = 'neutral';
    }

    create() {
        this.cameras.main.setBackgroundColor('#FCE4EC'); // Soft pink background

        // Title
        this.add.text(this.game.canvas.width / 2, 50, '🏡 Safe Space Escape', {
            fontSize: '28px',
            fill: '#BE185D',
            fontFamily: 'sans-serif'
        }).setOrigin(0.5);

        // Story scenarios
        this.stories = [
            {
                title: "The Peaceful Garden",
                description: "You find yourself in a beautiful garden filled with blooming flowers and gentle butterflies.",
                choices: [
                    { text: "🌸 Sit by the fountain", next: 1, feeling: "peaceful" },
                    { text: "🦋 Follow the butterflies", next: 2, feeling: "curious" }
                ]
            },
            {
                title: "The Gentle Fountain",
                description: "The sound of flowing water soothes your mind. You feel your breathing slow and deepen.",
                choices: [
                    { text: "🧘 Practice mindful breathing", next: 3, feeling: "centered" },
                    { text: "🌿 Explore the herb garden", next: 4, feeling: "grounded" }
                ]
            },
            {
                title: "Dancing Butterflies",
                description: "Colorful butterflies dance around you, their gentle movements calming your heart.",
                choices: [
                    { text: "✨ Watch them peacefully", next: 5, feeling: "wonder" },
                    { text: "🌺 Follow them to flowers", next: 6, feeling: "joy" }
                ]
            },
            {
                title: "Mindful Moment",
                description: "You take deep, slow breaths. With each exhale, tension melts away from your body.",
                choices: [
                    { text: "💚 Continue breathing", next: 7, feeling: "relaxed" },
                    { text: "🌸 Return to the garden", next: 0, feeling: "renewed" }
                ]
            },
            {
                title: "Herb Garden Sanctuary",
                description: "Lavender and chamomile surround you with their calming scents.",
                choices: [
                    { text: "🌿 Breathe in the aromas", next: 7, feeling: "soothed" },
                    { text: "🦋 Return to the butterflies", next: 2, feeling: "content" }
                ]
            },
            {
                title: "Moment of Wonder",
                description: "Time seems to slow as you watch the beautiful dance of nature around you.",
                choices: [
                    { text: "💖 Feel gratitude", next: 7, feeling: "grateful" },
                    { text: "🌸 Explore more", next: 0, feeling: "curious" }
                ]
            },
            {
                title: "Flower Paradise",
                description: "You're surrounded by the most beautiful flowers you've ever seen.",
                choices: [
                    { text: "🌺 Rest among the flowers", next: 7, feeling: "peaceful" },
                    { text: "🧘 Meditate here", next: 3, feeling: "centered" }
                ]
            },
            {
                title: "Complete Calm",
                description: "You feel completely at peace. Your safe space has given you exactly what you needed.",
                choices: [
                    { text: "💝 Stay a little longer", next: 7, feeling: "blissful" },
                    { text: "🌸 Start a new journey", next: 0, feeling: "refreshed" }
                ]
            }
        ];

        this.createStoryInterface();
        this.createCalmnessIndicator();
        this.createBackButton();
    }

    createStoryInterface() {
        // Story area background
        this.add.rectangle(this.game.canvas.width / 2, 200, this.game.canvas.width - 40, 120, 0xFCE4EC)
            .setStrokeStyle(2, 0xE91E63);

        // Story title
        this.storyTitle = this.add.text(this.game.canvas.width / 2, 160, '', {
            fontSize: '20px',
            fill: '#BE185D',
            fontFamily: 'sans-serif',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Story description
        this.storyText = this.add.text(this.game.canvas.width / 2, 200, '', {
            fontSize: '16px',
            fill: '#4A044E',
            fontFamily: 'sans-serif',
            wordWrap: { width: this.game.canvas.width - 80 },
            align: 'center'
        }).setOrigin(0.5);

        // Choice buttons container
        this.choicesContainer = this.add.container(this.game.canvas.width / 2, 320);

        this.updateStoryDisplay();
    }

    updateStoryDisplay() {
        const currentStory = this.stories[this.currentStoryIndex];
        
        this.storyTitle.setText(currentStory.title);
        this.storyText.setText(currentStory.description);

        // Clear existing choice buttons
        this.choicesContainer.removeAll(true);

        // Create new choice buttons
        currentStory.choices.forEach((choice, index) => {
            const yPos = index * 60 - 30;
            
            const choiceButton = this.add.text(0, yPos, choice.text, {
                fontSize: '18px',
                fill: '#FFFFFF',
                fontFamily: 'sans-serif',
                backgroundColor: '#BE185D',
                padding: { x: 20, y: 12 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });

            choiceButton.on('pointerdown', () => {
                this.makeChoice(choice);
            });

            choiceButton.on('pointerover', () => {
                choiceButton.setStyle({ backgroundColor: '#A21CAF' });
            });

            choiceButton.on('pointerout', () => {
                choiceButton.setStyle({ backgroundColor: '#BE185D' });
            });

            this.choicesContainer.add(choiceButton);
        });
    }

    makeChoice(choice) {
        this.choicesMade.push({
            story: this.currentStoryIndex,
            choice: choice.text,
            feeling: choice.feeling
        });

        this.currentStoryIndex = choice.next;
        this.storyProgress++;

        // Update calmness based on choice
        this.updateCalmness(choice.feeling);

        // Add gentle transition
        this.tweens.add({
            targets: [this.storyTitle, this.storyText, this.choicesContainer],
            alpha: 0,
            duration: 300,
            onComplete: () => {
                this.updateStoryDisplay();
                this.tweens.add({
                    targets: [this.storyTitle, this.storyText, this.choicesContainer],
                    alpha: 1,
                    duration: 300
                });
            }
        });

        this.updateJourneyProgress();
    }

    createCalmnessIndicator() {
        this.add.text(this.game.canvas.width / 2, 450, 'Your Peaceful Journey', {
            fontSize: '16px',
            fill: '#BE185D',
            fontFamily: 'sans-serif'
        }).setOrigin(0.5);

        // Calmness hearts
        this.calmnessHearts = [];
        for (let i = 0; i < 5; i++) {
            const heart = this.add.text(
                this.game.canvas.width / 2 - 80 + (i * 40), 
                480, 
                '🤍', 
                { fontSize: '24px' }
            ).setOrigin(0.5);
            this.calmnessHearts.push(heart);
        }

        this.progressText = this.add.text(this.game.canvas.width / 2, 520, 'Steps taken: 0', {
            fontSize: '14px',
            fill: '#A21CAF',
            fontFamily: 'sans-serif'
        }).setOrigin(0.5);
    }

    updateCalmness(feeling) {
        const calmnessMap = {
            'peaceful': 3,
            'curious': 2,
            'centered': 4,
            'grounded': 4,
            'wonder': 3,
            'joy': 4,
            'relaxed': 5,
            'renewed': 5,
            'soothed': 4,
            'content': 3,
            'grateful': 5,
            'blissful': 5,
            'refreshed': 4
        };

        const calmnessLevel = calmnessMap[feeling] || 3;

        // Update heart display
        this.calmnessHearts.forEach((heart, index) => {
            if (index < calmnessLevel) {
                heart.setText('💖');
                this.tweens.add({
                    targets: heart,
                    scale: 1.2,
                    duration: 200,
                    yoyo: true
                });
            } else {
                heart.setText('🤍');
            }
        });

        // Show feeling feedback
        this.showFeeling(feeling);
    }

    updateJourneyProgress() {
        this.progressText.setText(`Steps taken: ${this.storyProgress}`);
    }

    showFeeling(feeling) {
        const feelingMessages = {
            'peaceful': 'You feel a wave of peace wash over you 🕊️',
            'curious': 'Your curiosity brings lightness to your heart 🌟',
            'centered': 'You feel perfectly balanced and centered 🧘',
            'grounded': 'A sense of stability fills you 🌿',
            'wonder': 'Wonder and awe fill your being ✨',
            'joy': 'Pure joy bubbles up from within 😊',
            'relaxed': 'Deep relaxation flows through you 🌸',
            'renewed': 'You feel completely renewed 🌱',
            'soothed': 'Gentle comfort surrounds you 💚',
            'content': 'A peaceful contentment settles in 😌',
            'grateful': 'Gratitude fills your heart to overflowing 🙏',
            'blissful': 'Pure bliss radiates through you ✨',
            'refreshed': 'You feel wonderfully refreshed 🌺'
        };

        if (this.feelingText) {
            this.feelingText.destroy();
        }

        this.feelingText = this.add.text(this.game.canvas.width / 2, 560, feelingMessages[feeling], {
            fontSize: '14px',
            fill: '#7E22CE',
            fontFamily: 'sans-serif',
            align: 'center',
            wordWrap: { width: this.game.canvas.width - 60 }
        }).setOrigin(0.5);

        this.time.delayedCall(3000, () => {
            if (this.feelingText) {
                this.tweens.add({
                    targets: this.feelingText,
                    alpha: 0,
                    duration: 500,
                    onComplete: () => {
                        if (this.feelingText) {
                            this.feelingText.destroy();
                            this.feelingText = null;
                        }
                    }
                });
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
            this.scene.start('Start');
        });
    }
}