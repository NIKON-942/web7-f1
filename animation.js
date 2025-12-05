class AnimationController {
    constructor() {
        this.eventCounter = 0;
        this.events = [];
        this.circle = null;
        this.animationInterval = null;
        this.currentStep = 1;
        this.currentDirection = 0;
        this.visitedQuadrants = new Set();
        this.isAnimating = false;

        this.animArea = null;
        this.circleX = 0;
        this.circleY = 0;

        this.originalBlock5Content = null;
    }

    init() {
        const block3 = document.getElementById('block3');
        const playBtn = document.createElement('button');
        playBtn.id = 'playBtn';
        playBtn.className = 'play-button';
        playBtn.textContent = 'Play';
        playBtn.onclick = () => this.showWorkspace();
        block3.appendChild(playBtn);
    }

    async showWorkspace() {
        const block5 = document.getElementById('block5_main');

        this.originalBlock5Content = block5.innerHTML;

        try {
            await fetch('clear_events.php', { method: 'POST' });
            console.log('Server events cleared');
        } catch (error) {
            console.error('Error clearing server events:', error);
        }

        block5.innerHTML = '';
        block5.className = 'animation-workspace';

        const controls = document.createElement('div');
        controls.id = 'controls';
        controls.className = 'controls-area';

        const messageDiv = document.createElement('div');
        messageDiv.id = 'eventMessage';
        messageDiv.className = 'event-message';
        controls.appendChild(messageDiv);

        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'button-container';

        const startBtn = document.createElement('button');
        startBtn.id = 'startBtn';
        startBtn.className = 'control-button';
        startBtn.textContent = 'Start';
        startBtn.onclick = () => this.startAnimation();

        const closeBtn = document.createElement('button');
        closeBtn.id = 'closeBtn';
        closeBtn.className = 'control-button close-button';
        closeBtn.textContent = 'Close';
        closeBtn.onclick = () => this.closeWorkspace();

        buttonContainer.appendChild(startBtn);
        buttonContainer.appendChild(closeBtn);
        controls.appendChild(buttonContainer);

        const animArea = document.createElement('div');
        animArea.id = 'anim';
        animArea.className = 'anim-area';

        const quadrants = [
            { class: 'quadrant q1' },
            { class: 'quadrant q2' },
            { class: 'quadrant q3' },
            { class: 'quadrant q4' }
        ];

        quadrants.forEach((q, index) => {
            const quad = document.createElement('div');
            quad.className = q.class;
            quad.dataset.quadrant = index;
            animArea.appendChild(quad);
        });

        this.circle = document.createElement('div');
        this.circle.id = 'animCircle';
        this.circle.className = 'circle';
        animArea.appendChild(this.circle);

        block5.appendChild(controls);
        block5.appendChild(animArea);

        this.animArea = animArea;

        setTimeout(() => {
            const rect = animArea.getBoundingClientRect();
            this.circleX = (animArea.offsetWidth / 2);
            this.circleY = (animArea.offsetHeight / 2);
            this.updateCirclePosition();
        }, 100);

        this.logEvent('Play button clicked');
    }

    startAnimation() {
        const startBtn = document.getElementById('startBtn');
        startBtn.disabled = true;

        this.logEvent('Start button clicked');

        this.currentStep = 1;
        this.currentDirection = 0;
        this.visitedQuadrants.clear();
        this.isAnimating = true;

        this.animationInterval = setInterval(() => {
            this.moveCircle();
        }, 300);
    }

    moveCircle() {
        if (!this.isAnimating) return;

        switch (this.currentDirection) {
            case 0:
                this.circleX -= this.currentStep;
                break;
            case 1:
                this.circleY -= this.currentStep;
                break;
            case 2:
                this.circleX += this.currentStep;
                break;
            case 3:
                this.circleY += this.currentStep;
                break;
        }

        this.updateCirclePosition();
        this.checkQuadrant();
        this.logEvent(`Circle moved ${this.currentStep}px, step ${this.currentStep}`);

        this.currentDirection = (this.currentDirection + 1) % 4;
        this.currentStep++;

        const circleRadius = 10;
        if (this.circleX - circleRadius < 0 ||
            this.circleX + circleRadius > this.animArea.offsetWidth ||
            this.circleY - circleRadius < 0 ||
            this.circleY + circleRadius > this.animArea.offsetHeight) {
            this.stopAnimation();
            return;
        }

        if (this.visitedQuadrants.size >= 4) {
            this.stopAnimation();
        }
    }

    updateCirclePosition() {
        if (this.circle) {
            this.circle.style.left = `${this.circleX}px`;
            this.circle.style.top = `${this.circleY}px`;
        }
    }

    checkQuadrant() {
        const width = this.animArea.offsetWidth;
        const height = this.animArea.offsetHeight;
        const radius = 10;

        const circleLeft = this.circleX - radius;
        const circleRight = this.circleX + radius;
        const circleTop = this.circleY - radius;
        const circleBottom = this.circleY + radius;

        const midX = width / 2;
        const midY = height / 2;

        let quadrant = -1;

        if (circleRight < midX && circleBottom < midY && circleLeft >= 0 && circleTop >= 0) {
            quadrant = 0;
        }
        else if (circleLeft >= midX && circleBottom < midY && circleRight <= width && circleTop >= 0) {
            quadrant = 1;
        }
        else if (circleRight < midX && circleTop >= midY && circleLeft >= 0 && circleBottom <= height) {
            quadrant = 2;
        }
        else if (circleLeft >= midX && circleTop >= midY && circleRight <= width && circleBottom <= height) {
            quadrant = 3;
        }

        if (quadrant >= 0 && !this.visitedQuadrants.has(quadrant)) {
            this.visitedQuadrants.add(quadrant);
            this.logEvent(`Circle fully entered quadrant ${quadrant + 1}`);
        }
    }

    stopAnimation() {
        this.isAnimating = false;
        clearInterval(this.animationInterval);
        this.logEvent('Animation stopped');

        const startBtn = document.getElementById('startBtn');
        const reloadBtn = document.createElement('button');
        reloadBtn.id = 'reloadBtn';
        reloadBtn.className = 'control-button';
        reloadBtn.textContent = 'Reload';
        reloadBtn.onclick = () => this.reloadAnimation();

        startBtn.parentNode.replaceChild(reloadBtn, startBtn);
    }

    reloadAnimation() {
        this.logEvent('Reload button clicked');

        this.circleX = this.animArea.offsetWidth / 2;
        this.circleY = this.animArea.offsetHeight / 2;
        this.updateCirclePosition();

        const reloadBtn = document.getElementById('reloadBtn');
        const startBtn = document.createElement('button');
        startBtn.id = 'startBtn';
        startBtn.className = 'control-button';
        startBtn.textContent = 'Start';
        startBtn.disabled = false;
        startBtn.onclick = () => this.startAnimation();

        reloadBtn.parentNode.replaceChild(startBtn, reloadBtn);

        this.currentStep = 1;
        this.currentDirection = 0;
        this.visitedQuadrants.clear();
    }

    async logEvent(message) {
        this.eventCounter++;
        const localTime = new Date().toISOString();

        const eventData = {
            eventNum: this.eventCounter,
            message: message,
            localTime: localTime
        };

        const messageDiv = document.getElementById('eventMessage');
        if (messageDiv) {
            messageDiv.textContent = `#${this.eventCounter}: ${message}`;
        }

        this.events.push(eventData);
        localStorage.setItem('animationEvents', JSON.stringify(this.events));

        try {
            console.log('Attempting to save event to server:', this.eventCounter, message);
            const response = await fetch('save_event.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    eventNum: this.eventCounter,
                    message: message
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Server saved successfully:', result);

            if (!result.success) {
                console.error('Server returned error:', result.error);
            }
        } catch (error) {
            console.error('Error saving to server:', error);
            console.error('Event that failed:', this.eventCounter, message);
            if (this.eventCounter === 1) {
                alert('Помилка з\'єднання з сервером!\nПереконайтеся що PHP сервер запущений: php -S localhost:8000\nДивіться консоль (F12) для деталей.');
            }
        }
    }

    async closeWorkspace() {
        this.logEvent('Close button clicked');

        if (this.isAnimating) {
            clearInterval(this.animationInterval);
            this.isAnimating = false;
        }

        await new Promise(resolve => setTimeout(resolve, 500));

        const localEvents = JSON.parse(localStorage.getItem('animationEvents') || '[]');
        console.log('Local events count:', localEvents.length);

        let serverEvents = [];
        try {
            console.log('Fetching events from server...');
            const response = await fetch('get_events.php');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            serverEvents = await response.json();
            console.log('Server events count:', serverEvents.length);
        } catch (error) {
            console.error('Error fetching server events:', error);
            console.warn('Server events will be empty in comparison table');
        }

        this.displayResults(localEvents, serverEvents);

        this.events = [];
        this.eventCounter = 0;
        localStorage.removeItem('animationEvents');
    }

    displayResults(localEvents, serverEvents) {
        const block5 = document.getElementById('block5_main');
        block5.innerHTML = '';
        block5.className = 'white content_div';

        const title = document.createElement('h2');
        title.textContent = 'Event Storage Comparison Results';
        block5.appendChild(title);

        const table = document.createElement('table');
        table.className = 'results-table';

        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th colspan="3">LocalStorage Events</th>
                <th colspan="3">Server Events</th>
            </tr>
            <tr>
                <th>#</th>
                <th>Message</th>
                <th>Time</th>
                <th>#</th>
                <th>Message</th>
                <th>Time</th>
            </tr>
        `;
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        const maxRows = Math.max(localEvents.length, serverEvents.length);

        for (let i = 0; i < maxRows; i++) {
            const row = document.createElement('tr');

            if (i < localEvents.length) {
                const local = localEvents[i];
                row.innerHTML += `
                    <td>${local.eventNum}</td>
                    <td>${local.message}</td>
                    <td>${new Date(local.localTime).toLocaleTimeString('uk-UA')}</td>
                `;
            } else {
                row.innerHTML += '<td></td><td></td><td></td>';
            }

            if (i < serverEvents.length) {
                const server = serverEvents[i];
                row.innerHTML += `
                    <td>${server.eventNum}</td>
                    <td>${server.message}</td>
                    <td>${server.serverTime}</td>
                `;
            } else {
                row.innerHTML += '<td></td><td></td><td></td>';
            }

            tbody.appendChild(row);
        }

        table.appendChild(tbody);
        block5.appendChild(table);

        const backBtn = document.createElement('button');
        backBtn.textContent = 'Back to Main Page';
        backBtn.className = 'control-button';
        backBtn.onclick = () => {
            block5.innerHTML = this.originalBlock5Content;
            block5.className = 'white content_div';
        };
        block5.appendChild(backBtn);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const controller = new AnimationController();
    controller.init();
});
