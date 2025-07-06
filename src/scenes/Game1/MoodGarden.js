export class MoodGarden extends Phaser.Scene {
    constructor() {
        super('MoodGarden');
        this.flowers = [];
        this.gratitudeLog = [];
        this.gardenLevel = 1;
        this.score = 0;
        this.flowerTypes = ['🌸', '🌺', '🌻', '🌷', '🌹', '🌼', '🥀', '🌵', '🌲'];
        this.currentGratitude = '';
        this.maxFlowersPerLevel = 5;
        this.inputActive = false;
        this.gratitudePopup = null;
        this.isDragging = false;
        this.deleteConfirmDialog = null;
        this.isMobile = true; // Mobile-first design
    }

    preload() {}

    create() {
        // Load saved data from localStorage
        this.loadGameData();
    
        // Set background color to pink
        this.cameras.main.setBackgroundColor('#ffe0f0'); // Soft pink
    
        const centerX = this.game.canvas.width / 2;
        const centerY = this.game.canvas.height / 2;
        const screenWidth = this.game.canvas.width;
        const screenHeight = this.game.canvas.height;
        this.input.addPointer(2);
    
        // Title - pink accent
        this.add.text(centerX, 40, 'Mood Garden', {
            fontSize: '28px',
            fill: '#e75480', // Deep pink
            fontFamily: 'sans-serif',
            stroke: '#fff',
            strokeThickness: 3
        }).setOrigin(0.5);
    
        // Instructions - white text
        this.add.text(centerX, 80, 'Share gratitude to grow flowers!', {
            fontSize: '16px',
            fill: '#e75480',
            fontFamily: 'sans-serif',
            align: 'center'
        }).setOrigin(0.5).setWordWrapWidth(screenWidth - 40);
    
        // Gratitude Input Area - pink border
        this.gratitudeInputBg = this.add.rectangle(centerX, 130, screenWidth - 40, 60, 0xffb6d5)
            .setStrokeStyle(2, 0xe75480);
        this.gratitudeText = this.add.text(centerX, 130, 'Tap here to add gratitude...', {
            fontSize: '16px',
            fill: '#e75480',
            fontFamily: 'sans-serif'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        // Add blinking cursor
        this.inputCursor = this.add.text(centerX + (screenWidth-40)/2 - 20, 130, '|', {
            fontSize: '18px',
            fill: '#e75480',
            fontFamily: 'sans-serif'
        }).setOrigin(0, 0.5).setVisible(false);
    
        // Plant Button - pink
        this.addButton = this.add.text(centerX, 200, 'Plant Flower 🌱', {
            fontSize: '18px',
            fill: '#fff',
            fontFamily: 'sans-serif',
            backgroundColor: '#e75480',
            padding: { x: 30, y: 15 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    
        // Score and Level display - pink accent
        this.scoreText = this.add.text(20, 20, `Flowers: ${this.score}`, {
            fontSize: '16px',
            fill: '#e75480',
            fontFamily: 'sans-serif'
        });
        this.levelText = this.add.text(screenWidth - 20, 20, `Lv: ${this.gardenLevel}`, {
            fontSize: '16px',
            fill: '#e75480',
            fontFamily: 'sans-serif'
        }).setOrigin(1, 0);
    
        // Back button - pink
        this.backButton = this.add.text(centerX, screenHeight - 30, 'Back to Menu', {
            fontSize: '18px',
            fill: '#fff',
            fontFamily: 'sans-serif',
            stroke: '#e75480',
            strokeThickness: 2,
            backgroundColor: '#e75480',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    
        // Recent gratitude display - white text
        this.recentGratitudeText = this.add.text(centerX, screenHeight - (screenHeight * .20), '', {
            fontSize: '12px',
            fill: '#e75480',
            fontFamily: 'sans-serif',
            align: 'center',
            wordWrap: { width: screenWidth - 40 }
        }).setOrigin(0.5);
    
        // Garden area - light pink
        const gardenHeight = Math.min(280, screenHeight - 350);
        this.gardenArea = this.add.rectangle(centerX, 250 + gardenHeight/2, screenWidth - 30, gardenHeight, 0xffb6d5, 0.7)
            .setStrokeStyle(2, 0xe75480)
            .setOrigin(0.5);
    
        this.setupEventListeners();
        this.displayExistingFlowers();
        this.updateRecentGratitude();
    }

    setupEventListeners() {
        // Gratitude input click
        this.gratitudeText.on('pointerdown', () => {
            this.activateInput();
        });

        this.gratitudeInputBg.setInteractive().on('pointerdown', () => {
            this.activateInput();
        });

        // Add button click
        this.addButton.on('pointerover', () => this.addButton.setScale(1.05));
        this.addButton.on('pointerout', () => this.addButton.setScale(1));
        this.addButton.on('pointerdown', () => {
            this.addButton.setScale(0.95);
            this.plantFlower();
        });
        this.addButton.on('pointerup', () => this.addButton.setScale(1));

        // Back button interactions
        this.backButton.on('pointerover', () => this.backButton.setScale(1.1));
        this.backButton.on('pointerout', () => this.backButton.setScale(1));
        this.backButton.on('pointerdown', () => {
            this.backButton.setScale(0.9);
            this.saveGameData();
            this.scene.start('Start');
        });
        this.backButton.on('pointerup', () => this.backButton.setScale(1));

        // Click outside to deactivate input
        this.input.on('pointerdown', (pointer, targets) => {
            if (this.inputActive && targets.length === 0) {
                this.deactivateInput();
            }
        });
    }

    setupKeyboardInput() {
        this.input.keyboard.on('keydown', (event) => {
            if (!this.inputActive) return;

            if (event.key === 'Enter') {
                this.deactivateInput();
                this.plantFlower();
            } else if (event.key === 'Escape') {
                this.deactivateInput();
            } else if (event.key === 'Backspace') {
                this.currentGratitude = this.currentGratitude.slice(0, -1);
            } else if (event.key.length === 1 && this.currentGratitude.length < 100) {
                this.currentGratitude += event.key;
            }
            
            this.updateInputDisplay();
        });
    }

    activateInput() {
        const gratitude = window.prompt('What are you grateful for today?');
        if (gratitude && gratitude.trim() !== '') {
            this.currentGratitude = gratitude.trim();
            this.updateInputDisplay();
            this.plantFlower();
        }
    }
    deactivateInput() {
        this.inputActive = false;
        this.gratitudeInputBg.setStrokeStyle(2, 0xe75480);
        this.inputCursor.setVisible(false);
        if (this.cursorTween) {
            this.cursorTween.destroy();
        }
        if (this.currentGratitude === '') {
            this.gratitudeText.setText('Tap here to add gratitude...');
            this.gratitudeText.setStyle({ fill: '#e75480' });
        }
    }

    updateInputDisplay() {
        if (this.currentGratitude === '') {
            this.gratitudeText.setText('');
        } else {
            const displayText = this.currentGratitude.length > 40 ? 
                this.currentGratitude.substring(0, 40) + '...' : 
                this.currentGratitude;
            this.gratitudeText.setText(displayText);
        }
    }

    plantFlower() {
        if (!this.currentGratitude || this.currentGratitude.trim() === '') {
            this.showMessage('Please add something you\'re grateful for first!', '#e75480');
            return;
        }

        // Add to gratitude log
        const gratitudeEntry = {
            text: this.currentGratitude.trim(),
            date: new Date().toLocaleDateString(),
            id: Date.now()
        };
        this.gratitudeLog.push(gratitudeEntry);

        // Create a flower with larger size for mobile
        const flowerType = Phaser.Utils.Array.GetRandom(this.flowerTypes);
        const x = Phaser.Math.Between(
            this.gardenArea.x - this.gardenArea.width/2 + 40, 
            this.gardenArea.x + this.gardenArea.width/2 - 40
        );
        const y = Phaser.Math.Between(
            this.gardenArea.y - this.gardenArea.height/2 + 30, 
            this.gardenArea.y + this.gardenArea.height/2 - 30
        );

        const flower = this.add.text(x, y, flowerType, {
            fontSize: '36px'  // Slightly smaller for mobile density
        }).setOrigin(0.5).setInteractive({ useHandCursor: true, draggable: true });

        // Add flower interactions
        this.setupFlowerInteractions(flower, gratitudeEntry);

        // Flower growth animation
        flower.setScale(0);
        this.tweens.add({
            targets: flower,
            scale: 1,
            duration: 800,
            ease: 'Back.easeOut',
            onComplete: () => {
                // Add a gentle sway animation
                this.tweens.add({
                    targets: flower,
                    angle: { from: -5, to: 5 },
                    duration: 2000,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            }
        });

        // Store flower data
        const flowerData = {
            object: flower,
            gratitude: gratitudeEntry.text,
            type: flowerType,
            x: x,
            y: y,
            id: gratitudeEntry.id
        };
        this.flowers.push(flowerData);

        // Update score
        this.score++;
        this.updateScoreText();

        // Check for level up
        if (this.score % this.maxFlowersPerLevel === 0) {
            this.levelUp();
        }

        // Reset input
        this.currentGratitude = '';
        this.gratitudeText.setText('Click here to add gratitude...');
        this.gratitudeText.setStyle({ fill: '#888' });

        // Show success message
        this.showMessage('Beautiful flower planted! 🌸', '#e75480');

        // Update recent gratitude display
        this.updateRecentGratitude();

        // Save progress
        this.saveGameData();
    }

    setupFlowerInteractions(flower, gratitudeEntry) {
        let dragStartTime = 0;
        let hasDragged = false;
        let dragThreshold = 150; // Longer press time for mobile

        flower.on('pointerover', () => {
            if (!this.isDragging) {
                flower.setTint(0xffff99);
                // Don't show popup on hover for mobile - only on tap
                if (!this.isMobile) {
                    this.showGratitudePopup(flower, gratitudeEntry);
                }
            }
        });

        flower.on('pointerout', () => {
            if (!this.isDragging) {
                flower.clearTint();
                this.hideGratitudePopup();
            }
        });

        flower.on('pointerdown', (pointer) => {
            dragStartTime = Date.now();
            hasDragged = false;
            this.isDragging = false;
            flower.setTint(0xffcccc);
            this.hideGratitudePopup();
        });
        
        let lastClickTime = 0;
        flower.on('pointerup', () => {
            const dragDuration = Date.now() - dragStartTime;
            const clickTime = Date.now();
            flower.clearTint();

            // Handle double tap/click
            if (clickTime - lastClickTime < 300) { // Double tap threshold
                this.showDeleteConfirmation(flower, gratitudeEntry);
            }
            // Handle single tap/long press
            else if (dragDuration < dragThreshold && !hasDragged) {
                this.showGratitudePopup(flower, gratitudeEntry, true); // Persistent popup
            } 
            
            lastClickTime = clickTime;
            this.isDragging = false;
        });

        flower.on('dragstart', () => {
            this.isDragging = true;
            hasDragged = true;
            flower.setTint(0xff9999);
            this.hideGratitudePopup();
            this.hideDeleteConfirmation();
        });

        flower.on('drag', (pointer, dragX, dragY) => {
            // Constrain flower movement to garden area
            const bounds = this.getGardenBounds();
            const constrainedX = Phaser.Math.Clamp(dragX, bounds.left, bounds.right);
            const constrainedY = Phaser.Math.Clamp(dragY, bounds.top, bounds.bottom);
            
            flower.x = constrainedX;
            flower.y = constrainedY;
        });

        flower.on('dragend', () => {
            flower.clearTint();
            this.isDragging = false;
            
            // Update flower position in data and save
            const flowerData = this.flowers.find(f => f.object === flower);
            if (flowerData) {
                flowerData.x = flower.x;
                flowerData.y = flower.y;
                this.saveGameData();
            }
        });
    }

    getGardenBounds() {
        return {
            left: this.gardenArea.x - this.gardenArea.width/2 + 30,
            right: this.gardenArea.x + this.gardenArea.width/2 - 30,
            top: this.gardenArea.y - this.gardenArea.height/2 + 30,
            bottom: this.gardenArea.y + this.gardenArea.height/2 - 30
        };
    }

    showGratitudePopup(flower, gratitudeEntry, persistent = false) {
        if (this.isDragging) return;
        this.hideGratitudePopup();
        const popupWidth = Math.min(280, this.game.canvas.width - 40);
        let popupY = flower.y - 80;
        if (popupY - 40 < 20) {
            popupY = flower.y + 80;
        }
        const popupBg = this.add.rectangle(flower.x, popupY, popupWidth, 70, 0xffb6d5, 0.95)
            .setStrokeStyle(2, 0xe75480);
        const popupText = this.add.text(flower.x, popupY, gratitudeEntry.text, {
            fontSize: '14px',
            fill: '#e75480',
            fontFamily: 'sans-serif',
            align: 'center',
            wordWrap: { width: popupWidth - 20 }
        }).setOrigin(0.5);
        const dateText = this.add.text(flower.x, popupY + 25, gratitudeEntry.date, {
            fontSize: '12px',
            fill: '#e75480',
            fontFamily: 'sans-serif'
        }).setOrigin(0.5);
        const closeButton = this.add.text(flower.x + popupWidth/2 - 15, popupY - 25, '✖', {
            fontSize: '16px',
            fill: '#e75480',
            fontFamily: 'sans-serif'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        closeButton.on('pointerdown', () => {
            this.hideGratitudePopup();
        });
        this.gratitudePopup = {
            bg: popupBg,
            text: popupText,
            date: dateText,
            closeButton: closeButton,
            persistent: persistent
        };
        if (!persistent) {
            this.time.delayedCall(4000, () => {
                this.hideGratitudePopup();
            });
        }
    }

    hideGratitudePopup() {
        if (this.gratitudePopup) {
            this.gratitudePopup.bg.destroy();
            this.gratitudePopup.text.destroy();
            this.gratitudePopup.date.destroy();
            if (this.gratitudePopup.closeButton) {
                this.gratitudePopup.closeButton.destroy();
            }
            this.gratitudePopup = null;
        }
    }

    showDeleteConfirmation(flower, gratitudeEntry) {
        this.hideDeleteConfirmation();
        this.hideGratitudePopup();
        const screenWidth = this.game.canvas.width;
        const screenHeight = this.game.canvas.height;
        const dialogWidth = Math.min(350, screenWidth - 40);
        const overlay = this.add.rectangle(screenWidth/2, screenHeight/2, screenWidth, screenHeight, 0xffb6d5, 0.6);
        const dialogBg = this.add.rectangle(screenWidth / 2, screenHeight / 2, dialogWidth, 220, 0xffb6d5)
            .setStrokeStyle(3, 0xe75480);
        const titleText = this.add.text(screenWidth / 2, screenHeight / 2 - 70, 'Delete Flower? 🗑️', {
            fontSize: '20px',
            fill: '#e75480',
            fontFamily: 'sans-serif',
            stroke: '#fff',
            strokeThickness: 2
        }).setOrigin(0.5);
        const gratitudeText = this.add.text(screenWidth / 2, screenHeight / 2 - 30, 
            `"${gratitudeEntry.text.length > 45 ? gratitudeEntry.text.substring(0, 45) + '...' : gratitudeEntry.text}"`, {
            fontSize: '14px',
            fill: '#e75480',
            fontFamily: 'sans-serif',
            align: 'center',
            wordWrap: { width: dialogWidth - 40 }
        }).setOrigin(0.5);
        const confirmButton = this.add.text(screenWidth / 2 - 70, screenHeight / 2 + 30, 'Delete ❌', {
            fontSize: '16px',
            fill: '#fff',
            fontFamily: 'sans-serif',
            backgroundColor: '#e75480',
            padding: { x: 20, y: 12 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        confirmButton.on('pointerdown', () => {
            this.deleteFlower(flower, gratitudeEntry);
            this.hideDeleteConfirmation();
        });


        const cancelButton = this.add.text(screenWidth / 2 + 70, screenHeight / 2 + 30, 'Cancel ✖️', {
            fontSize: '16px',
            fill: '#e75480',
            fontFamily: 'sans-serif',
            backgroundColor: '#fff',
            padding: { x: 20, y: 12 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        cancelButton.on('pointerdown', () => {
            this.hideDeleteConfirmation();
        });

        this.deleteConfirmDialog = {
            cancelButton,
            confirmButton,
            bg: dialogBg,
            overlay,
            title: titleText,
            gratitudeText
        }
    }

    hideDeleteConfirmation() {
        if (this.deleteConfirmDialog) {
            this.deleteConfirmDialog.overlay.destroy();
            this.deleteConfirmDialog.bg.destroy();
            this.deleteConfirmDialog.title.destroy();
            this.deleteConfirmDialog.gratitudeText.destroy();
            this.deleteConfirmDialog.confirmButton.destroy();
            this.deleteConfirmDialog.cancelButton.destroy();
            this.deleteConfirmDialog = null;
        }
    }

    deleteFlower(flower, gratitudeEntry) {
        // Find and remove from flowers array
        const flowerIndex = this.flowers.findIndex(f => f.object === flower);
        if (flowerIndex !== -1) {
            this.flowers.splice(flowerIndex, 1);
        }

        // Find and remove from gratitude log
        const gratitudeIndex = this.gratitudeLog.findIndex(g => g.id === gratitudeEntry.id);
        if (gratitudeIndex !== -1) {
            this.gratitudeLog.splice(gratitudeIndex, 1);
        }

        // Remove flower from scene with animation
        this.tweens.add({
            targets: flower,
            scale: 0,
            alpha: 0,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                flower.destroy();
            }
        });

        // Update score
        this.score = Math.max(0, this.score - 1);
        this.updateScoreText();

        // Recalculate garden level
        this.gardenLevel = Math.max(1, Math.floor(this.score / this.maxFlowersPerLevel) + 1);
        this.updateLevelText();

        // Update recent gratitude display
        this.updateRecentGratitude();

        // Save progress
        this.saveGameData();

        // Show message
        this.showMessage('Flower removed from garden 🥀', '#ff6b6b');
    }

    levelUp() {
        this.gardenLevel++;
        this.updateLevelText();
        
        this.showMessage(`Garden Level ${this.gardenLevel}! Your garden is blooming! 🌺`, '#4ecca3');
        
        // Add sparkle effect
        for (let i = 0; i < 10; i++) {
            const sparkle = this.add.text(
                Phaser.Math.Between(100, this.sys.game.config.width - 100),
                Phaser.Math.Between(200, 400),
                '✨',
                { fontSize: '20px' }
            );
            
            this.tweens.add({
                targets: sparkle,
                alpha: 0,
                y: sparkle.y - 50,
                duration: 1500,
                ease: 'Power2',
                onComplete: () => sparkle.destroy()
            });
        }
    }

    displayExistingFlowers() {
        // Display flowers from saved data
        this.flowers.forEach((flowerData, index) => {
            if (flowerData.x && flowerData.y) {
                const flower = this.add.text(flowerData.x, flowerData.y, flowerData.type, {
                    fontSize: '36px'  // Consistent mobile size
                }).setOrigin(0.5).setInteractive({ useHandCursor: true, draggable: true });

                // Find corresponding gratitude entry
                const gratitudeEntry = this.gratitudeLog.find(entry => entry.id === flowerData.id) || {
                    text: flowerData.gratitude,
                    date: new Date().toLocaleDateString(),
                    id: flowerData.id || Date.now()
                };

                // Setup interactions for existing flowers
                this.setupFlowerInteractions(flower, gratitudeEntry);

                // Add gentle sway animation
                this.tweens.add({
                    targets: flower,
                    angle: { from: -5, to: 5 },
                    duration: 2000,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });

                flowerData.object = flower;
            }
        });
    }

    updateRecentGratitude() {
        if (this.gratitudeLog.length > 0) {
            const recent = this.gratitudeLog.slice(-2).reverse(); // Show fewer on mobile
            const text = 'Recent:\n' + recent.map(item => 
                `• ${item.text.length > 30 ? item.text.substring(0, 30) + '...' : item.text}`
            ).join('\n');
            this.recentGratitudeText.setText(text);
        } else {
            this.recentGratitudeText.setText('');
        }
    }

    showMessage(text, color = '#e75480') {
        if (this.messageText) {
            this.messageText.destroy();
        }
        this.messageText = this.add.text(this.game.canvas.width / 2, 240, text, {
            fontSize: '16px',
            fill: color,
            fontFamily: 'sans-serif',
            stroke: '#fff',
            strokeThickness: 2,
            align: 'center',
            wordWrap: { width: this.game.canvas.width - 40 }
        }).setOrigin(0.5);
        this.time.delayedCall(3000, () => {
            if (this.messageText) {
                this.tweens.add({
                    targets: this.messageText,
                    alpha: 0,
                    duration: 500,
                    onComplete: () => {
                        if (this.messageText) {
                            this.messageText.destroy();
                            this.messageText = null;
                        }
                    }
                });
            }
        });
    }

    updateScoreText() {
        this.scoreText.setText(`Flowers: ${this.score}`);
    }

    updateLevelText() {
        this.levelText.setText(`Garden Level: ${this.gardenLevel}`);
    }

    saveGameData() {
        const gameData = {
            gardenLevel: this.gardenLevel,
            score: this.score,
            gratitudeLog: this.gratitudeLog,
            flowers: this.flowers.map(flower => ({
                gratitude: flower.gratitude,
                type: flower.type,
                x: flower.x,
                y: flower.y,
                id: flower.id
            }))
        };
        localStorage.setItem('moodGardenData', JSON.stringify(gameData));
    }

    loadGameData() {
        const savedData = localStorage.getItem('moodGardenData');
        if (savedData) {
            try {
                const gameData = JSON.parse(savedData);
                this.gardenLevel = gameData.gardenLevel || 1;
                this.score = gameData.score || 0;  
                this.gratitudeLog = gameData.gratitudeLog || [];
                this.flowers = gameData.flowers || [];
            } catch (error) {
                console.warn('Failed to load mood garden data:', error);
                this.resetGameData();
            }
        }
    }

    resetGameData() {
        this.gardenLevel = 1;
        this.score = 0;
        this.gratitudeLog = [];
        this.flowers = [];
        localStorage.removeItem('moodGardenData');
    }

    update() {}
}