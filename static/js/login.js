// Material Design Login Form JavaScript
class MaterialLoginForm {
    constructor() {
        this.form = document.getElementById('loginForm');
        this.emailInput = document.getElementById('email');
        this.passwordInput = document.getElementById('password');
        this.passwordToggle = document.getElementById('passwordToggle');
        this.submitButton = this.form.querySelector('.material-btn');
        this.successMessage = document.getElementById('successMessage');
        this.socialButtons = document.querySelectorAll('.social-btn');
        this.toastContainer = document.getElementById('toastContainer');
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.setupPasswordToggle();
        this.setupSocialButtons();
        this.setupRippleEffects();
    }
    
    bindEvents() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.emailInput.addEventListener('blur', () => this.validateEmailOnBlur());
        this.passwordInput.addEventListener('blur', () => this.validatePasswordOnBlur());
        this.emailInput.addEventListener('input', () => this.handleEmailInput());
        this.passwordInput.addEventListener('input', () => this.handlePasswordInput());
        
        // Add real-time validation
        this.emailInput.addEventListener('input', () => this.validateEmailRealTime());
        this.passwordInput.addEventListener('input', () => this.validatePasswordRealTime());
        
        // Add Material Design input interactions
        [this.emailInput, this.passwordInput].forEach(input => {
            input.addEventListener('focus', (e) => this.handleInputFocus(e));
            input.addEventListener('blur', (e) => this.handleInputBlur(e));
        });
    }
    
    setupPasswordToggle() {
        this.passwordToggle.addEventListener('click', (e) => {
            this.createRipple(e, this.passwordToggle.querySelector('.toggle-ripple'));
            
            const type = this.passwordInput.type === 'password' ? 'text' : 'password';
            this.passwordInput.type = type;
            
            const icon = this.passwordToggle.querySelector('.toggle-icon');
            icon.classList.toggle('show-password', type === 'text');
        });
    }
    
    setupSocialButtons() {
        this.socialButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const provider = button.classList.contains('google-material') ? 'Google' : 'Facebook';
                this.createRipple(e, button.querySelector('.social-ripple'));
                this.handleSocialLogin(provider, button);
            });
        });
    }
    
    setupRippleEffects() {
        // Setup ripples for inputs
        [this.emailInput, this.passwordInput].forEach(input => {
            input.addEventListener('focus', (e) => {
                const rippleContainer = input.parentNode.querySelector('.ripple-container');
                this.createRipple(e, rippleContainer);
            });
        });
        
        // Setup ripple for main button
        this.submitButton.addEventListener('click', (e) => {
            this.createRipple(e, this.submitButton.querySelector('.btn-ripple'));
        });
        
        // Setup checkbox ripple
        const checkbox = document.querySelector('.checkbox-wrapper');
        checkbox.addEventListener('click', (e) => {
            const rippleContainer = checkbox.querySelector('.checkbox-ripple');
            this.createRipple(e, rippleContainer);
        });
    }
    
    createRipple(event, container) {
        const rect = container.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        const ripple = document.createElement('div');
        ripple.className = 'ripple';
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        
        container.appendChild(ripple);
        
        // Remove ripple after animation
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
    
    handleInputFocus(e) {
        const inputWrapper = e.target.closest('.input-wrapper');
        inputWrapper.classList.add('focused');
    }
    
    handleInputBlur(e) {
        const inputWrapper = e.target.closest('.input-wrapper');
        inputWrapper.classList.remove('focused');
    }
    
    handleEmailInput() {
        // Clear error state when user starts typing
        const hasError = this.emailInput.closest('.form-group').classList.contains('error');
        if (hasError) {
            // If field is empty, just clear the error visually but keep validation state
            const email = this.emailInput.value.trim();
            if (email.length === 0) {
                this.clearErrorVisually('email');
            } else {
                // If user is typing, clear error and revalidate
                this.clearError('email');
            }
        }
    }
    
    handlePasswordInput() {
        // Clear error state when user starts typing
        const hasError = this.passwordInput.closest('.form-group').classList.contains('error');
        if (hasError) {
            // If field is empty, just clear the error visually but keep validation state
            const password = this.passwordInput.value;
            if (password.length === 0) {
                this.clearErrorVisually('password');
            } else {
                // If user is typing, clear error and revalidate
                this.clearError('password');
            }
        }
    }
    
    validateEmailOnBlur() {
        // Only validate on blur if field has content or previously had an error
        const email = this.emailInput.value.trim();
        const wasValidated = this.emailInput.closest('.form-group').classList.contains('error');
        
        if (email.length > 0 || wasValidated) {
            return this.validateEmail();
        }
        return true;
    }
    
    validateEmail() {
        const email = this.emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!email) {
            this.showError('email', 'Email is required');
            return false;
        }
        
        if (!emailRegex.test(email)) {
            this.showError('email', 'Enter a valid email address');
            return false;
        }
        
        this.clearError('email');
        return true;
    }
    
    validatePasswordOnBlur() {
        // Only validate on blur if field has content or previously had an error
        const password = this.passwordInput.value;
        const wasValidated = this.passwordInput.closest('.form-group').classList.contains('error');
        
        if (password.length > 0 || wasValidated) {
            return this.validatePassword();
        }
        return true;
    }
    
    validatePassword() {
        const password = this.passwordInput.value;
        
        if (!password) {
            this.showError('password', 'Password is required');
            return false;
        }
        
        if (password.length < 6) {
            this.showError('password', 'Password must be at least 6 characters');
            return false;
        }
        
        this.clearError('password');
        return true;
    }
    
    validateEmailRealTime() {
        const email = this.emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        // Only validate if user has started typing
        if (email.length === 0) {
            return true;
        }
        
        if (email.length > 0 && !emailRegex.test(email)) {
            this.showError('email', 'Enter a valid email address');
            return false;
        } else if (email.length > 0 && emailRegex.test(email)) {
            this.clearError('email');
            return true;
        }
        
        return true;
    }
    
    validatePasswordRealTime() {
        const password = this.passwordInput.value;
        
        // Only validate if user has started typing
        if (password.length === 0) {
            return true;
        }
        
        if (password.length > 0 && password.length < 6) {
            this.showError('password', 'Password must be at least 6 characters');
            return false;
        } else if (password.length >= 6) {
            this.clearError('password');
            return true;
        }
        
        return true;
    }
    
    showError(field, message) {
        const formGroup = document.getElementById(field).closest('.form-group');
        const errorElement = document.getElementById(`${field}Error`);
        
        formGroup.classList.add('error');
        errorElement.textContent = message;
        errorElement.classList.add('show');
        
        // Add Material Design shake animation
        const input = document.getElementById(field);
        input.style.animation = 'materialShake 0.4s ease-in-out';
        setTimeout(() => {
            input.style.animation = '';
        }, 400);
    }
    
    clearError(field) {
        const formGroup = document.getElementById(field).closest('.form-group');
        const errorElement = document.getElementById(`${field}Error`);
        
        formGroup.classList.remove('error');
        formGroup.classList.remove('show-error');
        errorElement.classList.remove('show');
        setTimeout(() => {
            errorElement.textContent = '';
        }, 200);
    }
    
    clearErrorVisually(field) {
        // This method only clears the visual error state but keeps the error class
        // Used when field becomes empty but we want to remember it was validated
        const formGroup = document.getElementById(field).closest('.form-group');
        const errorElement = document.getElementById(`${field}Error`);
        
        // Remove the show-error class so red border disappears
        formGroup.classList.remove('show-error');
        errorElement.classList.remove('show');
        setTimeout(() => {
            errorElement.textContent = '';
        }, 200);
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        const isEmailValid = this.validateEmail();
        const isPasswordValid = this.validatePassword();
        
        if (!isEmailValid || !isPasswordValid) {
            // Add material feedback for invalid form
            this.submitButton.style.animation = 'materialPulse 0.3s ease';
            setTimeout(() => {
                this.submitButton.style.animation = '';
            }, 300);
            return;
        }
        
        this.setLoading(true);
        
        try {
            // Create form data
            const formData = new FormData();
            formData.append('email', this.emailInput.value.trim());
            formData.append('password', this.passwordInput.value);
            
            // Add remember me if checked
            const rememberCheckbox = document.getElementById('remember');
            if (rememberCheckbox && rememberCheckbox.checked) {
                formData.append('remember', 'on');
            }
            
            // Submit to backend
            const response = await fetch('/login', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Show success toast
                this.showToast('success', 'Welcome back!', result.message || 'Signing you in...');
                
                // Show success state
                this.showMaterialSuccess();
                
                // Redirect after success animation
                setTimeout(() => {
                    window.location.href = result.redirect || '/homepage';
                }, 2000);
            } else {
                // Show error toast
                this.showToast('error', 'Sign in failed', result.message || 'Please check your credentials and try again.');
                this.showError('password', result.message || 'Sign in failed. Please try again.');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showToast('error', 'Connection Error', 'Please check your internet connection and try again.');
            this.showError('password', 'Network error. Please check your connection and try again.');
        } finally {
            this.setLoading(false);
        }
    }
    
    async handleSocialLogin(provider, button) {
        console.log(`Initiating ${provider} sign-in...`);
        
        // Add Material loading state
        button.style.pointerEvents = 'none';
        button.style.opacity = '0.7';
        
        // Show info toast
        this.showToast('info', 'Social Login', `Redirecting to ${provider} authentication...`);
        
        try {
            // Simulate OAuth flow
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // In a real implementation, this would redirect to OAuth provider
            // For demo purposes, we'll show a message and redirect to demo route
            this.showToast('warning', 'Demo Mode', `${provider} login is not configured yet. Please use email/password or sign up.`);
            
            console.log(`Redirecting to ${provider} authentication...`);
            // Redirect to demo social auth route
            setTimeout(() => {
                window.location.href = `/auth/${provider.toLowerCase()}`;
            }, 2000);
        } catch (error) {
            console.error(`${provider} authentication failed: ${error.message}`);
            this.showToast('error', 'Authentication Error', `${provider} login failed. Please try again.`);
        } finally {
            button.style.pointerEvents = 'auto';
            button.style.opacity = '1';
        }
    }
    
    setLoading(loading) {
        this.submitButton.classList.toggle('loading', loading);
        this.submitButton.disabled = loading;
        
        // Disable social buttons during login
        this.socialButtons.forEach(button => {
            button.style.pointerEvents = loading ? 'none' : 'auto';
            button.style.opacity = loading ? '0.6' : '1';
        });
    }
    
    showMaterialSuccess() {
        // Hide form with Material motion
        this.form.style.transform = 'translateY(-16px) scale(0.95)';
        this.form.style.opacity = '0';
        
        setTimeout(() => {
            this.form.style.display = 'none';
            document.querySelector('.social-login').style.display = 'none';
            document.querySelector('.signup-link').style.display = 'none';
            
            // Show success with Material elevation
            this.successMessage.classList.add('show');
            
            // Add Material success animation
            const successIcon = this.successMessage.querySelector('.success-icon');
            successIcon.style.animation = 'materialSuccessScale 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)';
            
        }, 300);
        
        // Simulate redirect with Material timing
        setTimeout(() => {
            console.log('Redirecting to dashboard...');
            // window.location.href = '/dashboard';
        }, 2500);
    }
    
    showToast(type, title, message, duration = 5000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: '<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>',
            error: '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>',
            warning: '<svg viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>',
            info: '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>'
        };
        
        toast.innerHTML = `
            <div class="toast-content">
                <div class="toast-icon">${icons[type] || icons.info}</div>
                <div class="toast-message">
                    <div class="toast-title">${title}</div>
                    <div class="toast-description">${message}</div>
                </div>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
        `;
        
        this.toastContainer.appendChild(toast);
        
        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Auto remove
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
}

// Add Material Design specific animations
if (!document.querySelector('#material-keyframes')) {
    const style = document.createElement('style');
    style.id = 'material-keyframes';
    style.textContent = `
        @keyframes materialShake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-4px); }
            75% { transform: translateX(4px); }
        }
        
        @keyframes materialPulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.02); }
            100% { transform: scale(1); }
        }
        
        @keyframes materialSuccessScale {
            0% { transform: scale(0); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
    `;
    document.head.appendChild(style);
}

// Initialize the form when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MaterialLoginForm();
});