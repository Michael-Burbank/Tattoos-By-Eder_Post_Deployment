// Welcome Modal - Perfect Centering with Scrollbar Preservation
class WelcomeModal {
  constructor() {
    this.modal = document.getElementById('welcome-modal');
    this.closeBtn = document.querySelector('.welcome-close-btn');
    this.claimBtn = document.getElementById('claim-offer-btn');
    this.laterBtn = document.getElementById('maybe-later-btn');
    
    // Configuration
    this.config = {
      delayBeforeShow: 3000, // 3 seconds after page load
      autoCloseDelay: 20000  // 20 seconds auto-close
    };
    
    this.autoCloseTimer = null;
    this.scrollPosition = 0;
    this.scrollbarWidth = 0;
    
    this.init();
  }
  
  init() {
    
    this.bindEvents();
    
    // Show modal after delay
    setTimeout(() => this.showModal(), this.config.delayBeforeShow);
  }
  
  bindEvents() {
    // Close button
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.closeModal();
      });
    }
    
    // Claim offer button
    if (this.claimBtn) {
      this.claimBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.closeModal();
        this.scrollToContactForm();
      });
    }
    
    // Maybe later button
    if (this.laterBtn) {
      this.laterBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.closeModal();
      });
    }
    
    // Close on background click
    if (this.modal) {
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) {
          this.closeModal();
        }
      });
    }
    
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isModalOpen()) {
        this.closeModal();
      }
    });
    
    // Prevent modal from closing when clicking inside modal content
    const modalContent = this.modal?.querySelector('.welcome-modal-content');
    if (modalContent) {
      modalContent.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }
  }
  
  // Calculate scrollbar width
  getScrollbarWidth() {
    // Method 1: Viewport difference
    const viewportWidth = window.innerWidth - document.documentElement.clientWidth;
    
    // Method 2: Create temporary scrollable element
    const outer = document.createElement('div');
    outer.style.visibility = 'hidden';
    outer.style.overflow = 'scroll';
    outer.style.msOverflowStyle = 'scrollbar';
    outer.style.width = '100px';
    outer.style.height = '100px';
    document.body.appendChild(outer);
    
    const inner = document.createElement('div');
    inner.style.width = '100%';
    inner.style.height = '100%';
    outer.appendChild(inner);
    
    const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
    outer.parentNode.removeChild(outer);
    
    // Use the more reliable measurement
    return Math.max(viewportWidth, scrollbarWidth);
  }
  
  // Store current scroll position
  storeScrollPosition() {
    this.scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
  }
  
  // Restore scroll position
  restoreScrollPosition() {
    window.scrollTo(0, this.scrollPosition);
  }
  
  // Apply scroll lock with scrollbar preservation
  applyScrollLock() {
    // Store current scroll position
    this.storeScrollPosition();
    
    // Calculate scrollbar width
    this.scrollbarWidth = this.getScrollbarWidth();
    
    // Apply CSS classes for modern browsers with scrollbar-gutter support
    document.documentElement.classList.add('modal-open');
    document.body.classList.add('modal-open');
    
    // Fallback for browsers without scrollbar-gutter support
    if (!CSS.supports('scrollbar-gutter', 'stable')) {
      // Use position fixed method for better compatibility
      document.body.style.position = 'fixed';
      document.body.style.top = `-${this.scrollPosition}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      // Add padding to compensate for scrollbar if needed
      if (this.scrollbarWidth > 0) {
        document.body.style.paddingRight = `${this.scrollbarWidth}px`;
      }
    }
    
  }
  
  // Remove scroll lock and restore state
  removeScrollLock() {
    // Remove CSS classes
    document.documentElement.classList.remove('modal-open');
    document.body.classList.remove('modal-open');
    
    // Remove inline styles (fallback method)
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    
    // Restore scroll position
    this.restoreScrollPosition();
  }
  
  showModal() {
    if (!this.modal) return;
    
    try {
      // Apply scroll lock before showing modal
      this.applyScrollLock();
      
      // Show the modal
      this.modal.style.display = 'block';
      
      
      // Focus management for accessibility
      setTimeout(() => {
        const firstFocusable = this.modal.querySelector('.claim-offer-btn, .welcome-close-btn');
        if (firstFocusable) {
          firstFocusable.focus();
        }
      }, 100);
      
      // Auto-close timer
      this.autoCloseTimer = setTimeout(() => {
        console.log('WelcomeModal: Auto-closing modal');
        this.closeModal();
      }, this.config.autoCloseDelay);
      
    } catch (error) {
      console.error('WelcomeModal: Error showing modal:', error);
    }
  }
  
  closeModal() {
    if (!this.modal) return;
    
    try {
      this.modal.style.display = 'none';
      
      // Remove scroll lock and restore scroll position
      this.removeScrollLock();
      
      // Clear auto-close timer
      if (this.autoCloseTimer) {
        clearTimeout(this.autoCloseTimer);
        this.autoCloseTimer = null;
      }
      
    } catch (error) {
      console.error('WelcomeModal: Error closing modal:', error);
    }
  }
  
  scrollToContactForm() {
    const contactForm = document.getElementById('contact');
    if (contactForm) {
      setTimeout(() => {
        contactForm.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
        
        // Simple highlight effect
        setTimeout(() => {
          const originalBoxShadow = contactForm.style.boxShadow;
          contactForm.style.transition = 'box-shadow 0.5s ease';
          contactForm.style.boxShadow = '0 0 40px rgba(212, 175, 55, 0.8)';
          
          setTimeout(() => {
            contactForm.style.boxShadow = originalBoxShadow;
          }, 3000);
        }, 500);
      }, 100);
    } else {
      console.warn('WelcomeModal: Contact form not found');
    }
  }
  
  // Utility method to check if modal is currently open
  isModalOpen() {
    return this.modal && this.modal.style.display === 'block';
  }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  // Only initialize on main pages, not admin/login pages
  const currentPath = window.location.pathname.toLowerCase();
  const excludePaths = ['/login/', '/admin/', '/dashboard/', '/api/'];
  const shouldInitialize = !excludePaths.some(path => currentPath.includes(path));
  
  if (shouldInitialize) {
    
    setTimeout(() => {
      try {
        window.welcomeModal = new WelcomeModal();
      } catch (error) {
        console.error('WelcomeModal: Failed to initialize:', error);
      }
    }, 1000);
  } 
});

// Enhanced testing utilities
window.WelcomeModalUtils = {
  forceShow: function() {
    if (window.welcomeModal) {
      window.welcomeModal.showModal();
    } else {
      console.warn('WelcomeModal: Modal instance not found');
    }
  },
  
  forceClose: function() {
    if (window.welcomeModal) {
      window.welcomeModal.closeModal();
    } else {
      console.warn('WelcomeModal: Modal instance not found');
    }
  },
  
  getStatus: function() {
    return {
      modalOpen: window.welcomeModal ? window.welcomeModal.isModalOpen() : false,
      elementExists: !!document.getElementById('welcome-modal'),
      bodyHasModalClass: document.body.classList.contains('modal-open'),
      htmlHasModalClass: document.documentElement.classList.contains('modal-open'),
      currentScrollPosition: window.pageYOffset || document.documentElement.scrollTop,
      storedScrollPosition: window.welcomeModal ? window.welcomeModal.scrollPosition : 0
    };
  },
  
  checkScrollbarInfo: function() {
    const modal = window.welcomeModal;
    return {
      scrollbarWidth: modal ? modal.scrollbarWidth : 'Not calculated',
      hasVerticalScrollbar: document.body.scrollHeight > window.innerHeight,
      bodyPaddingRight: getComputedStyle(document.body).paddingRight,
      bodyPosition: getComputedStyle(document.body).position,
      supportsScrollbarGutter: CSS.supports('scrollbar-gutter', 'stable'),
      viewportWidth: window.innerWidth,
      documentWidth: document.documentElement.clientWidth,
      calculatedScrollbarWidth: window.innerWidth - document.documentElement.clientWidth
    };
  },
  
  testScrollbarPreservation: function() {
    console.log('=== Testing Scrollbar Preservation ===');
    
    const before = {
      bodyWidth: document.body.offsetWidth,
      scrollPosition: window.pageYOffset,
      hasScrollbar: document.body.scrollHeight > window.innerHeight
    };
    console.log('Before modal:', before);
    
    this.forceShow();
    
    setTimeout(() => {
      const during = {
        bodyWidth: document.body.offsetWidth,
        bodyPadding: getComputedStyle(document.body).paddingRight,
        layoutShift: Math.abs(before.bodyWidth - document.body.offsetWidth)
      };
      console.log('During modal:', during);
      
      this.forceClose();
      
      setTimeout(() => {
        const after = {
          bodyWidth: document.body.offsetWidth,
          scrollPosition: window.pageYOffset,
          scrollRestored: Math.abs(before.scrollPosition - window.pageYOffset) < 5
        };
        console.log('After modal:', after);
        
      }, 500);
    }, 500);
  }
};