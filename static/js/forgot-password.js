// Material Design Forgot Password Form JavaScript
class MaterialForgotPasswordForm {
    constructor() {
        this.form = document.getElementById('forgotForm');
        this.emailInput = document.getElementById('email');
        this.submitButton = this.form.querySelector('.material-btn');
        this.successMessage = document.getElementById('successMessage');
        this.infoSection = document.querySelector('.info-section');
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.setupRippleEffects();
        this.showInfoSection();
    }
    
    bindEvents() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.emailInput.addEventListener('blur', () => this.validateEmailOnBlur());
        this.emailInput.addEventListener('input', () => this.handleEmailInput());
        
        // Add Material Design input interactions
        this.emailInput.addEventListener('focus', (e) => this.handleInputFocus(e));
        this.emailInput.addEventListener('blur', (e) => this.handleInputBlur(e));
    }
    
    setupRippleEffects() {
        // Setup ripple for email input
        this.emailInput.addEventListener('focus', (e) => {
            const rippleContainer = this.emailInput.parentNode.querySelector('.ripple-container');
            this.createRipple(e, rippleContainer);
        });
        
        // Setup ripple for main button
        this.submitButton.addEventListener('click', (e) => {
            this.createRipple(e, this.submitButton.querySelector('.btn-ripple'));
        });
    }
    
    showInfoSection() {
        // Show info section with delay
        setTimeout(() => {
            this.infoSection.classList.add('show');
        }, 500);
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
        
        const formGroup = e.target.closest('.form-group');
        formGroup.classList.add('focused');
    }
    
    handleInputBlur(e) {
        const inputWrapper = e.target.closest('.input-wrapper');
        inputWrapper.classList.remove('focused');
        
        const formGroup = e.target.closest('.form-group');
        formGroup.classList.remove('focused');
    }
    
    handleEmailInput() {
        // Clear error state when user starts typing
        const hasError = this.emailInput.closest('.form-group').classList.contains('error');
        if (hasError) {
            // If field is empty, just clear the error visually
            const email = this.emailInput.value.trim();
            if (email.length === 0) {
                this.clearErrorVisually('email');
            } else {
                // If user is typing, clear error completely
                this.clearError('email');
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
        // This method only clears the visual error state but keeps the error class
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
        
        if (!isEmailValid) {
            // Add material feedback for invalid form
            this.submitButton.style.animation = 'materialPulse 0.3s ease';
            setTimeout(() => {
                this.submitButton.style.animation = '';
            }, 300);
            return;
        }
        
        this.setLoading(true);
        
        try {
            // Simulate password reset request
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Show success state
            this.showSuccess();
        } catch (error) {
            this.showError('email', 'Failed to send reset email. Please try again.');
        } finally {
            this.setLoading(false);
        }
    }
    
    setLoading(loading) {
        this.submitButton.classList.toggle('loading', loading);
        this.submitButton.disabled = loading;
        
        // Disable form during loading
        this.emailInput.disabled = loading;
    }
    
    showSuccess() {
        // Hide form and info section with Material motion
        this.form.classList.add('hidden');
        document.querySelector('.back-to-login').classList.add('hidden');
        this.infoSection.classList.remove('show');
        
        setTimeout(() => {
            this.form.style.display = 'none';
            document.querySelector('.back-to-login').style.display = 'none';
            this.infoSection.style.display = 'none';
            
            // Show success with Material elevation
            this.successMessage.classList.add('show');
            
            // Add Material success animation
            const successIcon = this.successMessage.querySelector('.success-icon');
            successIcon.style.animation = 'materialSuccessScale 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)';
            
        }, 300);
    }
}

// Add Material Design specific animations if not already present
if (!document.querySelector('#material-keyframes-forgot')) {
    const style = document.createElement('style');
    style.id = 'material-keyframes-forgot';
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
        
        @keyframes materialSlideUp {
            from {
                opacity: 0;
                transform: translateY(16px);
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
    new MaterialForgotPasswordForm();
});

// Add some helpful utility functions for better UX
class ForgotPasswordUtils {
    static showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 24px;
            right: 24px;
            background: ${type === 'error' ? '#f44336' : '#4caf50'};
            color: white;
            padding: 12px 24px;
            border-radius: 4px;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            z-index: 1000;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        // Show toast
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        // Hide and remove toast
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }
    
    static validateEmailDomain(email) {
        // Common email providers for better UX
        const commonDomains = [
            'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com',
            'aol.com', 'icloud.com', 'protonmail.com', 'live.com'
        ];
        
        const domain = email.split('@')[1];
        return commonDomains.includes(domain?.toLowerCase());
    }
}