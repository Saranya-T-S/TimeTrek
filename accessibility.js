document.addEventListener('DOMContentLoaded', function() {
    const dialog = document.getElementById('accessibility-dialog');
    
    // Always show dialog when site opens
    dialog.style.display = 'flex';
    
    // Initialize accessibility features
    const saveButton = document.getElementById('save-preferences');
    
    // Function to read text with screen reader
    function readText(text) {
        const utterance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utterance);
    }

    // Initial welcome message and dialog reading
    setTimeout(() => {
        const welcomeMessage = `
            Welcome to TimeTrek. 
            This is an accessibility setup dialog. 
            I will guide you through the available options.
            Use the Tab key to navigate through options.
            Press Enter or Space to select an option.
            Press Escape to close this dialog.
        `;
        readText(welcomeMessage);
        announceToScreenReader(welcomeMessage);
    }, 1000);

    // Add keyboard navigation support
    let focusableElements = dialog.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    // Focus trap in dialog
    dialog.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                if (document.activeElement === firstFocusable) {
                    e.preventDefault();
                    lastFocusable.focus();
                }
            } else {
                if (document.activeElement === lastFocusable) {
                    e.preventDefault();
                    firstFocusable.focus();
                }
            }
        }
    });

    // Read option descriptions when focused
    document.querySelectorAll('.option').forEach(option => {
        const label = option.querySelector('label');
        label.addEventListener('focus', () => {
            const description = getOptionDescription(label.id);
            readText(description);
        });
    });

    // Handle text size buttons
    const textSizeButtons = document.querySelectorAll('.text-size-btn');
    textSizeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const size = button.dataset.size;
            setTextSize(size);
            const message = `Text size set to ${size}`;
            readText(message);
            announceToScreenReader(message);
        });

        // Read description on focus
        button.addEventListener('focus', () => {
            readText(button.getAttribute('aria-label'));
        });
    });

    // Handle contrast buttons
    const contrastButtons = document.querySelectorAll('.contrast-btn');
    contrastButtons.forEach(button => {
        button.addEventListener('click', () => {
            const contrast = button.dataset.contrast;
            setContrast(contrast);
            const message = `Contrast set to ${contrast}`;
            readText(message);
            announceToScreenReader(message);
        });

        // Read description on focus
        button.addEventListener('focus', () => {
            readText(button.getAttribute('aria-label'));
        });
    });

    // Handle checkboxes
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const label = checkbox.parentElement.textContent.trim();
            const message = `${label} ${checkbox.checked ? 'enabled' : 'disabled'}`;
            readText(message);
            announceToScreenReader(message);
        });

        // Read description on focus
        checkbox.addEventListener('focus', () => {
            readText(checkbox.getAttribute('aria-label'));
        });
    });

    // Handle screen reader support
    const screenReaderCheckbox = document.getElementById('screen-reader');
    screenReaderCheckbox.addEventListener('change', () => {
        toggleScreenReader(screenReaderCheckbox.checked);
        announceToScreenReader(
            screenReaderCheckbox.checked ? 
            'Screen reader support enabled' : 
            'Screen reader support disabled'
        );
    });

    // Handle dyslexic font
    const dyslexicFontCheckbox = document.getElementById('dyslexic-font');
    dyslexicFontCheckbox.addEventListener('change', () => {
        toggleDyslexicFont(dyslexicFontCheckbox.checked);
        announceToScreenReader(
            dyslexicFontCheckbox.checked ? 
            'Dyslexia friendly font enabled' : 
            'Dyslexia friendly font disabled'
        );
    });

    // Save preferences and close dialog
    saveButton.addEventListener('click', () => {
        const message = 'Preferences saved. Welcome to TimeTrek! You can always adjust these settings using the accessibility button in the navigation bar.';
        readText(message);
        announceToScreenReader(message);
        savePreferences();
        dialog.style.display = 'none';
    });

    // Keyboard navigation
    dialog.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            dialog.style.display = 'none';
        }
    });
});

function loadSavedPreferences() {
    const preferences = JSON.parse(localStorage.getItem('accessibility-preferences'));
    if (preferences) {
        setTextSize(preferences.textSize);
        setContrast(preferences.highContrast);
        toggleScreenReader(preferences.screenReader);
        toggleDyslexicFont(preferences.dyslexicFont);
    }
}

// Helper function to get detailed descriptions for options
function getOptionDescription(labelId) {
    const descriptions = {
        'text-size-label': 'Text size options. You can choose between normal, large, and extra large text sizes.',
        'contrast-label': 'Contrast options. You can choose between normal and high contrast modes.',
        'reading-support-label': 'Reading support options. You can enable screen reader support and dyslexia-friendly font.'
    };
    return descriptions[labelId] || '';
}

// Utility functions
function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('role', 'status');
    announcement.style.position = 'absolute';
    announcement.style.left = '-9999px';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 3000);
}

function setTextSize(size) {
    const sizes = {
        'normal': '16px',
        'large': '20px',
        'larger': '24px'
    };
    document.documentElement.style.fontSize = sizes[size];
}

function setContrast(contrast) {
    if (contrast === 'high') {
        document.body.classList.add('high-contrast');
    } else {
        document.body.classList.remove('high-contrast');
    }
}

function toggleScreenReader(enabled) {
    // Implementation depends on screen reader API integration
    console.log('Screen reader support:', enabled);
}

function toggleDyslexicFont(enabled) {
    if (enabled) {
        document.body.classList.add('dyslexic-font');
    } else {
        document.body.classList.remove('dyslexic-font');
    }
}

function savePreferences() {
    const preferences = {
        textSize: document.documentElement.style.fontSize,
        highContrast: document.body.classList.contains('high-contrast'),
        screenReader: document.getElementById('screen-reader').checked,
        dyslexicFont: document.getElementById('dyslexic-font').checked
    };
    localStorage.setItem('accessibility-preferences', JSON.stringify(preferences));
}