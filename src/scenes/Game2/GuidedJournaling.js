export class GuidedJournaling extends Phaser.Scene {
    constructor() {
        super('GuidedJournaling');
        this.currentPromptIndex = 0;
        this.responses = [];
        this.musicPlaying = false;
        this.relaxingMusic = null;
        this.textarea = null;
    }

    preload() {
        this.load.audio('relaxingMusic', 'assets/musics/relaxing.mp3');
    }

    create() {
        this.cameras.main.setBackgroundColor('#FCE4EC'); // Soft pink background

        // Initialize music
        this.relaxingMusic = this.sound.add('relaxingMusic', { loop: true, volume: 0.5 });

        // Load saved responses from localStorage
        this.loadSavedResponses();

        // Title
        this.add.text(this.game.canvas.width / 2, 70, '📝 Guided Journaling', {
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

    loadSavedResponses() {
        const saved = localStorage.getItem('guidedJournalingResponses');
        if (saved) {
            try {
                this.responses = JSON.parse(saved);
            } catch (e) {
                this.responses = [];
            }
        }
    }

    saveResponseToStorage() {
        localStorage.setItem('guidedJournalingResponses', JSON.stringify(this.responses));
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
            
            if (this.musicPlaying) {
                if (!this.relaxingMusic.isPlaying) {
                    this.relaxingMusic.play();
                }
            } else {
                this.relaxingMusic.stop();
            }
        });
    }

    createJournalInterface() {
        // Current prompt display
        this.promptText = this.add.text(this.game.canvas.width / 2, 140, this.prompts[this.currentPromptIndex], {
            fontSize: '18px',
            fill: '#4A044E', // Dark purple-pink
            fontFamily: 'sans-serif',
            wordWrap: { width: this.game.canvas.width - 60 },
            align: 'center'
        }).setOrigin(0.5);

        const textareaHeight = Math.min(350, this.game.canvas.height * 0.4);

        // Response area background
        this.add.rectangle(this.game.canvas.width / 2, textareaHeight + 30, this.game.canvas.width - 40, textareaHeight + 40, 0xFCE4EC)
            .setStrokeStyle(2, 0xE91E63); // Medium pink

        // Create HTML textarea for real text input
        this.createTextarea();

        // Navigation buttons
        this.createNavigationButtons();

        // Progress indicator
        this.updateProgressIndicator();
    }

    createTextarea() {
        // Remove existing textarea if it exists
        if (this.textarea) {
            this.textarea.remove();
        }

        const textareaHeight = Math.min(350, this.game.canvas.height * 0.4);

        // Create HTML textarea element
        this.textarea = document.createElement('textarea');
        this.textarea.style.position = 'absolute';
        this.textarea.style.left = '30px';
        this.textarea.style.top = '190px';
        this.textarea.style.width = `${this.game.canvas.width - 60}px`;
        this.textarea.style.height = `${textareaHeight}px`;
        this.textarea.style.fontSize = '14px';
        this.textarea.style.fontFamily = 'sans-serif';
        this.textarea.style.padding = '10px';
        this.textarea.style.border = 'none';
        this.textarea.style.borderRadius = '5px';
        this.textarea.style.backgroundColor = '#FCE4EC';
        this.textarea.style.color = '#4A044E';
        this.textarea.style.resize = 'none';
        this.textarea.style.outline = 'none';
        this.textarea.placeholder = 'Click here to reflect and type your thoughts...';

        // Load saved response for current prompt
        const savedResponse = this.responses[this.currentPromptIndex] || '';
        this.textarea.value = savedResponse;

        // Save response when user types
        this.textarea.addEventListener('input', () => {
            this.responses[this.currentPromptIndex] = this.textarea.value;
            this.saveResponseToStorage();
        });

        // Add textarea to the game canvas
        document.body.appendChild(this.textarea);

        // Position relative to canvas
        this.updateTextareaPosition();
    }

    updateTextareaPosition() {
        if (this.textarea) {
            const canvasRect = this.game.canvas.getBoundingClientRect();
            this.textarea.style.left = `${canvasRect.left + 30}px`;
            this.textarea.style.top = `${canvasRect.top + 190}px`;
        }
    }

    createNavigationButtons() {
        // Previous button
        this.prevButton = this.add.text(100, this.game.canvas.height - (this.game.canvas.height / 4), '← Previous', {
            fontSize: '16px',
            fill: this.currentPromptIndex > 0 ? '#BE185D' : '#D1A0B4',
            fontFamily: 'sans-serif'
        }).setOrigin(0.5).setInteractive({ useHandCursor: this.currentPromptIndex > 0 });

        if (this.currentPromptIndex > 0) {
            this.prevButton.on('pointerdown', () => this.previousPrompt());
        }

        // Next button
        this.nextButton = this.add.text(this.game.canvas.width - 100, this.game.canvas.height - (this.game.canvas.height / 4), 'Next →', {
            fontSize: '16px',
            fill: '#BE185D',
            fontFamily: 'sans-serif'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.nextButton.on('pointerdown', () => this.nextPrompt());

        // Finish button (shown on last prompt)
        if (this.currentPromptIndex === this.prompts.length - 1) {
            this.finishButton = this.add.text(this.game.canvas.width / 2, this.game.canvas.height - (this.game.canvas.height / 5), '✨ Complete Session', {
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

        // Update textarea with saved response
        const savedResponse = this.responses[this.currentPromptIndex] || '';
        if (this.textarea) {
            this.textarea.value = savedResponse;
        }

        // Recreate navigation
        this.createNavigationButtons();
        this.updateProgressIndicator();
    }

    updateProgressIndicator() {
        this.progressText = this.add.text(this.game.canvas.width / 2, 100, `Prompt ${this.currentPromptIndex + 1} of ${this.prompts.length}`, {
            fontSize: '12px',
            fill: '#A21CAF',
            fontFamily: 'sans-serif'
        }).setOrigin(0.5);
    }

    completeSession() {
        // Hide textarea
        if (this.textarea) {
            this.textarea.style.display = 'none';
        }

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
            this.cleanupTextarea();
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
            this.cleanupTextarea();
            this.scene.start('Start');
        });
    }

    cleanupTextarea() {
        if (this.textarea) {
            this.textarea.remove();
            this.textarea = null;
        }
    }

    // Clean up when scene shuts down
    shutdown() {
        this.cleanupTextarea();
        super.shutdown();
    }
}