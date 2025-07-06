export class GuidedJournaling extends Phaser.Scene {
    constructor() {
        super('GuidedJournaling');
        this.currentPromptIndex = 0;
        this.responses = [];
        this.musicPlaying = false;
    }

    create() {
        this.cameras.main.setBackgroundColor('#FCE4EC'); // Soft pink background

        // Title
        this.add.text(this.game.canvas.width / 2, 50, '📝 Guided Journaling', {
            fontSize: '28px',
            fill: '#BE185D', // Deep pink
            fontFamily: 'sans-serif'
        }).setOrigin(0.5);

        // Calming music toggle
        this.createMusicToggle();

        // Journal prompts
        this.prompts = [
            "What are three things you're grateful for today?",
            "How are you feeling right now? It's okay to be honest.",
            "What's one small act of self-care you can do today?",
            "What would you tell a friend going through what you're experiencing?",
            "What strength have you discovered in yourself recently?",
            "What does taking care of yourself look like today?"
        ];

        this.createJournalInterface();
        
        // Back button
        this.createBackButton();
    }

    createMusicToggle() {
        const musicButton = this.add.text(this.game.canvas.width - 80, 30, '🎵 Music', {
            fontSize: '16px',
            fill: '#BE185D',
            fontFamily: 'sans-serif',
            backgroundColor: '#FBCFE8', // Light pink
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        musicButton.on('pointerdown', () => {
            this.musicPlaying = !this.musicPlaying;
            musicButton.setText(this.musicPlaying ? '🎵 Playing' : '🎵 Music');
            musicButton.setStyle({ 
                backgroundColor: this.musicPlaying ? '#BE185D' : '#FBCFE8', 
                fill: this.musicPlaying ? '#FFFFFF' : '#BE185D' 
            });
        });
    }

    createJournalInterface() {
        // Current prompt display
        this.promptText = this.add.text(this.game.canvas.width / 2, 120, this.prompts[this.currentPromptIndex], {
            fontSize: '18px',
            fill: '#4A044E', // Dark purple-pink
            fontFamily: 'sans-serif',
            wordWrap: { width: this.game.canvas.width - 60 },
            align: 'center'
        }).setOrigin(0.5);

        // Response area background
        this.add.rectangle(this.game.canvas.width / 2, 250, this.game.canvas.width - 40, 150, 0xFCE4EC)
            .setStrokeStyle(2, 0xE91E63); // Medium pink

        // Response text placeholder
        this.responseArea = this.add.text(this.game.canvas.width / 2, 200, 'Click here to reflect and type your thoughts...', {
            fontSize: '14px',
            fill: '#A21CAF', // Muted pink
            fontFamily: 'sans-serif',
            wordWrap: { width: this.game.canvas.width - 80 },
            align: 'left'
        }).setOrigin(0.5, 0).setInteractive({ useHandCursor: true });

        this.currentResponse = '';
        
        // Simulate typing area click
        this.responseArea.on('pointerdown', () => {
            this.startTyping();
        });

        // Navigation buttons
        this.createNavigationButtons();

        // Progress indicator
        this.updateProgressIndicator();
    }

    startTyping() {
        // Simulate text input (in a real implementation, you'd use HTML input)
        const responses = [
            "I'm grateful for my family's support, a warm cup of tea, and the quiet moments of peace.",
            "I'm feeling overwhelmed but trying to be gentle with myself.",
            "I can take a short walk outside or listen to calming music.",
            "I'd remind them that healing takes time and they're doing their best.",
            "I've learned I'm more resilient than I thought.",
            "Taking care of myself means asking for help when I need it."
        ];

        this.currentResponse = responses[this.currentPromptIndex] || "Thank you for this moment of reflection.";
        
        this.responseArea.setText(this.currentResponse);
        this.responseArea.setStyle({ fill: '#4A044E' });
        
        this.responses[this.currentPromptIndex] = this.currentResponse;
    }

    createNavigationButtons() {
        // Previous button
        this.prevButton = this.add.text(100, 350, '← Previous', {
            fontSize: '16px',
            fill: this.currentPromptIndex > 0 ? '#BE185D' : '#D1A0B4',
            fontFamily: 'sans-serif'
        }).setOrigin(0.5).setInteractive({ useHandCursor: this.currentPromptIndex > 0 });

        if (this.currentPromptIndex > 0) {
            this.prevButton.on('pointerdown', () => this.previousPrompt());
        }

        // Next button
        this.nextButton = this.add.text(this.game.canvas.width - 100, 350, 'Next →', {
            fontSize: '16px',
            fill: '#BE185D',
            fontFamily: 'sans-serif'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.nextButton.on('pointerdown', () => this.nextPrompt());

        // Finish button (shown on last prompt)
        if (this.currentPromptIndex === this.prompts.length - 1) {
            this.finishButton = this.add.text(this.game.canvas.width / 2, 400, '✨ Complete Session', {
                fontSize: '18px',
                fill: '#FFFFFF',
                fontFamily: 'sans-serif',
                backgroundColor: '#C084FC', // Violet-pink
                padding: { x: 20, y: 10 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });

            this.finishButton.on('pointerdown', () => this.completeSession());
        }
    }

    previousPrompt() {
        if (this.currentPromptIndex > 0) {
            this.currentPromptIndex--;
            this.updatePromptDisplay();
        }
    }

    nextPrompt() {
        if (this.currentPromptIndex < this.prompts.length - 1) {
            this.currentPromptIndex++;
            this.updatePromptDisplay();
        }
    }

    updatePromptDisplay() {
        // Clear existing UI elements
        if (this.prevButton) this.prevButton.destroy();
        if (this.nextButton) this.nextButton.destroy();
        if (this.finishButton) this.finishButton.destroy();
        if (this.progressText) this.progressText.destroy();

        // Update prompt text
        this.promptText.setText(this.prompts[this.currentPromptIndex]);

        // Update response area
        const savedResponse = this.responses[this.currentPromptIndex] || '';
        if (savedResponse) {
            this.responseArea.setText(savedResponse);
            this.responseArea.setStyle({ fill: '#4A044E' });
        } else {
            this.responseArea.setText('Click here to reflect and type your thoughts...');
            this.responseArea.setStyle({ fill: '#A21CAF' });
        }

        // Recreate navigation
        this.createNavigationButtons();
        this.updateProgressIndicator();
    }

    updateProgressIndicator() {
        this.progressText = this.add.text(this.game.canvas.width / 2, 90, `Prompt ${this.currentPromptIndex + 1} of ${this.prompts.length}`, {
            fontSize: '12px',
            fill: '#A21CAF',
            fontFamily: 'sans-serif'
        }).setOrigin(0.5);
    }

    completeSession() {
        // Show completion message
        this.add.rectangle(this.game.canvas.width / 2, this.game.canvas.height / 2, this.game.canvas.width - 40, 200, 0xF9E6FF)
            .setStrokeStyle(2, 0xC084FC);

        this.add.text(this.game.canvas.width / 2, this.game.canvas.height / 2 - 30, '🌟 Journaling Complete!', {
            fontSize: '22px',
            fill: '#BE185D',
            fontFamily: 'sans-serif'
        }).setOrigin(0.5);

        this.add.text(this.game.canvas.width / 2, this.game.canvas.height / 2 + 10, 'Thank you for taking time to reflect.\nYour thoughts and feelings are valid.', {
            fontSize: '16px',
            fill: '#7E22CE',
            fontFamily: 'sans-serif',
            align: 'center'
        }).setOrigin(0.5);

        const doneButton = this.add.text(this.game.canvas.width / 2, this.game.canvas.height / 2 + 60, 'Return to Menu', {
            fontSize: '16px',
            fill: '#FFFFFF',
            fontFamily: 'sans-serif',
            backgroundColor: '#BE185D',
            padding: { x: 15, y: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        doneButton.on('pointerdown', () => {
            this.scene.start('Start');
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