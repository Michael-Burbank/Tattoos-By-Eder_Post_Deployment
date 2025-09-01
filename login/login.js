/**
 * Enhanced Login Manager with Mobile Cursor Bleed Prevention & Logout Redirect
 * Prevents keyboard popup and handles logout redirect to main website
 */

class LoginManager {
    constructor() {
        // Core elements
        this.loginForm = null;
        this.usernameInput = null;
        this.passwordInput = null;
        this.loginButton = null;
        this.modal = null;
        this.modalContent = null;
        this.modalTitle = null;
        this.modalMessage = null;
        this.modalButton = null;
        this.closeBtn = null;
        this.recaptchaContainer = null;
        
        // State management
        this.isModalDisplayed = false;
        this.isLoginInProgress = false;
        this.recaptchaToken = null;
        this.preventFocusTimeout = null;
        this.countdownInterval = null;
        this.isMobile = false;
        
        // Configuration
        this.config = {
            maxAttempts: 3,
            lockoutDuration: 300000, // 5 minutes
            debounceDelay: 300,
            mobileDetection: true,
            preventFocusDelay: 500,
            redirectDelay: 3 // seconds for auto-redirect
        };
        
        // Initialize
        this.init();
    }

    /**
     * Initialize the login manager
     */
    init() {
        console.log('LoginManager: Initializing...');
        
        // Detect mobile device
        this.isMobile = this.isMobileDevice();
        if (this.isMobile) {
            document.body.classList.add('mobile-device');
            console.log('LoginManager: Mobile device detected');
        }
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupElements());
        } else {
            this.setupElements();
        }
    }

    /**
     * Setup DOM elements and event listeners
     */
    setupElements() {
        try {
            // Get form elements
            this.loginForm = document.getElementById('login-form');
            this.usernameInput = document.getElementById('username');
            this.passwordInput = document.getElementById('password');
            this.loginButton = document.getElementById('loginButton');
            this.recaptchaContainer = document.querySelector('.recaptcha-container');
            
            // Get modal elements
            this.modal = document.getElementById('modal-popup');
            this.modalContent = document.querySelector('.modal-content');
            this.modalTitle = document.getElementById('modal-title');
            this.modalMessage = document.getElementById('modal-message');
            this.modalButton = document.querySelector('.modal-button');
            this.closeBtn = document.querySelector('.close-btn');
            
            // Validate required elements
            if (!this.validateElements()) {
                throw new Error('Required DOM elements not found');
            }
            
            // Check for URL parameters first
            this.checkForURLParameters();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Setup mobile prevention
            this.setupMobilePrevention();
            
            console.log('LoginManager: Setup complete');
            
        } catch (error) {
            console.error('LoginManager: Setup failed -', error);
        }
    }

    /**
     * Validate that all required DOM elements exist
     */
    validateElements() {
        const required = [
            'loginForm', 'usernameInput', 'passwordInput', 'loginButton',
            'modal', 'modalContent', 'modalTitle', 'modalMessage', 
            'modalButton', 'closeBtn'
        ];
        
        for (const element of required) {
            if (!this[element]) {
                console.error(`LoginManager: Missing required element - ${element}`);
                return false;
            }
        }
        
        return true;
    }

    /**
     * Check for URL parameters and handle them
     */
    checkForURLParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        const error = urlParams.get('error');
        const message = urlParams.get('message');
        const redirect = urlParams.get('redirect');
        
        if (error) {
            this.handleLoginError(error);
        } else if (message) {
            this.handleLoginMessage(message, redirect);
        }
        
        // Clean URL after processing parameters
        if (window.location.search) {
            const url = new URL(window.location);
            url.search = '';
            window.history.replaceState({}, document.title, url);
        }
    }

    /**
     * Handle login errors from URL parameters
     */
    handleLoginError(errorType) {
        let title = 'Login Failed';
        let message = 'Invalid username or password.';
        
        switch(errorType) {
            case 'invalid':
                title = 'Invalid Credentials';
                message = 'The username or password you entered is incorrect. Please try again.';
                break;
            case 'lockout':
                title = 'Account Locked';
                message = 'Too many failed attempts. Your account has been temporarily locked for security. Please wait 15 minutes before trying again.';
                break;
            case 'blocked':
                title = 'Access Blocked';
                message = 'Your IP address has been temporarily blocked due to suspicious activity. Please contact support if this continues.';
                break;
            case 'invalid_input':
                title = 'Invalid Input';
                message = 'Invalid input detected. Please check your entries and ensure all fields are properly filled.';
                break;
            case 'empty_fields':
                title = 'Missing Information';
                message = 'Please fill in all required fields before submitting.';
                break;
            case 'recaptcha_failed':
                title = 'reCAPTCHA Failed';
                message = 'reCAPTCHA verification failed. Please complete the reCAPTCHA and try again.';
                break;
            case 'recaptcha_required':
                title = 'reCAPTCHA Required';
                message = 'Please complete the reCAPTCHA verification before submitting your login.';
                break;
            case 'unauthorized':
                title = 'Unauthorized Access';
                message = 'You must be logged in to access that page. Please log in to continue.';
                break;
            case 'timeout':
                title = 'Session Expired';
                message = 'Your session has expired for security reasons. Please log in again.';
                break;
            case 'invalid_request':
                title = 'Invalid Request';
                message = 'The request was invalid. Please refresh the page and try again.';
                break;
            default:
                title = 'Login Error';
                message = 'An unexpected error occurred during login. Please try again.';
        }
        
        this.showModal(title, message, true);
    }

    /**
     * Handle login messages (success, logout, etc.) with redirect support
     */
    handleLoginMessage(messageType, redirectTo = null) {
        let title = 'Information';
        let message = '';
        let shouldRedirect = false;
        let redirectUrl = '';
        
        switch(messageType) {
            case 'logged_out':
                title = 'Logged Out Successfully';
                message = 'You have been successfully logged out.';
                shouldRedirect = true;
                redirectUrl = 'https://tattoosbyeder.com/';
                // Use countdown version for logout
                this.showModalWithCountdown(title, message, false, shouldRedirect, redirectUrl);
                return;
            case 'session_expired':
                title = 'Session Expired';
                message = 'Your session has expired for security reasons. Please log in again to continue.';
                break;
            case 'login_success':
                title = 'Login Successful';
                message = 'Welcome! You have been successfully logged in.';
                break;
            case 'access_denied':
                title = 'Access Denied';
                message = 'You do not have permission to access that resource.';
                break;
            default:
                title = 'Information';
                message = messageType;
        }
        
        this.showModal(title, message, false, shouldRedirect, redirectUrl);
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Form submission
        if (this.loginForm) {
            this.loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }
        
        // Login button click
        if (this.loginButton) {
            this.loginButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }
        
        // Modal close events
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.closeModal();
            });
        }
        
        if (this.modalButton) {
            this.modalButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.closeModal();
            });
        }
        
        // Modal overlay click
        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.closeModal();
                }
            });
        }
        
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isModalDisplayed) {
                this.closeModal();
            }
        });
        
        // Input validation events
        if (this.usernameInput) {
            this.usernameInput.addEventListener('input', 
                this.debounce(() => this.validateInput(this.usernameInput), this.config.debounceDelay)
            );
        }
        
        if (this.passwordInput) {
            this.passwordInput.addEventListener('input', 
                this.debounce(() => this.validateInput(this.passwordInput), this.config.debounceDelay)
            );
        }
        
        // Mobile-specific events
        if (this.isMobile) {
            this.setupMobileEventListeners();
        }
        
        console.log('LoginManager: Event listeners setup complete');
    }

    /**
     * Setup mobile-specific event listeners
     */
    setupMobileEventListeners() {
        // Prevent focus when modal is open
        document.addEventListener('focusin', (e) => {
            if (this.isModalDisplayed && 
                (e.target === this.usernameInput || e.target === this.passwordInput)) {
                e.preventDefault();
                e.target.blur();
                console.log('LoginManager: Prevented focus during modal display');
            }
        });
        
        // Handle orientation change
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                if (this.isModalDisplayed) {
                    this.adjustModalForMobile();
                }
            }, 100);
        });
        
        // Handle resize for mobile keyboards
        window.addEventListener('resize', () => {
            if (this.isMobile && this.isModalDisplayed) {
                this.adjustModalForMobile();
            }
        });
    }

    /**
     * Setup mobile cursor bleed prevention
     */
    setupMobilePrevention() {
        if (this.isMobile) {
            // Add mobile-specific classes
            document.body.classList.add('mobile-device');
            
            // Setup input prevention observer
            this.setupInputObserver();
            
            console.log('LoginManager: Mobile prevention setup complete');
        }
    }

    /**
     * Setup input observer for mobile prevention
     */
    setupInputObserver() {
        // Observe for autofocus attributes and remove them
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'autofocus') {
                    const target = mutation.target;
                    if (this.isModalDisplayed && (target === this.usernameInput || target === this.passwordInput)) {
                        target.removeAttribute('autofocus');
                        target.blur();
                    }
                }
            });
        });
        
        observer.observe(document, {
            attributes: true,
            subtree: true,
            attributeFilter: ['autofocus']
        });
    }

    /**
     * Detect if device is mobile
     */
    isMobileDevice() {
        const userAgent = navigator.userAgent.toLowerCase();
        const mobileKeywords = ['android', 'webos', 'iphone', 'ipad', 'ipod', 'blackberry', 'iemobile', 'opera mini'];
        
        // Check user agent
        const isMobileUA = mobileKeywords.some(keyword => userAgent.includes(keyword));
        
        // Check screen size
        const isMobileScreen = window.innerWidth <= 768;
        
        // Check for touch capability
        const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        return isMobileUA || (isMobileScreen && hasTouch);
    }

    /**
     * Handle login process
     */
    async handleLogin() {
        if (this.isLoginInProgress || this.isModalDisplayed) {
            console.log('LoginManager: Login already in progress or modal displayed');
            return;
        }
        
        try {
            console.log('LoginManager: Starting login process');
            
            // Validate inputs
            if (!this.validateForm()) {
                return;
            }
            
            // Set loading state
            this.setLoadingState(true);
            
            // Get form data
            const formData = this.getFormData();
            
            // Validate reCAPTCHA if present
            if (this.recaptchaContainer && window.grecaptcha) {
                const recaptchaToken = window.grecaptcha.getResponse();
                if (!recaptchaToken) {
                    this.showModal('reCAPTCHA Required', 'Please complete the reCAPTCHA verification before submitting.', true);
                    this.setLoadingState(false);
                    return;
                }
                formData.recaptchaToken = recaptchaToken;
            }
            
            // Submit form to server (for actual login)
            if (this.loginForm) {
                this.loginForm.submit();
                return;
            }
            
        } catch (error) {
            console.error('LoginManager: Login error -', error);
            this.showModal('Error', 'An unexpected error occurred. Please try again.', true);
        } finally {
            this.setLoadingState(false);
        }
    }

    /**
     * Validate form inputs
     */
    validateForm() {
        let isValid = true;
        
        // Validate username
        if (this.usernameInput && !this.validateInput(this.usernameInput)) {
            isValid = false;
        }
        
        // Validate password
        if (this.passwordInput && !this.validateInput(this.passwordInput)) {
            isValid = false;
        }
        
        return isValid;
    }

    /**
     * Validate individual input
     */
    validateInput(input) {
        if (!input) return false;
        
        const value = input.value.trim();
        const fieldName = input.id === 'username' ? 'Username' : 'Password';
        
        // Remove previous error states
        input.classList.remove('error');
        this.removeValidationMessage(input);
        
        // Check if empty
        if (!value) {
            this.setInputError(input, `${fieldName} is required.`);
            return false;
        }
        
        // Specific validation rules
        if (input.id === 'username') {
            if (value.length < 3) {
                this.setInputError(input, 'Username must be at least 3 characters long.');
                return false;
            }
        } else if (input.id === 'password') {
            if (value.length < 6) {
                this.setInputError(input, 'Password must be at least 6 characters long.');
                return false;
            }
        }
        
        // Set success state
        input.classList.add('success');
        return true;
    }

    /**
     * Set input error state
     */
    setInputError(input, message) {
        input.classList.add('error');
        this.showValidationMessage(input, message, 'error');
    }

    /**
     * Show validation message
     */
    showValidationMessage(input, message, type) {
        let messageEl = input.parentNode.querySelector('.validation-message');
        
        if (!messageEl) {
            messageEl = document.createElement('div');
            messageEl.className = 'validation-message';
            input.parentNode.appendChild(messageEl);
        }
        
        messageEl.textContent = message;
        messageEl.className = `validation-message ${type}`;
    }

    /**
     * Remove validation message
     */
    removeValidationMessage(input) {
        const messageEl = input.parentNode.querySelector('.validation-message');
        if (messageEl) {
            messageEl.remove();
        }
    }

    /**
     * Get form data
     */
    getFormData() {
        return {
            username: this.usernameInput ? this.usernameInput.value.trim() : '',
            password: this.passwordInput ? this.passwordInput.value.trim() : '',
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            isMobile: this.isMobile
        };
    }

    /**
     * Set loading state
     */
    setLoadingState(isLoading) {
        this.isLoginInProgress = isLoading;
        
        if (this.loginButton) {
            if (isLoading) {
                this.loginButton.classList.add('loading');
                this.loginButton.disabled = true;
                this.loginButton.innerHTML = '<i class="ri-loader-4-line"></i> Logging in...';
            } else {
                this.loginButton.classList.remove('loading');
                this.loginButton.disabled = false;
                this.loginButton.innerHTML = '<i class="ri-login-box-line"></i> Login';
            }
        }
        
        // Disable/enable inputs
        if (this.usernameInput) {
            this.usernameInput.disabled = isLoading;
        }
        if (this.passwordInput) {
            this.passwordInput.disabled = isLoading;
        }
    }

    /**
     * Show modal with countdown for redirects
     */
    showModalWithCountdown(title, message, isError = false, shouldRedirect = false, redirectUrl = '', countdown = 5) {
        if (!shouldRedirect) {
            return this.showModal(title, message, isError);
        }
        
        if (!this.modal) {
            console.error('LoginManager: Modal not found');
            return;
        }
        
        console.log('LoginManager: Showing modal with countdown -', title);
        
        // Prevent input focus BEFORE showing modal
        this.preventInputFocus(true);
        
        // Blur any focused elements first
        if (document.activeElement && document.activeElement.blur) {
            document.activeElement.blur();
        }
        
        // Add mobile device class if needed
        if (this.isMobile) {
            document.body.classList.add('mobile-device');
        }
        
        // Set modal state
        this.setModalState(true);
        
        // Set initial content
        this.modalTitle.textContent = title;
        this.modalButton.textContent = `Continue to Website (${countdown})`;
        this.modalButton.classList.add('redirect-button');
        
        // Add error styling if it's an error
        if (isError) {
            this.modalContent.classList.add('error');
        } else {
            this.modalContent.classList.remove('error');
        }
        
        // Store redirect info
        this.modal.dataset.redirectUrl = redirectUrl;
        this.modal.dataset.shouldRedirect = 'true';
        
        // Show modal
        this.modal.style.display = 'block';
        
        // Countdown logic
        let remainingTime = countdown;
        const updateMessage = () => {
            this.modalMessage.textContent = `${message} Redirecting in ${remainingTime} seconds...`;
            this.modalButton.textContent = `Continue to Website (${remainingTime})`;
        };
        
        updateMessage();
        
        this.countdownInterval = setInterval(() => {
            remainingTime--;
            if (remainingTime > 0) {
                updateMessage();
            } else {
                clearInterval(this.countdownInterval);
                this.countdownInterval = null;
                console.log('LoginManager: Auto-redirecting to:', redirectUrl);
                window.location.href = redirectUrl;
            }
        }, 1000);
        
        // Adjust for mobile
        if (this.isMobile) {
            this.adjustModalForMobile();
        }
        
        // Focus on modal button for accessibility
        setTimeout(() => {
            this.modalButton.focus();
        }, 100);
    }

    /**
     * Show modal with mobile prevention
     */
    showModal(title, message, isError = false, shouldRedirect = false, redirectUrl = '') {
        if (!this.modal) {
            console.error('LoginManager: Modal not found');
            return;
        }
        
        console.log('LoginManager: Showing modal -', title);
        
        // Prevent input focus BEFORE showing modal
        this.preventInputFocus(true);
        
        // Blur any focused elements first
        if (document.activeElement && document.activeElement.blur) {
            document.activeElement.blur();
        }
        
        // Add mobile device class if needed
        if (this.isMobile) {
            document.body.classList.add('mobile-device');
        }
        
        // Set modal state
        this.setModalState(true);
        
        // Set modal content
        this.modalTitle.textContent = title;
        this.modalMessage.textContent = message;
        
        // Set modal type
        this.modalContent.classList.remove('error', 'success', 'warning', 'info');
        if (isError) {
            this.modalContent.classList.add('error');
        } else {
            this.modalContent.classList.add('success');
        }
        
        // Update button text
        if (shouldRedirect) {
            this.modalButton.textContent = 'Continue to Website';
            this.modalButton.classList.add('redirect-button');
            // Store redirect info for later use
            this.modal.dataset.redirectUrl = redirectUrl;
            this.modal.dataset.shouldRedirect = 'true';
        } else {
            this.modalButton.textContent = 'OK';
            this.modalButton.classList.remove('redirect-button');
            this.modal.dataset.shouldRedirect = 'false';
        }
        
        // Show modal
        this.modal.style.display = 'block';
        
        // Adjust for mobile
        if (this.isMobile) {
            this.adjustModalForMobile();
        }
        
        // Focus on modal button for accessibility
        setTimeout(() => {
            this.modalButton.focus();
        }, 100);
        
        // Reset reCAPTCHA if it exists
        if (typeof grecaptcha !== 'undefined') {
            try {
                grecaptcha.reset();
            } catch (e) {
                console.log('reCAPTCHA reset failed:', e);
            }
        }
    }

    /**
     * Close modal with mobile restoration and redirect support
     */
    closeModal() {
        if (!this.modal || !this.isModalDisplayed) return;
        
        console.log('LoginManager: Closing modal');
        
        const shouldRedirect = this.modal.dataset.shouldRedirect === 'true';
        const redirectUrl = this.modal.dataset.redirectUrl;
        
        // Clear countdown if it exists
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
        
        // Hide modal
        this.modal.style.display = 'none';
        
        // Remove redirect button class
        if (this.modalButton) {
            this.modalButton.classList.remove('redirect-button');
        }
        
        // Restore state
        this.setModalState(false);
        
        // Handle redirect if needed
        if (shouldRedirect && redirectUrl) {
            console.log('LoginManager: Redirecting to:', redirectUrl);
            window.location.href = redirectUrl;
            return;
        }
        
        // Re-enable inputs after delay
        setTimeout(() => {
            this.preventInputFocus(false);
        }, this.isMobile ? 600 : 200);
    }

    /**
     * Set modal state and manage body scroll
     */
    setModalState(isOpen) {
        this.isModalDisplayed = isOpen;
        
        if (isOpen) {
            // Add mobile device class if needed
            if (this.isMobile) {
                document.body.classList.add('mobile-device');
            }
            
            // Prevent scrolling and interaction
            document.body.style.overflow = 'hidden';
            document.body.classList.add('modal-open');
            
            // Blur any currently focused elements
            if (document.activeElement && document.activeElement.blur) {
                document.activeElement.blur();
            }
            
            // Force remove focus from all inputs
            const allInputs = document.querySelectorAll('input, textarea, select');
            allInputs.forEach(input => {
                if (input.blur) input.blur();
                input.classList.add('focus-prevented');
                // Remove autofocus
                if (input.hasAttribute('autofocus')) {
                    input.removeAttribute('autofocus');
                }
            });
            
            // Prevent input focus
            this.preventInputFocus(true);
            
            // Clear any existing timeout
            if (this.preventFocusTimeout) {
                clearTimeout(this.preventFocusTimeout);
                this.preventFocusTimeout = null;
            }
            
        } else {
            // Restore scrolling
            document.body.style.overflow = '';
            document.body.classList.remove('modal-open');
            
            // Remove focus prevention classes
            const allInputs = document.querySelectorAll('input, textarea, select');
            allInputs.forEach(input => {
                input.classList.remove('focus-prevented');
            });
            
            // Allow input focus after delay
            setTimeout(() => {
                this.preventInputFocus(false);
            }, this.isMobile ? 800 : 200);
        }
    }

    /**
     * Prevent input focus during modal display
     */
    preventInputFocus(prevent) {
        const inputs = [this.usernameInput, this.passwordInput].filter(Boolean);
        
        inputs.forEach(input => {
            if (prevent) {
                // Disable input completely
                input.style.pointerEvents = 'none';
                input.style.webkitUserSelect = 'none';
                input.style.userSelect = 'none';
                input.style.cursor = 'default';
                input.style.webkitTouchCallout = 'none';
                input.style.webkitTapHighlightColor = 'transparent';
                
                // Override focus method
                if (input.focus && !input._originalFocus) {
                    input._originalFocus = input.focus;
                    input.focus = () => {
                        console.log('LoginManager: Focus prevented on', input.id);
                    };
                }
                
                // Force blur
                if (input.blur) {
                    input.blur();
                }
                
            } else {
                // Restore input functionality
                input.style.pointerEvents = '';
                input.style.webkitUserSelect = '';
                input.style.userSelect = '';
                input.style.cursor = '';
                input.style.webkitTouchCallout = '';
                input.style.webkitTapHighlightColor = '';
                
                // Restore focus method
                if (input._originalFocus) {
                    input.focus = input._originalFocus;
                    delete input._originalFocus;
                }
            }
        });
    }

    /**
     * Adjust modal for mobile display
     */
    adjustModalForMobile() {
        if (!this.isMobile || !this.modalContent) return;
        
        const viewport = {
            width: window.innerWidth,
            height: window.innerHeight
        };
        
        // Adjust modal position for mobile keyboards
        if (viewport.height < 500) {
            this.modalContent.style.margin = '2vh auto';
            this.modalContent.style.maxHeight = '96vh';
        } else {
            this.modalContent.style.margin = '10vh auto';
            this.modalContent.style.maxHeight = '80vh';
        }
    }

    /**
     * Clear form inputs
     */
    clearForm() {
        if (this.usernameInput) {
            this.usernameInput.value = '';
        }
        if (this.passwordInput) {
            this.passwordInput.value = '';
        }
        
        // Remove validation states
        [this.usernameInput, this.passwordInput].filter(Boolean).forEach(input => {
            input.classList.remove('error', 'success');
            this.removeValidationMessage(input);
        });
        
        // Reset reCAPTCHA
        if (window.grecaptcha) {
            try {
                window.grecaptcha.reset();
            } catch (e) {
                console.log('reCAPTCHA reset failed:', e);
            }
        }
    }

    /**
     * Debounce function for performance
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Destroy the login manager
     */
    destroy() {
        // Clear timeouts and intervals
        if (this.preventFocusTimeout) {
            clearTimeout(this.preventFocusTimeout);
        }
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }
        
        // Remove event listeners (browsers handle this automatically on page unload)
        
        // Restore input functionality
        this.preventInputFocus(false);
        
        // Remove body classes
        document.body.classList.remove('modal-open', 'mobile-device');
        document.body.style.overflow = '';
        
        console.log('LoginManager: Destroyed');
    }
}

// Legacy compatibility functions for existing code
function checkForErrors() {
    if (window.loginManager) {
        window.loginManager.checkForURLParameters();
    }
}

function showModal(title, message, isError = false) {
    if (window.loginManager) {
        window.loginManager.showModal(title, message, isError);
    }
}

function closeModal() {
    if (window.loginManager) {
        window.loginManager.closeModal();
    }
}

function handleLoginError(errorType) {
    if (window.loginManager) {
        window.loginManager.handleLoginError(errorType);
    }
}

function handleLoginMessage(messageType, redirectTo = null) {
    if (window.loginManager) {
        window.loginManager.handleLoginMessage(messageType, redirectTo);
    }
}

// Test functions for debugging
function testLogoutModal() {
    if (window.loginManager) {
        window.loginManager.showModalWithCountdown(
            'Logged Out Successfully', 
            'You have been successfully logged out.', 
            false, 
            true, 
            'https://tattoosbyeder.com/',
            3
        );
    }
}

function testRecaptcha() {
    console.log('Testing reCAPTCHA...');
    console.log('grecaptcha object:', typeof grecaptcha);
    if (typeof grecaptcha !== 'undefined') {
        console.log('reCAPTCHA response:', grecaptcha.getResponse());
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing LoginManager...');
    
    // Initialize the login manager
    window.loginManager = new LoginManager();
    
    // Legacy form submission handling (if needed)
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const submitButton = loginForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton ? submitButton.innerHTML : '';
            
            // Disable submit button to prevent double submission
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.innerHTML = '<i class="ri-loader-4-line"></i> Verifying...';
            }
            
            // Check reCAPTCHA
            if (typeof grecaptcha === 'undefined') {
                showModal(
                    "reCAPTCHA Error",
                    "reCAPTCHA failed to load. Please refresh the page and try again.",
                    true
                );
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalButtonText;
                }
                return;
            }
            
            const recaptchaResponse = grecaptcha.getResponse();
            if (!recaptchaResponse) {
                showModal(
                    "reCAPTCHA Required",
                    "Please complete the reCAPTCHA before submitting.",
                    true
                );
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalButtonText;
                }
                return;
            }

            // If reCAPTCHA is completed, submit the form normally
            setTimeout(() => {
                loginForm.submit();
            }, 500);
        });
    }
    
    // Check for URL parameters after initialization
    checkForErrors();
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (window.loginManager) {
        window.loginManager.destroy();
    }
});

// Global functions for reCAPTCHA callback (if needed)
window.onRecaptchaLoad = function() {
    console.log('LoginManager: reCAPTCHA loaded successfully');
};

window.onRecaptchaExpired = function() {
    console.log('LoginManager: reCAPTCHA expired');
    if (window.loginManager) {
        window.loginManager.showModal(
            'reCAPTCHA Expired',
            'The reCAPTCHA has expired. Please complete it again.',
            true
        );
    }
};

window.onRecaptchaError = function() {
    console.log('LoginManager: reCAPTCHA error');
    if (window.loginManager) {
        window.loginManager.showModal(
            'reCAPTCHA Error',
            'There was an error with the reCAPTCHA. Please try again.',
            true
        );
    }
};