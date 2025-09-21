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
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.setupPasswordToggles();
        this.setupSocialButtons();
        this.setupRippleEffects();
    }
    
    bindEvents() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
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
                const provider = button.classList.contains('google-material') ? 'google' : 'facebook';
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
            this.showError('confirm_password', 'Please confirm your password');
            return false;
        }
        
        if (password !== confirmPassword) {
            this.showError('confirm_password', 'Passwords do not match');
            return false;
        }
        
        this.clearError('confirm_password');
        return true;
    }
    
    validateTerms() {
        if (!this.termsCheckbox.checked) {
            this.showError('terms', 'You must agree to the terms and conditions');
            return false;
        }
        
        this.clearError('terms');
        return true;
    }
    
    showError(field, message) {
        const fieldElement = document.getElementById(field);
        const errorElement = document.getElementById(`${field}Error`);
        
        // Handle terms field differently since it's in a checkbox-wrapper instead of form-group
        let container;
        if (field === 'terms') {
            container = fieldElement.closest('.checkbox-wrapper');
        } else {
            container = fieldElement.closest('.form-group');
        }
        
        container.classList.add('error');
        container.classList.add('show-error');
        errorElement.textContent = message;
        errorElement.classList.add('show');
        
        // Add Material Design shake animation
        // For terms field, apply to the checkbox-wrapper
        if (field === 'terms') {
            container.style.animation = 'materialShake 0.4s ease-in-out';
            setTimeout(() => {
                container.style.animation = '';
            }, 400);
        } else {
            fieldElement.style.animation = 'materialShake 0.4s ease-in-out';
            setTimeout(() => {
                fieldElement.style.animation = '';
            }, 400);
        }
    }
    
    clearError(field) {
        const fieldElement = document.getElementById(field);
        const errorElement = document.getElementById(`${field}Error`);
        
        // Handle terms field differently since it's in a checkbox-wrapper instead of form-group
        let container;
        if (field === 'terms') {
            container = fieldElement.closest('.checkbox-wrapper');
        } else {
            container = fieldElement.closest('.form-group');
        }
        
        container.classList.remove('error');
        container.classList.remove('show-error');
        errorElement.classList.remove('show');
        setTimeout(() => {
            errorElement.textContent = '';
        }, 200);
    }
    
    clearErrorVisually(field) {
        const fieldElement = document.getElementById(field);
        const errorElement = document.getElementById(`${field}Error`);
        
        // Handle terms field differently since it's in a checkbox-wrapper instead of form-group
        let container;
        if (field === 'terms') {
            container = fieldElement.closest('.checkbox-wrapper');
        } else {
            container = fieldElement.closest('.form-group');
        }
        
        container.classList.remove('show-error');
        errorElement.classList.remove('show');
        setTimeout(() => {
            errorElement.textContent = '';
        }, 200);
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        // Validate all fields
        const isFullNameValid = this.validateFullName();
        const isEmailValid = this.validateEmail();
        const isPasswordValid = this.validatePassword();
        const isConfirmPasswordValid = this.validateConfirmPassword();
        const areTermsValid = this.validateTerms();
        
        if (!isFullNameValid || !isEmailValid || !isPasswordValid || !isConfirmPasswordValid || !areTermsValid) {
            this.submitButton.style.animation = 'materialPulse 0.3s ease';
            setTimeout(() => {
                this.submitButton.style.animation = '';
            }, 300);
            return;
        }
        
        this.setLoading(true);
        
        try {
            // Check if Firebase is available
            if (window.firebase && window.firebase.auth) {
                // Use Firebase authentication to create account
                const userCredential = await window.firebase.auth().createUserWithEmailAndPassword(
                    this.emailInput.value.trim(),
                    this.passwordInput.value
                );
                
                // Update user profile with full name
                if (userCredential.user) {
                    await userCredential.user.updateProfile({
                        displayName: this.fullNameInput.value.trim()
                    });
                }
                
                // Show success state
                this.showSuccess();
            } else {
                // If Firebase is not available, submit the form normally
                console.log('Firebase not available, submitting form normally');
                this.form.submit();
            }
        } catch (error) {
            console.error('Signup error:', error);
            let errorMessage = 'Account creation failed. Please try again.';
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'This email is already in use';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email address';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'Password is too weak';
            }
            this.showError('email', errorMessage);
        } finally {
            this.setLoading(false);
        }
    }
    
    async handleSocialSignup(provider, button) {
        console.log(`Initiating ${provider} signup...`);
        
        button.style.pointerEvents = 'none';
        button.style.opacity = '0.7';
        
        try {
            if (provider.toLowerCase() === 'google') {
                // Check if Firebase is available
                if (!window.firebase || !firebase.auth) {
                    console.error('Firebase SDK not loaded');
                    alert('Firebase authentication is not available. Please try again later.');
                    return;
                }
                
                // Use Firebase Google Auth provider
                const provider = new firebase.auth.GoogleAuthProvider();
                provider.setCustomParameters({ prompt: 'select_account' });
                
                // Sign up with popup
                const result = await firebase.auth().signInWithPopup(provider);
                
                // Get the ID token to send to server
                const idToken = await result.user.getIdToken();
                
                // Send token to server for validation and user creation
                const response = await fetch('/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ google_id_token: idToken })
                });
                
                const data = await response.json();
                
                if (response.ok && data.success) {
                    // Successful account creation
                    this.showSuccess();
                } else {
                    // Account creation failed
                    throw new Error(data.error || 'Account creation failed');
                }
            } else {
                // For other providers - keep the simulation for now
                await new Promise(resolve => setTimeout(resolve, 1500));
                console.log(`Redirecting to ${provider} authentication...`);
            }
        } catch (error) {
            console.error(`${provider} signup failed: ${error.message}`);
            alert('Google sign-up failed: ' + error.message);
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
        
        // Disable social buttons during signup
        this.socialButtons.forEach(button => {
            button.style.pointerEvents = loading ? 'none' : 'auto';
            button.style.opacity = loading ? '0.6' : '1';
        });
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
        
        // Redirect to login page after successful account creation
        setTimeout(() => {
            window.location.href = '/login';
        }, 3500);
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