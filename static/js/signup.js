// Material Design Signup Form JavaScript
class MaterialSignupForm {
    constructor() {
        this.form = document.getElementById('signupForm');
        this.fullNameInput = document.getElementById('full_name');
        this.emailInput = document.getElementById('email');
        this.passwordInput = document.getElementById('password');
        this.confirmPasswordInput = document.getElementById('confirm_password');
        this.termsCheckbox = document.getElementById('terms');
        this.passwordToggle = document.getElementById('passwordToggle');
        this.confirmPasswordToggle = document.getElementById('confirmPasswordToggle');
        this.submitButton = this.form.querySelector('.material-btn');
        this.successMessage = document.getElementById('successMessage');
        this.socialButtons = document.querySelectorAll('.social-btn');
        this.passwordStrength = document.getElementById('passwordStrength');
        this.progressContainer = document.getElementById('progressContainer');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.toastContainer = document.getElementById('toastContainer');
        
        console.log('Signup form elements found:', {
            form: !!this.form,
            fullNameInput: !!this.fullNameInput,
            emailInput: !!this.emailInput,
            passwordInput: !!this.passwordInput,
            confirmPasswordInput: !!this.confirmPasswordInput,
            termsCheckbox: !!this.termsCheckbox,
            submitButton: !!this.submitButton
        });
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.setupPasswordToggles();
        this.setupSocialButtons();
        this.setupRippleEffects();
    }
    
    bindEvents() {
        console.log('Binding form submit event...');
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        console.log('Form submit event bound successfully');
        
        // Validation on blur
        this.fullNameInput.addEventListener('blur', () => this.validateFullNameOnBlur());
        this.emailInput.addEventListener('blur', () => this.validateEmailOnBlur());
        this.passwordInput.addEventListener('blur', () => this.validatePasswordOnBlur());
        this.confirmPasswordInput.addEventListener('blur', () => this.validateConfirmPasswordOnBlur());
        this.termsCheckbox.addEventListener('change', () => this.validateTerms());
        
        // Input handling
        this.fullNameInput.addEventListener('input', () => this.handleFullNameInput());
        this.emailInput.addEventListener('input', () => this.handleEmailInput());
        this.passwordInput.addEventListener('input', () => this.handlePasswordInput());
        this.confirmPasswordInput.addEventListener('input', () => this.handleConfirmPasswordInput());
        
        // Add real-time validation
        this.fullNameInput.addEventListener('input', () => this.validateFullNameRealTime());
        this.emailInput.addEventListener('input', () => this.validateEmailRealTime());
        this.passwordInput.addEventListener('input', () => this.validatePasswordRealTime());
        this.confirmPasswordInput.addEventListener('input', () => this.validateConfirmPasswordRealTime());
        
        // Focus/blur effects
        [this.fullNameInput, this.emailInput, this.passwordInput, this.confirmPasswordInput].forEach(input => {
            input.addEventListener('focus', (e) => this.handleInputFocus(e));
            input.addEventListener('blur', (e) => this.handleInputBlur(e));
        });
    }
    
    setupPasswordToggles() {
        this.passwordToggle.addEventListener('click', (e) => {
            this.createRipple(e, this.passwordToggle.querySelector('.toggle-ripple'));
            
            const type = this.passwordInput.type === 'password' ? 'text' : 'password';
            this.passwordInput.type = type;
            
            const icon = this.passwordToggle.querySelector('.toggle-icon');
            icon.classList.toggle('show-password', type === 'text');
        });
        
        this.confirmPasswordToggle.addEventListener('click', (e) => {
            this.createRipple(e, this.confirmPasswordToggle.querySelector('.toggle-ripple'));
            
            const type = this.confirmPasswordInput.type === 'password' ? 'text' : 'password';
            this.confirmPasswordInput.type = type;
            
            const icon = this.confirmPasswordToggle.querySelector('.toggle-icon');
            icon.classList.toggle('show-password', type === 'text');
        });
    }
    
    setupSocialButtons() {
        this.socialButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const provider = button.classList.contains('google-material') ? 'Google' : 'Facebook';
                this.createRipple(e, button.querySelector('.social-ripple'));
                this.handleSocialSignup(provider, button);
            });
        });
    }
    
    setupRippleEffects() {
        // Setup ripples for inputs
        [this.fullNameInput, this.emailInput, this.passwordInput, this.confirmPasswordInput].forEach(input => {
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
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
    
    handleInputFocus(e) {
        const inputWrapper = e.target.closest('.input-wrapper');
        inputWrapper.classList.add('focused');
        
        const formGroup = e.target.closest('.form-group');
        formGroup.classList.add('focused');
    }
    
    handleInputBlur(e) {
        const inputWrapper = e.target.closest('.input-wrapper');
        inputWrapper.classList.remove('focused');
        
        const formGroup = e.target.closest('.form-group');
        formGroup.classList.remove('focused');
    }
    
    // Input handlers
    handleFullNameInput() {
        this.clearErrorOnInput('full_name');
    }
    
    handleEmailInput() {
        this.clearErrorOnInput('email');
    }
    
    handlePasswordInput() {
        this.clearErrorOnInput('password');
        this.updatePasswordStrength();
        
        // Re-validate confirm password if it has a value
        if (this.confirmPasswordInput.value) {
            this.validateConfirmPassword();
        }
    }
    
    handleConfirmPasswordInput() {
        this.clearErrorOnInput('confirm_password');
    }
    
    clearErrorOnInput(field) {
        const input = document.getElementById(field);
        const hasError = input.closest('.form-group').classList.contains('error');
        if (hasError) {
            const value = input.value.trim();
            if (value.length === 0) {
                this.clearErrorVisually(field);
            } else {
                this.clearError(field);
            }
        }
    }
    
    updatePasswordStrength() {
        const password = this.passwordInput.value;
        const strengthFill = this.passwordStrength.querySelector('.strength-fill');
        const strengthText = this.passwordStrength.querySelector('.strength-text');
        
        if (password.length === 0) {
            this.passwordStrength.classList.remove('show');
            return;
        }
        
        this.passwordStrength.classList.add('show');
        
        const score = this.calculatePasswordStrength(password);
        
        // Reset classes
        strengthFill.className = 'strength-fill';
        strengthText.className = 'strength-text';
        
        if (score < 2) {
            strengthFill.classList.add('weak');
            strengthText.classList.add('weak');
            strengthText.textContent = 'Weak password';
        } else if (score < 3) {
            strengthFill.classList.add('fair');
            strengthText.classList.add('fair');
            strengthText.textContent = 'Fair password';
        } else if (score < 4) {
            strengthFill.classList.add('good');
            strengthText.classList.add('good');
            strengthText.textContent = 'Good password';
        } else {
            strengthFill.classList.add('strong');
            strengthText.classList.add('strong');
            strengthText.textContent = 'Strong password';
        }
    }
    
    calculatePasswordStrength(password) {
        let score = 0;
        
        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        
        return Math.min(score, 4);
    }
    
    // Validation methods
    validateFullNameOnBlur() {
        const fullName = this.fullNameInput.value.trim();
        const wasValidated = this.fullNameInput.closest('.form-group').classList.contains('error');
        
        if (fullName.length > 0 || wasValidated) {
            return this.validateFullName();
        }
        return true;
    }
    
    validateFullName() {
        const fullName = this.fullNameInput.value.trim();
        
        if (!fullName) {
            this.showError('full_name', 'Full name is required');
            return false;
        }
        
        if (fullName.length < 2) {
            this.showError('full_name', 'Full name must be at least 2 characters');
            return false;
        }
        
        this.clearError('full_name');
        return true;
    }
    
    validateEmailOnBlur() {
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
            this.showError('email', 'Email address is required');
            return false;
        }
        
        if (!emailRegex.test(email)) {
            this.showError('email', 'Please enter a valid email address');
            return false;
        }
        
        this.clearError('email');
        return true;
    }
    
    validatePasswordOnBlur() {
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
        
        if (password.length < 8) {
            this.showError('password', 'Password must be at least 8 characters');
            return false;
        }
        
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(password)) {
            this.showError('password', 'Password must contain uppercase, lowercase, and number');
            return false;
        }
        
        this.clearError('password');
        return true;
    }
    
    validateConfirmPasswordOnBlur() {
        const confirmPassword = this.confirmPasswordInput.value;
        const wasValidated = this.confirmPasswordInput.closest('.form-group').classList.contains('error');
        
        if (confirmPassword.length > 0 || wasValidated) {
            return this.validateConfirmPassword();
        }
        return true;
    }
    
    validateConfirmPassword() {
        const password = this.passwordInput.value;
        const confirmPassword = this.confirmPasswordInput.value;
        
        if (!confirmPassword) {
            this.showError('confirmPassword', 'Please confirm your password');
            return false;
        }
        
        if (password !== confirmPassword) {
            this.showError('confirmPassword', 'Passwords do not match');
            return false;
        }
        
        this.clearError('confirmPassword');
        return true;
    }
    
    validateTerms() {
        console.log('Validating terms checkbox:', this.termsCheckbox.checked);
        if (!this.termsCheckbox.checked) {
            this.showError('terms', 'You must agree to the terms and conditions');
            return false;
        }
        
        this.clearError('terms');
        return true;
    }
    
    validateFullNameRealTime() {
        const fullName = this.fullNameInput.value.trim();
        
        // Only validate if user has started typing
        if (fullName.length === 0) {
            return true;
        }
        
        if (fullName.length > 0 && fullName.length < 2) {
            this.showError('full_name', 'Full name must be at least 2 characters');
            return false;
        } else if (fullName.length >= 2) {
            this.clearError('full_name');
            return true;
        }
        
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
        
        if (password.length > 0 && password.length < 8) {
            this.showError('password', 'Password must be at least 8 characters');
            return false;
        } else if (password.length >= 8 && !/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(password)) {
            this.showError('password', 'Password must contain uppercase, lowercase, and number');
            return false;
        } else if (password.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(password)) {
            this.clearError('password');
            return true;
        }
        
        return true;
    }
    
    validateConfirmPasswordRealTime() {
        const password = this.passwordInput.value;
        const confirmPassword = this.confirmPasswordInput.value;
        
        // Only validate if user has started typing
        if (confirmPassword.length === 0) {
            return true;
        }
        
        if (confirmPassword.length > 0 && password !== confirmPassword) {
            this.showError('confirm_password', 'Passwords do not match');
            return false;
        } else if (confirmPassword.length > 0 && password === confirmPassword) {
            this.clearError('confirm_password');
            return true;
        }
        
        return true;
    }
    
    showError(field, message) {
        const formGroup = document.getElementById(field).closest('.form-group');
        const errorElement = document.getElementById(`${field}Error`);
        
        formGroup.classList.add('error');
        formGroup.classList.add('show-error');
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
        const formGroup = document.getElementById(field).closest('.form-group');
        const errorElement = document.getElementById(`${field}Error`);
        
        formGroup.classList.remove('show-error');
        errorElement.classList.remove('show');
        setTimeout(() => {
            errorElement.textContent = '';
        }, 200);
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        console.log('Form submission started...');
        alert('Form submission triggered!'); // Temporary debug alert
        
        // Validate all fields
        const isFullNameValid = this.validateFullName();
        const isEmailValid = this.validateEmail();
        const isPasswordValid = this.validatePassword();
        const isConfirmPasswordValid = this.validateConfirmPassword();
        const areTermsValid = this.validateTerms();
        
        console.log('Validation results:', {
            isFullNameValid,
            isEmailValid,
            isPasswordValid,
            isConfirmPasswordValid,
            areTermsValid
        });
        
        if (!isFullNameValid || !isEmailValid || !isPasswordValid || !isConfirmPasswordValid || !areTermsValid) {
            console.log('Validation failed, showing error animation');
            this.submitButton.style.animation = 'materialPulse 0.3s ease';
            setTimeout(() => {
                this.submitButton.style.animation = '';
            }, 300);
            return;
        }
        
        console.log('All validations passed, proceeding with submission...');
        
        this.setLoading(true);
        
        try {
            // Create form data
            const formData = new FormData();
            formData.append('full_name', this.fullNameInput.value.trim());
            formData.append('email', this.emailInput.value.trim());
            formData.append('password', this.passwordInput.value);
            formData.append('confirm_password', this.confirmPasswordInput.value);
            
            // Add terms if checked
            if (this.termsCheckbox.checked) {
                formData.append('terms', 'on');
            }
            
            console.log('Form data being sent:', {
                full_name: this.fullNameInput.value.trim(),
                email: this.emailInput.value.trim(),
                password: this.passwordInput.value,
                confirm_password: this.confirmPasswordInput.value,
                terms: this.termsCheckbox.checked
            });
            
            // Submit to backend
            const response = await fetch('/signup', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Show success toast
                this.showToast('success', 'Account Created!', result.message || 'Welcome aboard! Redirecting to login...');
                
                // Show success state
                this.showSuccess();
                
                // Redirect after success animation
                setTimeout(() => {
                    window.location.href = result.redirect || '/login';
                }, 3000);
            } else {
                // Show error toast
                this.showToast('error', 'Signup Failed', result.message || 'Please check your information and try again.');
                this.showError('email', result.message || 'Account creation failed. Please try again.');
            }
        } catch (error) {
            console.error('Signup error:', error);
            this.showToast('error', 'Connection Error', 'Please check your internet connection and try again.');
            this.showError('email', 'Network error. Please check your connection and try again.');
        } finally {
            this.setLoading(false);
        }
    }
    
    async handleSocialSignup(provider, button) {
        console.log(`Initiating ${provider} signup...`);
        
        button.style.pointerEvents = 'none';
        button.style.opacity = '0.7';
        
        // Show info toast
        this.showToast('info', 'Social Signup', `Redirecting to ${provider} authentication...`);
        
        try {
            // Simulate OAuth flow
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // In a real implementation, this would redirect to OAuth provider
            // For demo purposes, we'll show a message and redirect to demo route
            this.showToast('warning', 'Demo Mode', `${provider} signup is not configured yet. Please use the form above to create an account.`);
            
            console.log(`Redirecting to ${provider} authentication...`);
            // Redirect to demo social auth route
            setTimeout(() => {
                window.location.href = `/auth/${provider.toLowerCase()}`;
            }, 2000);
        } catch (error) {
            console.error(`${provider} signup failed: ${error.message}`);
            this.showToast('error', 'Authentication Error', `${provider} signup failed. Please try again.`);
        } finally {
            button.style.pointerEvents = 'auto';
            button.style.opacity = '1';
        }
    }
    
    setLoading(loading) {
        this.submitButton.classList.toggle('loading', loading);
        this.submitButton.disabled = loading;
        
        // Add loading class to form
        this.form.classList.toggle('loading', loading);
        
        // Show/hide progress indicator
        if (loading) {
            this.progressContainer.classList.add('show');
            this.animateProgress();
        } else {
            this.progressContainer.classList.remove('show');
        }
        
        // Disable social buttons during signup
        this.socialButtons.forEach(button => {
            button.style.pointerEvents = loading ? 'none' : 'auto';
            button.style.opacity = loading ? '0.6' : '1';
        });
    }
    
    animateProgress() {
        const steps = [
            { progress: 20, text: 'Validating information...' },
            { progress: 40, text: 'Checking email availability...' },
            { progress: 60, text: 'Creating secure account...' },
            { progress: 80, text: 'Setting up your profile...' },
            { progress: 100, text: 'Almost done...' }
        ];
        
        let currentStep = 0;
        
        const updateProgress = () => {
            if (currentStep < steps.length) {
                const step = steps[currentStep];
                this.progressFill.style.width = step.progress + '%';
                this.progressText.textContent = step.text;
                currentStep++;
                setTimeout(updateProgress, 600);
            }
        };
        
        updateProgress();
    }
    
    showSuccess() {
        // Hide form elements with staggered animation
        this.form.classList.add('success');
        document.querySelector('.signin-link').classList.add('success');
        document.querySelector('.social-login').classList.add('success');
        
        setTimeout(() => {
            this.form.style.display = 'none';
            document.querySelector('.signin-link').style.display = 'none';
            document.querySelector('.social-login').style.display = 'none';
            document.querySelector('.divider').style.display = 'none';
            
            // Show success with Material elevation
            this.successMessage.classList.add('show');
            
            // Add Material success animation
            const successIcon = this.successMessage.querySelector('.success-icon');
            successIcon.style.animation = 'materialSuccessScale 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)';
            
        }, 600);
        
        // Simulate redirect
        setTimeout(() => {
            console.log('Redirecting to dashboard...');
            // window.location.href = '/dashboard';
        }, 3500);
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
if (!document.querySelector('#material-keyframes-signup')) {
    const style = document.createElement('style');
    style.id = 'material-keyframes-signup';
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
        
        @keyframes materialFadeIn {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
}

// Initialize the form when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MaterialSignupForm();
});