// "Every great game begins with a single scene. Let's make this one unforgettable!"
export class MemoryGame extends Phaser.Scene {
    constructor() {
        super('MemoryGame');
        this.availableEmojis = ['😀', '😂', '😍', '🤔', '🥳', '😎', '🤩', '🚀', '🌈', '🍕', '🐶', '🐱', '🐵', '🦄', '🐸', '🐼', '🐧', '🐢', '🐙', '🦋'];
        this.cards = [];
        this.flippedCards = [];
        this.matchesFound = 0;
        this.level = 1;
        this.score = 0;
        this.canFlip = true;
    }

    preload() {}

    create() {
        // Load saved data from localStorage
        this.loadGameData();

        const centerX = this.game.canvas.width / 2;
        const screenHeight = this.game.canvas.height;
        
        this.matchesFound = 0;
        this.scoreText = this.add.text(20, 50, `Score: ${this.score}`, { fontSize: '24px', fill: '#FFF', fontFamily: 'sans-serif' });
        this.scoreText.setStroke('#000', 4);
        this.levelText = this.add.text(this.game.canvas.width - 20, 50, `Level: ${this.level}`, { fontSize: '24px', fill: '#FFF', fontFamily: 'sans-serif' }).setOrigin(1, 0);
        this.levelText.setStroke('#000', 4);
        this.messageText = this.add.text(this.game.canvas.width / 2, 200, '', { fontSize: '32px', fill: '#FFD700', fontFamily: 'sans-serif' }).setOrigin(0.5);
        this.messageText.setStroke('#000', 6);
        
        // Add back button
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

        // Back button interactions
        this.backButton.on('pointerover', () => this.backButton.setScale(1.1));
        this.backButton.on('pointerout', () => this.backButton.setScale(1));
        this.backButton.on('pointerdown', () => {
            this.backButton.setScale(0.9);
            this.saveGameData(); // Save before leaving
            this.scene.start('Start');
        });
        this.backButton.on('pointerup', () => this.backButton.setScale(1));
        
        this.createGameBoard();
        window.addEventListener('resize', this.onResize.bind(this));

        this.updateLevelText();
        this.updateScoreText();
    }

    onResize() {
        this.game.scale.resize(window.innerWidth, window.innerHeight);
        this.scoreText.setPosition(50, 50);
        this.levelText.setPosition(this.game.canvas.width - 50, 50).setOrigin(1, 0);
        this.messageText.setPosition(this.game.canvas.width / 2, 120);
        this.backButton.setPosition(50, this.game.canvas.height - 80);
        this.createGameBoard();
    }

    createGameBoard() {
        this.cards.forEach(card => card.destroy());
        this.cards = [];
        this.flippedCards = [];
        this.canFlip = true;
        this.matchesFound = 0;
        const maxLevel = 10;
        const cappedLevel = Math.min(this.level, maxLevel);
        const pairsForLevel = 4 + (cappedLevel - 1) * 2;
        const totalCards = pairsForLevel * 2;
        const emojisToUse = this.shuffleArray([...this.availableEmojis]).slice(0, pairsForLevel);
        let gameEmojis = [];
        emojisToUse.forEach(emoji => { gameEmojis.push(emoji, emoji); });
        gameEmojis = this.shuffleArray(gameEmojis);
        const maxCols = 6;
        const numCols = Math.min(maxCols, Math.ceil(Math.sqrt(totalCards)));
        const numRows = Math.ceil(totalCards / numCols);
        const cardPadding = 20;
        // Responsive card size based on both width and height
        const maxBoardWidth = this.game.canvas.width * 0.95;
        const maxBoardHeight = (this.game.canvas.height - 200) * 0.95; // leave space for UI
        const cardWidth = Math.min(
            100,
            (maxBoardWidth - (numCols - 1) * cardPadding) / numCols,
            (maxBoardHeight - (numRows - 1) * cardPadding) / numRows
        );
        const cardHeight = cardWidth;
        const boardWidth = (numCols * (cardWidth + cardPadding)) - cardPadding;
        const boardHeight = (numRows * (cardHeight + cardPadding)) - cardPadding;
        const startX = (this.game.canvas.width / 2) - (boardWidth / 2);
        const startY = (this.game.canvas.height / 2) - (boardHeight / 2) + 50;
        gameEmojis.forEach((emojiValue, index) => {
            const col = index % numCols;
            const row = Math.floor(index / numCols);
            const x = startX + (col * (cardWidth + cardPadding)) + cardWidth / 2;
            const y = startY + (row * (cardHeight + cardPadding)) + cardHeight / 2;
            const cardContainer = this.add.container(x, y);
            const cardBack = this.add.rectangle(0, 0, cardWidth, cardHeight, 0xFFC0CB).setOrigin(0.5).setStrokeStyle(4, 0x616161).setDepth(1);
            const cardFaceEmoji = this.add.text(0, 0, emojiValue, { fontSize: `${Math.floor(cardWidth * 0.6)}px`, fill: '#FFF', fontFamily: 'Arial Unicode MS' }).setOrigin(0.5).setVisible(false).setDepth(0);
            cardContainer.add([cardBack, cardFaceEmoji]);
            cardContainer.setSize(cardWidth, cardHeight);
            cardContainer.setInteractive();
            cardContainer.setData('isFlipped', false);
            cardContainer.setData('isMatched', false);
            cardContainer.setData('emojiValue', emojiValue);
            cardContainer.setData('cardBack', cardBack);
            cardContainer.setData('cardFaceEmoji', cardFaceEmoji);
            cardContainer.on('pointerdown', () => { this.flipCard(cardContainer); });
            this.cards.push(cardContainer);
        });
    }

    flipCard(card) {
        if (!this.canFlip || card.getData('isFlipped') || card.getData('isMatched')) return;
        this.canFlip = false;
        card.setData('isFlipped', true);
        this.flippedCards.push(card);
        const cardBack = card.getData('cardBack');
        const cardFaceEmoji = card.getData('cardFaceEmoji');
        this.tweens.add({
            targets: cardBack,
            scaleX: 0,
            duration: 75, // Reduced from 150 to 75
            ease: 'Linear',
            onComplete: () => {
                cardBack.setVisible(false);
                cardFaceEmoji.setVisible(true);
                this.tweens.add({
                    targets: cardFaceEmoji,
                    scaleX: 1,
                    duration: 75, // Reduced from 150 to 75
                    ease: 'Linear',
                    onComplete: () => {
                        this.canFlip = true;
                        if (this.flippedCards.length === 2) {
                            this.canFlip = false;
                            this.time.delayedCall(400, this.checkForMatch, [], this); // Reduced from 800 to 400
                        }
                    }
                });
            }
        });
    }

    checkForMatch() {
        const [card1, card2] = this.flippedCards;
        if (card1.getData('emojiValue') === card2.getData('emojiValue')) {
            card1.setData('isMatched', true);
            card2.setData('isMatched', true);
            this.matchesFound++;
            this.score++;
            this.updateScoreText();
            this.saveGameData(); // Save after score update
            this.tweens.add({
                targets: [card1, card2],
                alpha: 0.7,
                scale: 0.95,
                duration: 300,
                ease: 'Power1',
                onComplete: () => {}
            });
            this.messageText.setText('Match!');
            this.time.delayedCall(500, () => this.messageText.setText(''), [], this);
            if (this.matchesFound === (this.cards.length / 2)) {
                this.time.delayedCall(1000, this.roundComplete, [], this);
            }
        } else {
            this.messageText.setText('No Match!');
            this.time.delayedCall(500, () => this.messageText.setText(''), [], this);
            this.time.delayedCall(1000, () => {
                this.flipBack(card1);
                this.flipBack(card2);
            }, [], this);
        }
        this.flippedCards = [];
        this.canFlip = true;
    }

    flipBack(card) {
        card.setData('isFlipped', false);
        const cardBack = card.getData('cardBack');
        const cardFaceEmoji = card.getData('cardFaceEmoji');
        this.tweens.add({
            targets: cardFaceEmoji,
            scaleX: 0,
            duration: 75, // Reduced from 150 to 75
            ease: 'Linear',
            onComplete: () => {
                cardFaceEmoji.setVisible(false);
                cardBack.setVisible(true);
                this.tweens.add({
                    targets: cardBack,
                    scaleX: 1,
                    duration: 75, // Reduced from 150 to 75
                    ease: 'Linear'
                });
            }
        });
    }

    roundComplete() {
        this.messageText.setText(`Level ${this.level} Complete!`);
        this.level++;
        this.updateLevelText();
        this.saveGameData(); // Save after level increase
        this.time.delayedCall(2000, () => {
            this.messageText.setText('Get Ready!');
            this.time.delayedCall(1000, this.createGameBoard, [], this);
        }, [], this);
    }

    updateScoreText() {
        this.scoreText.setText('Score: ' + this.score);
    }

    updateLevelText() {
        const maxLevel = 10;
        this.levelText.setText('Level: ' + (this.level >= maxLevel ? 'MAX' : this.level));
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    /**
     * Save game data to localStorage
     */
    saveGameData() {
        const gameData = {
            level: this.level,
            score: this.score
        };
        localStorage.setItem('memoryGameData', JSON.stringify(gameData));
    }

    /**
     * Load game data from localStorage
     */
    loadGameData() {
        const savedData = localStorage.getItem('memoryGameData');
        if (savedData) {
            try {
                const gameData = JSON.parse(savedData);
                this.level = gameData.level || 1;
                this.score = gameData.score || 0;
            } catch (error) {
                console.warn('Failed to load game data:', error);
                this.level = 1;
                this.score = 0;
            }
        }
    }

    /**
     * Reset game data (optional method for debugging or reset functionality)
     */
    resetGameData() {
        this.level = 1;
        this.score = 0;
        localStorage.removeItem('memoryGameData');
        this.updateScoreText();
        this.updateLevelText();
    }
}