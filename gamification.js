class GamificationSystem {
    constructor() {
        this.points = 0;
        this.level = 1;
        this.streak = 0;
        this.badges = new Set();
        this.loadProgress();
        this.initializeAudio();
    }

    // Audio feedback for gamification events
    initializeAudio() {
        this.sounds = {
            pointsEarned: new Audio('assets/sounds/points.mp3'),
            badgeEarned: new Audio('assets/sounds/badge.mp3'),
            levelUp: new Audio('assets/sounds/levelup.mp3'),
            streakContinued: new Audio('assets/sounds/streak.mp3')
        };
    }

    // Point system
    addPoints(amount, category) {
        this.points += amount;
        this.checkLevelUp();
        this.updateUI();
        
        // Announce points earned for screen readers
        this.announce(`Earned ${amount} points in ${category}. Total points: ${this.points}`);
        this.sounds.pointsEarned.play();
    }

    // Streak system
    updateStreak(completed) {
        if (completed) {
            this.streak++;
            if (this.streak % 5 === 0) {
                this.awardBadge('streak', `${this.streak} Day Streak!`);
            }
            this.sounds.streakContinued.play();
        } else {
            this.streak = 0;
        }
        this.updateUI();
    }

    // Level system
    checkLevelUp() {
        const newLevel = Math.floor(this.points / 1000) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            this.sounds.levelUp.play();
            this.announce(`Congratulations! You've reached level ${this.level}!`);
            this.awardBadge('level', `Level ${this.level} Scholar`);
        }
    }

    // Badge system
    awardBadge(type, name) {
        if (!this.badges.has(name)) {
            this.badges.add(name);
            this.sounds.badgeEarned.play();
            this.announce(`New badge earned: ${name}`);
            this.showBadgeNotification(name);
            this.saveProgress();
        }
    }

    // Achievement tracking
    trackAchievement(category, action) {
        const achievements = {
            history: {
                timelinesMastered: 'Timeline Master',
                periodsCompleted: 'History Explorer',
                quizzesPassed: 'History Scholar'
            },
            geography: {
                mapsCompleted: 'Map Master',
                locationsIdentified: 'Globe Trotter',
                arToursCompleted: 'Virtual Explorer'
            },
            civics: {
                constitutionLessons: 'Constitution Expert',
                governmentSimulations: 'Civic Leader',
                rightsChallenges: 'Rights Champion'
            }
        };

        if (achievements[category]?.[action]) {
            this.awardBadge('achievement', achievements[category][action]);
        }
    }

    // UI Updates
    updateUI() {
        // Update points display
        const pointsDisplay = document.getElementById('points-display');
        if (pointsDisplay) {
            pointsDisplay.textContent = this.points;
            pointsDisplay.setAttribute('aria-label', `Total points: ${this.points}`);
        }

        // Update level display
        const levelDisplay = document.getElementById('level-display');
        if (levelDisplay) {
            levelDisplay.textContent = `Level ${this.level}`;
            levelDisplay.setAttribute('aria-label', `Current level: ${this.level}`);
        }

        // Update streak display
        const streakDisplay = document.getElementById('streak-display');
        if (streakDisplay) {
            streakDisplay.textContent = `${this.streak} day streak`;
            streakDisplay.setAttribute('aria-label', `Current streak: ${this.streak} days`);
        }

        this.saveProgress();
    }

    // Accessibility announcement
    announce(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('class', 'sr-only');
        announcement.textContent = message;
        document.body.appendChild(announcement);
        setTimeout(() => announcement.remove(), 3000);
    }

    // Badge notification
    showBadgeNotification(badgeName) {
        const notification = document.createElement('div');
        notification.className = 'badge-notification';
        notification.innerHTML = `
            <i class="fas fa-award"></i>
            <p>New Badge Earned!</p>
            <p>${badgeName}</p>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
    }

    // Progress persistence
    saveProgress() {
        const progress = {
            points: this.points,
            level: this.level,
            streak: this.streak,
            badges: Array.from(this.badges)
        };
        localStorage.setItem('gamification-progress', JSON.stringify(progress));
    }

    loadProgress() {
        const saved = localStorage.getItem('gamification-progress');
        if (saved) {
            const progress = JSON.parse(saved);
            this.points = progress.points;
            this.level = progress.level;
            this.streak = progress.streak;
            this.badges = new Set(progress.badges);
            this.updateUI();
        }
    }
}

// Initialize gamification system
const gamification = new GamificationSystem();

// Example usage:
// gamification.addPoints(100, 'history');
// gamification.trackAchievement('geography', 'mapsCompleted');
// gamification.updateStreak(true); 