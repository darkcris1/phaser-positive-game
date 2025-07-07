export class ColorTherapyArt extends Phaser.Scene {
    constructor() {
        super('ColorTherapyArt');
        this.isDrawing = false;
        this.currentColor = '#F472B6';
        this.currentBrushSize = 8;
        this.drawingData = [];
        this.strokeHistory = []; // Store all drawing strokes
        this.lastDrawPoint = null;
        this.artCanvas = null;
        this.totalStrokes = 0;
        this.sessionTime = 0;
        this.startTime = 0;
        this.colorPickerVisible = false;
        this.brushSizeVisible = false;
        this.colorPickerContainer = null;
        this.brushSizeContainer = null;
        this.canvasLoaded = false;
    }

    create() {
        this.cameras.main.setBackgroundColor('#FCE4EC'); // Soft pink background
        this.startTime = this.time.now;

        // Title
        this.add.text(this.game.canvas.width / 2, 20, '🎨 Color Therapy Art Pad', {
            fontSize: '20px',
            fill: '#BE185D',
            fontFamily: 'sans-serif'
        }).setOrigin(0.5);

        this.createDrawingCanvas();
        this.createColorPickerButton();
        this.createBrushSizeButton();
        this.createStatsDisplay();
        this.createBackButton();

        // Load saved drawing after canvas is created
        this.loadSavedDrawing();

        // Add helpful instructions
        this.add.text(this.game.canvas.width / 2, 45, 'Express yourself with warm, calming colors', {
            fontSize: '12px',
            fill: '#A21CAF',
            fontFamily: 'sans-serif'
        }).setOrigin(0.5);
    }

    createDrawingCanvas() {
        // Create main drawing area with more space
        const canvasWidth = this.game.canvas.width - 20;
        const canvasHeight = Math.min(700, this.game.canvas.height - 180);
        const canvasX = this.game.canvas.width / 2;
        const canvasY = 65 + (canvasHeight / 2);

        // Canvas background
        this.canvasBg = this.add.rectangle(canvasX, canvasY, canvasWidth, canvasHeight, 0xFFFBFE)
            .setStrokeStyle(2, 0xBE185D);

        // Create render texture for drawing
        this.artCanvas = this.add.renderTexture(canvasX, canvasY, canvasWidth, canvasHeight);
        this.artCanvas.fill(0xFFFBFE); // White canvas

        // Set up drawing interactions
        this.artCanvas.setInteractive();
        this.artCanvas.on('pointerdown', this.startDrawing, this);
        this.artCanvas.on('pointermove', this.continueDraw, this);
        this.artCanvas.on('pointerup', this.stopDrawing, this);
        this.artCanvas.on('pointerout', this.stopDrawing, this);

        // Store canvas bounds for drawing calculations
        this.canvasBounds = {
            left: canvasX - canvasWidth / 2,
            right: canvasX + canvasWidth / 2,
            top: canvasY - canvasHeight / 2,
            bottom: canvasY + canvasHeight / 2
        };
    }

    createColorPickerButton() {
        const buttonY = this.artCanvas.y + this.artCanvas.height / 2 + 25;
        
        // Color picker toggle button
        this.colorPickerBtn = this.add.text(this.game.canvas.width / 2 - 100, buttonY, '🎨 Colors', {
            fontSize: '14px',
            fill: '#FFFFFF',
            fontFamily: 'sans-serif',
            backgroundColor: this.currentColor,
            padding: { x: 12, y: 6 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.colorPickerBtn.on('pointerdown', () => {
            this.toggleColorPicker();
        });

        // Clear canvas button positioned next to colors button
        const clearButton = this.add.text(this.game.canvas.width / 2, buttonY, '🗑️ Clear', {
            fontSize: '14px',
            fill: '#FFFFFF',
            fontFamily: 'sans-serif',
            backgroundColor: '#E91E63',
            padding: { x: 12, y: 6 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        clearButton.on('pointerdown', () => {
            this.clearCanvas();
        });

        // Create hidden color picker container
        this.createColorPicker();
    }

    createBrushSizeButton() {
        const buttonY = this.artCanvas.y + this.artCanvas.height / 2 + 25;
        
        // Brush size toggle button
        this.brushSizeBtn = this.add.text(this.game.canvas.width / 2 + 100, buttonY, `🖌️ Size: ${this.currentBrushSize}`, {
            fontSize: '14px',
            fill: '#FFFFFF',
            fontFamily: 'sans-serif',
            backgroundColor: '#BE185D',
            padding: { x: 12, y: 6 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.brushSizeBtn.on('pointerdown', () => {
            this.toggleBrushSize();
        });

        // Create hidden brush size container
        this.createBrushControls();
    }

    createColorPicker() {
        const paletteY = this.artCanvas.y + this.artCanvas.height / 2 - 140; // Changed to show above buttons
        
        // Create container for color picker
        this.colorPickerContainer = this.add.container(0, 0);
        
        // Background panel
        const panelBg = this.add.rectangle(this.game.canvas.width / 2, paletteY + 40, this.game.canvas.width - 40, 120, 0xFFFBFE)
            .setStrokeStyle(2, 0xBE185D);
        this.colorPickerContainer.add(panelBg);

        // Warm, therapeutic colors
        const colors = [
            { hex: '#F472B6', name: 'Rose Pink', emotion: 'love' },
            { hex: '#EC4899', name: 'Deep Pink', emotion: 'passion' },
            { hex: '#BE185D', name: 'Berry Pink', emotion: 'warmth' },
            { hex: '#F59E0B', name: 'Warm Orange', emotion: 'joy' },
            { hex: '#EF4444', name: 'Gentle Red', emotion: 'energy' },
            { hex: '#A855F7', name: 'Soft Purple', emotion: 'calm' },
            { hex: '#F97316', name: 'Sunset Orange', emotion: 'comfort' },
            { hex: '#C084FC', name: 'Lavender', emotion: 'peace' },
            { hex: '#FBBF24', name: 'Golden Yellow', emotion: 'happiness' },
            { hex: '#10B981', name: 'Mint Green', emotion: 'healing' }
        ];

        this.colorButtons = [];
        const colorsPerRow = 5;
        
        colors.forEach((color, index) => {
            const row = Math.floor(index / colorsPerRow);
            const col = index % colorsPerRow;
            const x = this.game.canvas.width / 2 - 80 + (col * 40);
            const y = paletteY + 20 + (row * 40);

            const colorCircle = this.add.circle(x, y, 12, Phaser.Display.Color.HexStringToColor(color.hex).color)
                .setStrokeStyle(2, 0xFFFFFF)
                .setInteractive({ useHandCursor: true });

            colorCircle.on('pointerdown', () => {
                this.selectColor(color.hex);
                this.updateColorSelection(colorCircle);
                this.showColorEmotion(color.emotion);
                this.hideColorPicker();
            });

            colorCircle.on('pointerover', () => {
                colorCircle.setScale(1.1);
                this.showColorPreview(color.name);
            });

            colorCircle.on('pointerout', () => {
                if (this.currentColor !== color.hex) {
                    colorCircle.setScale(1);
                }
                this.hideColorPreview();
            });

            this.colorButtons.push({ circle: colorCircle, color: color.hex });
            this.colorPickerContainer.add(colorCircle);
        });

        // Set initial selection
        this.updateColorSelection(this.colorButtons[0].circle);
        
        // Hide initially
        this.colorPickerContainer.setVisible(false);
    }

    createBrushControls() {
        const controlsY = this.artCanvas.y + this.artCanvas.height / 2 - 110; // Changed to show above buttons
        
        // Create container for brush controls
        this.brushSizeContainer = this.add.container(0, 0);
        
        // Background panel
        const panelBg = this.add.rectangle(this.game.canvas.width / 2, controlsY + 30, this.game.canvas.width - 40, 80, 0xFFFBFE)
            .setStrokeStyle(2, 0xBE185D);
        this.brushSizeContainer.add(panelBg);

        // Brush size options
        const brushSizes = [4, 8, 12, 16, 24];
        this.brushButtons = [];

        brushSizes.forEach((size, index) => {
            const x = this.game.canvas.width / 2 - 80 + (index * 40);
            const y = controlsY + 30;

            const brushButton = this.add.circle(x, y, size / 2 + 6, 0xFBCFE8)
                .setStrokeStyle(1, 0xBE185D)
                .setInteractive({ useHandCursor: true });

            const brushPreview = this.add.circle(x, y, size / 2, 0xBE185D);

            brushButton.on('pointerdown', () => {
                this.selectBrushSize(size);
                this.updateBrushSelection(brushButton);
                this.hideBrushSize();
            });

            brushButton.on('pointerover', () => {
                brushButton.setScale(1.1);
            });

            brushButton.on('pointerout', () => {
                if (this.currentBrushSize !== size) {
                    brushButton.setScale(1);
                }
            });

            this.brushButtons.push({ button: brushButton, size: size, preview: brushPreview });
            this.brushSizeContainer.add([brushButton, brushPreview]);
        });

        // Set initial brush selection
        this.updateBrushSelection(this.brushButtons[1].button); // Default to size 8
        
        // Hide initially
        this.brushSizeContainer.setVisible(false);
    }

    toggleColorPicker() {
        this.colorPickerVisible = !this.colorPickerVisible;
        this.colorPickerContainer.setVisible(this.colorPickerVisible);
        
        // Hide brush size if open
        if (this.colorPickerVisible && this.brushSizeVisible) {
            this.hideBrushSize();
        }
    }

    toggleBrushSize() {
        this.brushSizeVisible = !this.brushSizeVisible;
        this.brushSizeContainer.setVisible(this.brushSizeVisible);
        
        // Hide color picker if open
        if (this.brushSizeVisible && this.colorPickerVisible) {
            this.hideColorPicker();
        }
    }

    hideColorPicker() {
        this.colorPickerVisible = false;
        this.colorPickerContainer.setVisible(false);
    }

    hideBrushSize() {
        this.brushSizeVisible = false;
        this.brushSizeContainer.setVisible(false);
    }

    createArtTools() {
        const toolsY = this.game.canvas.height - 80;

        // Clear canvas button
        const clearButton = this.add.text(this.game.canvas.width / 2 - 60, toolsY, '🗑️ Clear', {
            fontSize: '14px',
            fill: '#FFFFFF',
            fontFamily: 'sans-serif',
            backgroundColor: '#E91E63',
            padding: { x: 12, y: 6 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        clearButton.on('pointerdown', () => {
            this.clearCanvas();
        });
    }

    selectColor(color) {
        this.currentColor = color;
        
        // Update color picker button
        this.colorPickerBtn.setStyle({ backgroundColor: color });
        
        const colorNames = {
            '#F472B6': 'Rose Pink',
            '#EC4899': 'Deep Pink',
            '#BE185D': 'Berry Pink',
            '#F59E0B': 'Warm Orange',
            '#EF4444': 'Gentle Red',
            '#A855F7': 'Soft Purple',
            '#F97316': 'Sunset Orange',
            '#C084FC': 'Lavender',
            '#FBBF24': 'Golden Yellow',
            '#10B981': 'Mint Green'
        };
    }

    selectBrushSize(size) {
        this.currentBrushSize = size;
        
        // Update brush size button
        this.brushSizeBtn.setText(`🖌️ Size: ${size}`);
    }

    createStatsDisplay() {
        // Session stats
        this.strokesDisplay = this.add.text(10, this.game.canvas.height - 80, 'Strokes: 0', {
            fontSize: '10px',
            fill: '#A21CAF',
            fontFamily: 'sans-serif'
        });

        this.timeDisplay = this.add.text(10, this.game.canvas.height - 60, 'Time: 0:00', {
            fontSize: '10px',
            fill: '#A21CAF',
            fontFamily: 'sans-serif'
        });
    }

    createBackButton() {
        const backButton = this.add.text(30, this.game.canvas.height - 30, '← Back', {
            fontSize: '16px',
            fill: '#BE185D',
            fontFamily: 'sans-serif'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        backButton.on('pointerdown', () => {
            this.scene.start('Start');
        });
    }

    update() {
        // Update session time display periodically
        if (this.time.now - this.startTime > this.sessionTime * 1000 + 1000) {
            this.updateStats();
        }
    }

    startDrawing(pointer) {
        this.isDrawing = true;
        const localPoint = this.getLocalPoint(pointer);
        this.lastDrawPoint = localPoint;
        
        // Start a new stroke
        this.currentStroke = {
            points: [localPoint],
            color: this.currentColor,
            size: this.currentBrushSize,
            timestamp: Date.now()
        };
        
        // Draw initial dot
        this.drawBrush(localPoint.x, localPoint.y);
        this.totalStrokes++;
        this.updateStats();
    }

    continueDraw(pointer) {
        if (!this.isDrawing || !this.currentStroke) return;
        
        const localPoint = this.getLocalPoint(pointer);
        
        if (this.lastDrawPoint) {
            // Add point to current stroke
            this.currentStroke.points.push(localPoint);
            
            // Draw line from last point to current point for smooth drawing
            this.drawLine(this.lastDrawPoint, localPoint);
        }
        
        this.lastDrawPoint = localPoint;
    }

    stopDrawing() {
        if (this.isDrawing && this.currentStroke) {
            // Save the completed stroke
            this.strokeHistory.push(this.currentStroke);
            this.currentStroke = null;
            
            // Save to localStorage
            this.saveDrawingToStorage();
        }
        
        this.isDrawing = false;
        this.lastDrawPoint = null;
    }

    getLocalPoint(pointer) {
        // Convert global pointer position to local canvas coordinates
        return {
            x: pointer.x - this.canvasBounds.left,
            y: pointer.y - this.canvasBounds.top
        };
    }

    drawBrush(x, y) {
        // Create a temporary graphics object for the brush stroke
        const graphics = this.add.graphics();
        graphics.fillStyle(Phaser.Display.Color.HexStringToColor(this.currentColor).color);
        graphics.fillCircle(0, 0, this.currentBrushSize / 2);
        
        // Draw the brush stroke to the canvas
        this.artCanvas.draw(graphics, x, y);
        graphics.destroy();
    }

    drawLine(from, to) {
        // Create smooth line between points
        const distance = Phaser.Math.Distance.Between(from.x, from.y, to.x, to.y);
        const steps = Math.max(1, Math.floor(distance / 2));
        
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = Phaser.Math.Interpolation.Linear([from.x, to.x], t);
            const y = Phaser.Math.Interpolation.Linear([from.y, to.y], t);
            this.drawBrush(x, y);
        }
    }

    updateColorSelection(selectedCircle) {
        // Reset all color buttons
        this.colorButtons.forEach(({ circle }) => {
            circle.setScale(1);
            circle.setStrokeStyle(2, 0xFFFFFF);
        });
        
        // Highlight selected color
        selectedCircle.setScale(1.2);
        selectedCircle.setStrokeStyle(3, 0x000000);
    }

    updateBrushSelection(selectedButton) {
        // Reset all brush buttons
        this.brushButtons.forEach(({ button }) => {
            button.setScale(1);
            button.setStrokeStyle(1, 0xBE185D);
        });
        
        // Highlight selected brush
        selectedButton.setScale(1.2);
        selectedButton.setStrokeStyle(2, 0x000000);
    }

    showColorEmotion(emotion) {
        // Show a brief message about the color's emotional association
        const emotionText = this.add.text(this.game.canvas.width / 2, this.artCanvas.y - 30, `✨ ${emotion}`, {
            fontSize: '14px',
            fill: '#BE185D',
            fontFamily: 'sans-serif'
        }).setOrigin(0.5).setAlpha(0);

        // Fade in and out
        this.tweens.add({
            targets: emotionText,
            alpha: 1,
            duration: 300,
            yoyo: true,
            hold: 1000,
            onComplete: () => emotionText.destroy()
        });
    }

    showColorPreview(colorName) {
        if (this.colorPreviewText) {
            this.colorPreviewText.destroy();
        }
        
        this.colorPreviewText = this.add.text(this.game.canvas.width / 2, this.artCanvas.y - 15, colorName, {
            fontSize: '12px',
            fill: '#A21CAF',
            fontFamily: 'sans-serif'
        }).setOrigin(0.5);
    }

    hideColorPreview() {
        if (this.colorPreviewText) {
            this.colorPreviewText.destroy();
            this.colorPreviewText = null;
        }
    }

    clearCanvas() {
        // Clear the drawing canvas
        this.artCanvas.clear();
        this.artCanvas.fill(0xFFFBFE);
        this.totalStrokes = 0;
        this.strokeHistory = []; // Clear stroke history
        this.updateStats();
        
        // Clear saved drawing data
        this.clearSavedDrawing();
        
        // Show confirmation
        const clearText = this.add.text(this.game.canvas.width / 2, this.artCanvas.y, '✨ Fresh Canvas!', {
            fontSize: '18px',
            fill: '#BE185D',
            fontFamily: 'sans-serif'
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({
            targets: clearText,
            alpha: 1,
            duration: 300,
            yoyo: true,
            hold: 800,
            onComplete: () => clearText.destroy()
        });
    }

    saveArtwork() {
        // Save the current drawing
        this.saveDrawingToStorage();
        
        // Show save confirmation
        const saveText = this.add.text(this.game.canvas.width / 2, this.artCanvas.y, '💾 Artwork Saved!', {
            fontSize: '18px',
            fill: '#BE185D',
            fontFamily: 'sans-serif'
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({
            targets: saveText,
            alpha: 1,
            duration: 300,
            yoyo: true,
            hold: 1000,
            onComplete: () => saveText.destroy()
        });

        // Update progress (could be used for achievements)
        this.updateProgress();
    }

    updateStats() {
        this.sessionTime = Math.floor((this.time.now - this.startTime) / 1000);
    }

    updateProgress() {
        // Save session data for progress tracking
        const sessionData = {
            strokes: this.totalStrokes,
            time: this.sessionTime,
            date: new Date().toISOString()
        };
        
        // Store in localStorage (simple progress tracking)
        let artHistory = JSON.parse(localStorage.getItem('colorTherapyHistory') || '[]');
        artHistory.push(sessionData);
        
        // Keep only last 10 sessions
        if (artHistory.length > 10) {
            artHistory = artHistory.slice(-10);
        }
        
        localStorage.setItem('colorTherapyHistory', JSON.stringify(artHistory));
    }

    saveDrawingToStorage() {
        try {
            const drawingData = {
                strokes: this.strokeHistory,
                totalStrokes: this.totalStrokes,
                lastSaved: new Date().toISOString(),
                sessionTime: this.sessionTime,
                currentColor: this.currentColor,
                currentBrushSize: this.currentBrushSize
            };
            
            localStorage.setItem('colorTherapyDrawing', JSON.stringify(drawingData));
            
        } catch (error) {
            console.warn('Could not save drawing to localStorage:', error);
        }
    }

    loadSavedDrawing() {
        try {
            const savedData = localStorage.getItem('colorTherapyDrawing');
            if (savedData) {
                const drawingData = JSON.parse(savedData);
                
                // Restore user preferences
                if (drawingData.currentColor) {
                    this.currentColor = drawingData.currentColor;
                    this.colorPickerBtn.setStyle({ backgroundColor: this.currentColor });
                }
                
                if (drawingData.currentBrushSize) {
                    this.currentBrushSize = drawingData.currentBrushSize;
                    this.brushSizeBtn.setText(`🖌️ Size: ${this.currentBrushSize}`);
                }
                
                // Restore session data
                this.totalStrokes = drawingData.totalStrokes || 0;
                this.strokeHistory = drawingData.strokes || [];
                
                // Redraw all saved strokes
                if (this.strokeHistory.length > 0) {
                    this.redrawCanvas();
                    
                    // Show load confirmation briefly
                    const loadText = this.add.text(this.game.canvas.width / 2, this.artCanvas.y - 50, '📂 Drawing Restored!', {
                        fontSize: '14px',
                        fill: '#BE185D',
                        fontFamily: 'sans-serif'
                    }).setOrigin(0.5).setAlpha(0);

                    this.tweens.add({
                        targets: loadText,
                        alpha: 1,
                        duration: 300,
                        yoyo: true,
                        hold: 1500,
                        onComplete: () => loadText.destroy()
                    });
                }
                
                this.canvasLoaded = true;
                this.updateStats();
            } else {
                this.canvasLoaded = true;
            }
        } catch (error) {
            console.warn('Could not load saved drawing:', error);
            this.canvasLoaded = true;
        }
    }

    redrawCanvas() {
        // Clear canvas first
        this.artCanvas.clear();
        this.artCanvas.fill(0xFFFBFE);
        
        // Redraw all strokes
        this.strokeHistory.forEach(stroke => {
            const originalColor = this.currentColor;
            const originalSize = this.currentBrushSize;
            
            // Set stroke properties
            this.currentColor = stroke.color;
            this.currentBrushSize = stroke.size;
            
            // Draw each point in the stroke
            stroke.points.forEach((point, index) => {
                if (index === 0) {
                    // First point, just draw a dot
                    this.drawBrush(point.x, point.y);
                } else {
                    // Draw line from previous point
                    const prevPoint = stroke.points[index - 1];
                    this.drawLine(prevPoint, point);
                }
            });
            
            // Restore original settings
            this.currentColor = originalColor;
            this.currentBrushSize = originalSize;
        });
    }

    autoSaveDrawing() {
        // Auto-save every few strokes to prevent data loss
        if (this.totalStrokes % 5 === 0 && this.canvasLoaded && this.strokeHistory.length > 0) {
            this.saveDrawingToStorage();
        }
    }

    // Override scene shutdown to save data
    shutdown() {
        // Save drawing when leaving the scene
        if (this.canvasLoaded && this.strokeHistory.length > 0) {
            this.saveDrawingToStorage();
        }
        super.shutdown();
    }
}