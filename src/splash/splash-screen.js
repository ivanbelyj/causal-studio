const { BrowserWindow, screen } = require('electron');

// Warning: this class is ai-generated
export class SplashScreen {
    constructor(htmlPath, options = {}) {
        this.splashWindow = null;
        this.htmlPath = htmlPath;
        this.isClosing = false;

        this.options = {
            width: 600,
            height: 400,
            transparent: false,
            frame: false,
            alwaysOnTop: false,
            show: false,
            resizable: false,
            movable: true,
            enableLargerThanScreen: false,
            hasShadow: false,
            title: 'Causal Studio',
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                sandbox: true,
                enablePreferredSizeMode: true,
            },
            ...options
        };
    }

    async show() {
        return new Promise((resolve) => {
            this.splashWindow = new BrowserWindow(this.options);
            this.splashWindow.setOpacity(0); // Start with transparent window

            // Centering before showing
            this.centerSplash();

            this.splashWindow.loadFile(this.htmlPath);

            this.splashWindow.once('ready-to-show', () => {
                this.splashWindow.show();
                this.fadeIn().then(resolve);
            });

            this.splashWindow.on('close', (e) => {
                if (!this.isClosing) {
                    e.preventDefault();
                }
            });
        });
    }

    centerSplash() {
        const primaryDisplay = screen.getPrimaryDisplay();
        const { width, height } = primaryDisplay.workAreaSize;
        const [splashWidth, splashHeight] = this.splashWindow.getSize();
        const x = Math.floor((width - splashWidth) / 2);
        const y = Math.floor((height - splashHeight) / 2);
        this.splashWindow.setPosition(x, y);
    }

    fadeIn(duration = 800) {
        return new Promise((resolve) => {
            const startTime = Date.now();
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easeProgress = this.easeInOutQuad(progress);

                this.splashWindow.setOpacity(easeProgress);

                if (progress < 1) {
                    setTimeout(animate, 16);
                } else {
                    resolve();
                }
            };
            animate();
        });
    }

    async hide(duration = 800) {
        return new Promise((resolve) => {
            this.isClosing = true;
            const startTime = Date.now();

            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easeProgress = this.easeInOutQuad(progress);

                this.splashWindow.setOpacity(1 - easeProgress);

                if (progress < 1) {
                    setTimeout(animate, 16);
                } else {
                    this.splashWindow.destroy();
                    this.splashWindow = null;
                    resolve();
                }
            };

            animate();
        });
    }

    easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }
}