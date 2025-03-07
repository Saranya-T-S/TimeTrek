function startGame(gameType, topic) {
    const gameContainer = document.getElementById('game-container');
    if (!gameContainer) {
        console.error('Game container not found');
        return;
    }
    
    // Clear existing game if any
    gameContainer.innerHTML = '';
    gameContainer.classList.add('active');
    
    // Show loading state
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading';
    loadingDiv.innerHTML = `
        <i class="fas fa-spinner fa-spin"></i>
        <p>Loading ${topic} ${gameType} game...</p>
    `;
    gameContainer.appendChild(loadingDiv);
    
    // Create and initialize new game with a slight delay to show loading
    setTimeout(() => {
        try {
            // Check if MiniGame class exists
            if (typeof MiniGame !== 'function') {
                throw new Error('MiniGame class not loaded');
            }

            // Create new game instance
            const game = new MiniGame(gameType, topic);
            if (!game || !game.gameContainer) {
                throw new Error('Game initialization failed');
            }

            // Clear loading and append game
            gameContainer.innerHTML = '';
            gameContainer.appendChild(game.gameContainer);

            // Scroll to game container with offset
            const offset = 100;
            const topPosition = gameContainer.offsetTop - offset;
            
            window.scrollTo({
                top: topPosition,
                behavior: 'smooth'
            });

            // Announce for screen readers
            announceToScreenReader(`${topic} ${gameType} game started. Good luck!`);
        } catch (error) {
            console.error('Game loading error:', error);
            gameContainer.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Sorry, there was an error loading the game: ${error.message}</p>
                    <button onclick="retryGame('${gameType}', '${topic}')" class="retry-btn">
                        <i class="fas fa-redo"></i> Try Again
                    </button>
                </div>
            `;
        }
    }, 500);
}

function retryGame(gameType, topic) {
    startGame(gameType, topic);
}

function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    setTimeout(() => announcement.remove(), 3000);
}

// Add close game functionality
function closeGame() {
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
        gameContainer.classList.remove('active');
        gameContainer.innerHTML = '';
        announceToScreenReader('Game closed');
    }
} 