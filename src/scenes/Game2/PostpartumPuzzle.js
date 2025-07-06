export class PostpartumPuzzle extends Phaser.Scene {
    constructor() {
        super('PostpartumPuzzle');
        this.difficulty = null;
        this.completedPieces = 0;
        this.totalPieces = 0;
        this.rows = 0;
        this.cols = 0;
        this.showingDifficultySelection = true;
    }

    preload() {
        this.load.image('space', 'assets/flower.png');
    }

    create() {
        this.cameras.main.setBackgroundColor('#FCE7F3');

        const w = this.scale.width;
        const h = this.scale.height;

        // Game Title (Upper Left)
        this.add.text(20, 20, 'Puzzle', {
            fontSize: '24px',
            fill: '#BE185D'
        });

        // Puzzle Header
        this.add.text(w / 2, 80, '🌸 Puzzle', {
            fontSize: '24px',
            fill: '#BE185D'
        }).setOrigin(0.5);

        if (this.showingDifficultySelection) {
            this.createDifficultySelection();
        } else {
            this.createPuzzleGrid();
            this.createPuzzlePieces();
            this.createChangeDifficultyButton();
        }
        
        this.createBackButton();
    }

    createDifficultySelection() {
        const w = this.scale.width;
        const h = this.scale.height;

        // Difficulty selection title
        this.add.text(w / 2, h / 2 - 100, 'Choose Difficulty:', {
            fontSize: '20px',
            fill: '#BE185D'
        }).setOrigin(0.5);

        // Easy button (9 pieces - 3x3)
        const easyBtn = this.add.text(w / 2, h / 2 - 40, 'Easy (9 pieces)', {
            fontSize: '18px',
            fill: '#BE185D',
            backgroundColor: '#FBCFE8',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        easyBtn.on('pointerdown', () => {
            this.setDifficulty(3, 3, 9);
        });

        easyBtn.on('pointerover', () => {
            easyBtn.setBackgroundColor('#F9A8D4');
        });

        easyBtn.on('pointerout', () => {
            easyBtn.setBackgroundColor('#FBCFE8');
        });

        // Medium button (12 pieces - 3x4)
        const mediumBtn = this.add.text(w / 2, h / 2, 'Medium (12 pieces)', {
            fontSize: '18px',
            fill: '#BE185D',
            backgroundColor: '#FBCFE8',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        mediumBtn.on('pointerdown', () => {
            this.setDifficulty(3, 4, 12);
        });

        mediumBtn.on('pointerover', () => {
            mediumBtn.setBackgroundColor('#F9A8D4');
        });

        mediumBtn.on('pointerout', () => {
            mediumBtn.setBackgroundColor('#FBCFE8');
        });

        // Hard button (15 pieces - 3x5)
        const hardBtn = this.add.text(w / 2, h / 2 + 40, 'Hard (15 pieces)', {
            fontSize: '18px',
            fill: '#BE185D',
            backgroundColor: '#FBCFE8',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        hardBtn.on('pointerdown', () => {
            this.setDifficulty(3, 5, 15);
        });

        hardBtn.on('pointerover', () => {
            hardBtn.setBackgroundColor('#F9A8D4');
        });

        hardBtn.on('pointerout', () => {
            hardBtn.setBackgroundColor('#FBCFE8');
        });
    }

    setDifficulty(rows, cols, totalPieces) {
        this.rows = rows;
        this.cols = cols;
        this.totalPieces = totalPieces;
        this.completedPieces = 0;
        this.showingDifficultySelection = false;
        
        // Clear the scene and recreate with puzzle
        this.children.removeAll();
        this.create();
    }

    createChangeDifficultyButton() {
        const changeDiffBtn = this.add.text(this.scale.width - 20, 20, 'Change Difficulty', {
            fontSize: '14px',
            fill: '#BE185D',
            backgroundColor: '#FBCFE8',
            padding: { x: 10, y: 5 }
        }).setOrigin(1, 0).setInteractive({ useHandCursor: true });

        changeDiffBtn.on('pointerdown', () => {
            this.showingDifficultySelection = true;
            this.children.removeAll();
            this.create();
        });

        changeDiffBtn.on('pointerover', () => {
            changeDiffBtn.setBackgroundColor('#F9A8D4');
        });

        changeDiffBtn.on('pointerout', () => {
            changeDiffBtn.setBackgroundColor('#FBCFE8');
        });
    }

    createPuzzleGrid() {
        const tex = this.textures.get('space').getSourceImage();
        this.pieceW = tex.width / this.cols;
        this.pieceH = tex.height / this.rows;

        const maxW = this.scale.width * 0.9;
        this.scaleFactor = maxW / (this.cols * this.pieceW);

        const scaledW = this.pieceW * this.scaleFactor;
        const scaledH = this.pieceH * this.scaleFactor;

        const startX = this.scale.width / 2 - (this.cols * scaledW) / 2 + scaledW / 2;
        const startY = 200;

        this.dropZones = [];

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const x = startX + col * scaledW;
                const y = startY + row * scaledH;

                const dz = this.add.rectangle(x, y, scaledW, scaledH, 0xFBCFE8)
                    .setStrokeStyle(2, 0xF472B6);

                dz.setData('row', row);
                dz.setData('col', col);
                dz.setData('occupied', false);

                this.dropZones.push(dz);
            }
        }
    }

    createPuzzlePieces() {
        const tex = this.textures.get('space').getSourceImage();
        const scaledW = this.pieceW * this.scaleFactor;
        const scaledH = this.pieceH * this.scaleFactor;

        let positions = [];
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                positions.push({ row, col });
            }
        }
        Phaser.Utils.Array.Shuffle(positions);

        positions.forEach(pos => {
            const rt = this.add.renderTexture(0, 0, this.pieceW, this.pieceH);
            rt.drawFrame('space', undefined, -pos.col * this.pieceW, -pos.row * this.pieceH);
            rt.setScale(this.scaleFactor);

            rt.x = Phaser.Math.Between(scaledW, this.scale.width - scaledW);
            rt.y = Phaser.Math.Between(this.scale.height - 180, this.scale.height - 100);

            rt.setInteractive({ draggable: true });
            rt.setData('correctRow', pos.row);
            rt.setData('correctCol', pos.col);
            rt.setData('currentZone', null);

            this.setupDragEvents(rt);
        });
    }

    setupDragEvents(piece) {
        piece.on('dragstart', () => {
            piece.setAlpha(0.7);
            const oldZone = piece.getData('currentZone');
            if (oldZone) {
                oldZone.setData('occupied', false);
                piece.setData('currentZone', null);
            }
        });

        piece.on('drag', (pointer, dragX, dragY) => {
            piece.x = dragX;
            piece.y = dragY;
        });

        piece.on('dragend', (pointer) => {
            piece.setAlpha(1);
            this.checkDrop(piece, pointer.x, pointer.y);
        });
    }

    checkDrop(piece, x, y) {
        const scaledW = this.pieceW * this.scaleFactor;
        const scaledH = this.pieceH * this.scaleFactor;

        for (const dz of this.dropZones) {
            const dx = dz.x;
            const dy = dz.y;
            if (!dz.getData('occupied') &&
                Math.abs(x - dx) < scaledW / 2 &&
                Math.abs(y - dy) < scaledH / 2) {

                piece.x = dx;
                piece.y = dy;

                dz.setData('occupied', true);
                piece.setData('currentZone', dz);

                if (piece.getData('correctRow') === dz.getData('row') &&
                    piece.getData('correctCol') === dz.getData('col')) {
                    piece.disableInteractive();
                    piece.setTint(0xF472B6);
                    this.completedPieces++;
                    if (this.completedPieces === this.totalPieces) this.puzzleComplete();
                }
                return;
            }
        }
    }

    puzzleComplete() {
        const w = this.scale.width;
        this.add.text(w / 2, this.scale.height - 120,
            '🎉 Puzzle Complete!', {
                fontSize: '18px',
                fill: '#BE185D',
                backgroundColor: '#FBCFE8',
                padding: { x: 10, y: 6 }
            }).setOrigin(0.5);

        this.add.text(w / 2, this.scale.height - 80, '🏆 Well Done!', {
            fontSize: '16px',
            fill: '#DB2777'
        }).setOrigin(0.5);
    }

    createBackButton() {
        const back = this.add.text(40, this.scale.height - 40, '← Back', {
            fontSize: '16px',
            fill: '#BE185D'
        }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true });
        back.on('pointerdown', () => this.scene.start('Start'));
    }
}