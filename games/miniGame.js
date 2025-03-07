class MiniGame {
    constructor(gameType, topic) {
        this.gameType = gameType;
        this.topic = topic;
        this.score = 0;
        this.currentQuestion = 0;
        this.gameContainer = document.createElement('div');
        this.gameContainer.className = 'mini-game-container';
        this.initializeGame();
    }

    initializeGame() {
        switch(this.gameType) {
            case 'timeline':
                this.createTimelineGame();
                break;
            case 'quiz':
                this.createQuizGame();
                break;
            case 'matching':
                this.createMatchingGame();
                break;
        }
    }

    createTimelineGame() {
        const events = this.getTimelineEvents();
        this.gameContainer.innerHTML = `
            <div class="timeline-game" role="application" aria-label="Timeline sorting game">
                <h2>Arrange the Events in Chronological Order</h2>
                <div class="timeline-events" role="list">
                    ${events.map(event => `
                        <div class="timeline-event" 
                             draggable="true" 
                             role="listitem"
                             aria-grabbed="false"
                             data-date="${event.date}">
                            <p>${event.description}</p>
                            <span class="event-date">${event.date}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="timeline-dropzone" role="region" aria-label="Timeline dropzone">
                    <p class="dropzone-text">Place events here in order from earliest to latest</p>
                </div>
                <button class="check-answer" aria-label="Check answer">Check Answer</button>
            </div>
        `;
        this.initializeTimelineDragDrop();
    }

    createQuizGame() {
        const question = this.getQuizQuestion();
        this.gameContainer.innerHTML = `
            <div class="quiz-game" role="form" aria-labelledby="quiz-question">
                <h2 id="quiz-question">${question.text}</h2>
                <div class="options" role="radiogroup" aria-label="Answer options">
                    ${question.options.map((option, index) => `
                        <label class="option">
                            <input type="radio" 
                                   name="quiz-answer" 
                                   value="${index}"
                                   aria-label="Option ${index + 1}: ${option}">
                            <span>${option}</span>
                        </label>
                    `).join('')}
                </div>
                <button class="submit-answer" aria-label="Submit answer">Submit</button>
                <div class="feedback" role="alert" aria-live="polite"></div>
            </div>
        `;
        this.initializeQuizHandlers();
    }

    createMatchingGame() {
        const pairs = this.getMatchingPairs();
        
        this.gameContainer.innerHTML = `
            <div class="matching-game" role="application" aria-label="Matching game">
                <h2>Match the States with their Maps</h2>
                <p class="game-instruction">Drag the state names from the right to match with their maps on the left</p>
                
                <div class="matching-container">
                    <div class="maps-section">
                        ${pairs.map(pair => `
                            <div class="map-card" 
                                 data-id="${pair.id}"
                                 role="button"
                                 aria-label="Map of ${pair.definition}">
                                <img src="${pair.term}" alt="Map of ${pair.definition}" class="state-map">
                                <div class="drop-zone" data-id="${pair.id}">
                                    <p class="drop-hint">Drop state name here</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <div class="names-section">
                        ${pairs.map(pair => `
                            <div class="name-card" 
                                 draggable="true"
                                 data-id="${pair.id}"
                                 role="button"
                                 aria-label="${pair.definition}">
                                <p class="state-name">${pair.definition}</p>
                                <p class="state-hint">${pair.description}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        this.initializeMatchingDragDrop();
    }

    initializeMatchingDragDrop() {
        const nameCards = this.gameContainer.querySelectorAll('.name-card');
        const dropZones = this.gameContainer.querySelectorAll('.drop-zone');

        nameCards.forEach(card => {
            card.addEventListener('dragstart', (e) => {
                card.classList.add('dragging');
                e.dataTransfer.setData('text/plain', card.dataset.id);
            });

            card.addEventListener('dragend', () => {
                card.classList.remove('dragging');
            });
        });

        dropZones.forEach(zone => {
            zone.addEventListener('dragover', (e) => {
                e.preventDefault();
                zone.classList.add('dragover');
            });

            zone.addEventListener('dragleave', () => {
                zone.classList.remove('dragover');
            });

            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                zone.classList.remove('dragover');
                const cardId = e.dataTransfer.getData('text/plain');
                const draggedCard = this.gameContainer.querySelector(`.name-card[data-id="${cardId}"]`);
                
                if (zone.dataset.id === cardId) {
                    // Correct match
                    zone.innerHTML = draggedCard.innerHTML;
                    zone.classList.add('matched');
                    draggedCard.remove();
                    
                    // Check if all matched
                    const allMatched = Array.from(dropZones).every(z => z.classList.contains('matched'));
                    if (allMatched) {
                        gamification.addPoints(100, 'matching');
                        this.announce('Congratulations! All states have been matched correctly!');
                    }
                } else {
                    this.announce('Not a match, try again!');
                }
            });
        });
    }

    // Game-specific handlers
    initializeTimelineDragDrop() {
        const events = this.gameContainer.querySelectorAll('.timeline-event');
        const dropzone = this.gameContainer.querySelector('.timeline-dropzone');

        events.forEach(event => {
            event.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', event.dataset.date);
                event.setAttribute('aria-grabbed', 'true');
                this.announce(`Dragging event: ${event.textContent}`);
            });

            event.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    // Keyboard drag and drop implementation
                    this.handleKeyboardDragDrop(event);
                }
            });
        });

        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('dragover');
        });

        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            const date = e.dataTransfer.getData('text/plain');
            const event = document.querySelector(`[data-date="${date}"]`);
            dropzone.appendChild(event);
            this.announce(`Event dropped: ${event.textContent}`);
            this.checkTimelineOrder();
        });
    }

    initializeQuizHandlers() {
        const submitButton = this.gameContainer.querySelector('.submit-answer');
        const feedback = this.gameContainer.querySelector('.feedback');

        submitButton.addEventListener('click', () => {
            const selected = this.gameContainer.querySelector('input[name="quiz-answer"]:checked');
            if (!selected) {
                this.announce('Please select an answer');
                return;
            }

            const isCorrect = this.checkQuizAnswer(selected.value);
            feedback.textContent = isCorrect ? 'Correct!' : 'Try again!';
            this.announce(feedback.textContent);
            
            if (isCorrect) {
                gamification.addPoints(100, 'quiz');
                this.nextQuestion();
            }
        });
    }

    // Utility functions
    announce(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        this.gameContainer.appendChild(announcement);
        setTimeout(() => announcement.remove(), 3000);
    }

    checkTimelineOrder() {
        const events = Array.from(this.gameContainer.querySelectorAll('.timeline-dropzone .timeline-event'));
        const isOrdered = events.every((event, index) => {
            if (index === 0) return true;
            const prevDate = new Date(events[index - 1].dataset.date);
            const currentDate = new Date(event.dataset.date);
            return prevDate <= currentDate;
        });

        if (isOrdered && events.length > 1) {
            gamification.addPoints(50, 'timeline');
            this.announce('Timeline ordered correctly! Well done!');
        }
    }

    // Sample data methods (replace with actual data)
    getTimelineEvents() {
        return [
            { date: '1776', description: 'Declaration of Independence' },
            { date: '1787', description: 'Constitution Signed' },
            { date: '1803', description: 'Louisiana Purchase' }
        ];
    }

    getQuizQuestion() {
        const questions = {
            history: [
                {
                    text: 'Who is known as the Iron Man of India?',
                    options: [
                        'Sardar Vallabhbhai Patel',
                        'Jawaharlal Nehru',
                        'Subhas Chandra Bose',
                        'Bhagat Singh'
                    ],
                    correct: 0
                },
                {
                    text: 'The Quit India Movement was launched in which year?',
                    options: ['1940', '1942', '1943', '1945'],
                    correct: 1
                }
            ],
            geography: [
                {
                    text: 'Which is the largest state of India by area?',
                    options: [
                        'Rajasthan',
                        'Madhya Pradesh',
                        'Maharashtra',
                        'Uttar Pradesh'
                    ],
                    correct: 0
                }
            ],
            civics: [
                {
                    text: 'Who was the chairman of the Constitution Drafting Committee?',
                    options: [
                        'Dr. B.R. Ambedkar',
                        'Jawaharlal Nehru',
                        'Rajendra Prasad',
                        'Sardar Patel'
                    ],
                    correct: 0
                }
            ]
        };

        // Return a random question based on the topic
        const topicQuestions = questions[this.topic.toLowerCase()] || questions.history;
        return topicQuestions[Math.floor(Math.random() * topicQuestions.length)];
    }

    getMatchingPairs() {
        if (this.topic.toLowerCase() === 'geography') {
            return [
                { 
                    id: 1, 
                    term: 'https://static.thenounproject.com/png/6626795-200.png', 
                    definition: 'Rajasthan',
                    isImage: true,
                    description: 'Largest state by area, known for Thar Desert'
                },
                { 
                    id: 2, 
                    term: 'https://static.thenounproject.com/png/3177568-200.png', 
                    definition: 'Tamil Nadu',
                    isImage: true,
                    description: 'Southernmost state, known for temples and culture'
                },
                { 
                    id: 3, 
                    term: 'https://static.thenounproject.com/png/3177559-200.png', 
                    definition: 'Gujarat',
                    isImage: true,
                    description: 'Westernmost state, known for longest coastline'
                }
            ];
        }
        // Return default pairs for other topics
        return [
            { id: 1, term: 'Democracy', definition: 'Government by the people' },
            { id: 2, term: 'Republic', definition: 'Representative government' },
            { id: 3, term: 'Federation', definition: 'Union of states' }
        ];
    }
} 