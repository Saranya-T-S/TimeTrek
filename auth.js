document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
});

function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const remember = document.querySelector('input[name="remember"]').checked;
    
    // Get stored users
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        // Store user session
        const sessionData = {
            username: user.username,
            fullname: user.fullname,
            email: user.email
        };

        if (remember) {
            localStorage.setItem('user', JSON.stringify(sessionData));
        } else {
            sessionStorage.setItem('user', JSON.stringify(sessionData));
        }
        
        window.location.href = 'index.html';
    } else {
        showError('Invalid username or password');
    }
}

function handleSignup(e) {
    e.preventDefault();
    
    const fullname = document.getElementById('fullname').value;
    const email = document.getElementById('email').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    // Validation
    if (password.length < 8) {
        showError('Password must be at least 8 characters long');
        return;
    }
    
    if (password !== confirmPassword) {
        showError('Passwords do not match');
        return;
    }
    
    // Get stored users
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Check if username exists
    if (users.some(user => user.username === username)) {
        showError('Username already exists');
        return;
    }
    
    // Add new user
    const newUser = {
        fullname,
        email,
        username,
        password,
        dateJoined: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Auto login after signup
    const sessionData = {
        username: newUser.username,
        fullname: newUser.fullname,
        email: newUser.email
    };
    sessionStorage.setItem('user', JSON.stringify(sessionData));
    
    window.location.href = 'index.html';
}

function showError(message) {
    // Create error element if it doesn't exist
    let errorDiv = document.querySelector('.error-message');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        document.querySelector('.login-form').prepend(errorDiv);
    }
    
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    // Hide error after 3 seconds
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 3000);
}

function checkAuth() {
    const user = JSON.parse(localStorage.getItem('user')) || JSON.parse(sessionStorage.getItem('user'));
    if (!user) {
        window.location.href = 'login.html';
    }
    return user;
}

function logout() {
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    window.location.href = 'login.html';
} 