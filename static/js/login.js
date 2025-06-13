// Login page specific JavaScript

// Tab switching functionality
function showTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.classList.remove('active');
    });
    
    // Show selected tab content
    const selectedTab = document.getElementById(tabName + '-tab');
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Add active class to clicked button
    const clickedButton = event.target.closest('.tab-btn');
    if (clickedButton) {
        clickedButton.classList.add('active');
    }
    
    // Clear form fields when switching tabs
    const activeForm = selectedTab.querySelector('form');
    if (activeForm) {
        activeForm.reset();
    }
    
    // Focus on first input field
    setTimeout(() => {
        const firstInput = selectedTab.querySelector('input');
        if (firstInput) {
            firstInput.focus();
        }
    }, 100);
}

// Initialize login page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Add keyboard navigation for tabs
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach((button, index) => {
        button.addEventListener('keydown', function(e) {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                e.preventDefault();
                const nextIndex = e.key === 'ArrowRight' 
                    ? (index + 1) % tabButtons.length 
                    : (index - 1 + tabButtons.length) % tabButtons.length;
                tabButtons[nextIndex].click();
                tabButtons[nextIndex].focus();
            }
        });
    });
    
    // Add basic form validation (only check for empty fields)
    const forms = document.querySelectorAll('.login-form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const userType = this.querySelector('input[name="user_type"]').value;
            
            if (userType === 'employee') {
                const username = this.querySelector('input[name="username"]').value.trim();
                if (!username) {
                    e.preventDefault();
                    utils.showNotification('Please enter your username', 'error');
                    return;
                }
            } else {
                const password = this.querySelector('input[name="password"]').value;
                if (!password) {
                    e.preventDefault();
                    utils.showNotification('Please enter the password', 'error');
                    return;
                }
            }
            
            // Add loading state to submit button
            const submitBtn = this.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
                
                // Re-enable button after 3 seconds in case of redirect failure
                setTimeout(() => {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                }, 3000);
            }
            
            // Allow form to submit
            console.log('Form submitting with data:', {
                userType: userType,
                username: userType === 'employee' ? this.querySelector('input[name="username"]').value : 'N/A',
                password: userType !== 'employee' ? '***' : 'N/A'
            });
        });
    });
    
    // Add password visibility toggle
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    passwordInputs.forEach(input => {
        const container = input.parentElement;
        const toggleButton = document.createElement('button');
        toggleButton.type = 'button';
        toggleButton.className = 'password-toggle';
        toggleButton.innerHTML = '<i class="fas fa-eye"></i>';
        toggleButton.setAttribute('aria-label', 'Toggle password visibility');
        
        // Add styles for the toggle button
        if (!document.querySelector('#password-toggle-styles')) {
            const styles = document.createElement('style');
            styles.id = 'password-toggle-styles';
            styles.textContent = `
                .form-group {
                    position: relative;
                }
                .password-toggle {
                    position: absolute;
                    right: 1rem;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    color: #6b7280;
                    cursor: pointer;
                    padding: 0.25rem;
                    border-radius: 4px;
                    transition: color 0.3s ease;
                }
                .password-toggle:hover {
                    color: #4f46e5;
                }
                .form-group:has(.password-toggle) input {
                    padding-right: 3rem;
                }
            `;
            document.head.appendChild(styles);
        }
        
        container.appendChild(toggleButton);
        
        toggleButton.addEventListener('click', function() {
            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';
            this.innerHTML = isPassword 
                ? '<i class="fas fa-eye-slash"></i>' 
                : '<i class="fas fa-eye"></i>';
            this.setAttribute('aria-label', 
                isPassword ? 'Hide password' : 'Show password'
            );
        });
    });
    
    // Add enter key navigation between forms
    const inputs = document.querySelectorAll('input');
    inputs.forEach((input, index) => {
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                const form = this.closest('form');
                const formInputs = form.querySelectorAll('input');
                const currentIndex = Array.from(formInputs).indexOf(this);
                
                if (currentIndex < formInputs.length - 1) {
                    e.preventDefault();
                    formInputs[currentIndex + 1].focus();
                }
            }
        });
    });
    
    // Add animation to login card
    const loginCard = document.querySelector('.login-card');
    if (loginCard) {
        // Add a subtle hover effect
        loginCard.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.transition = 'transform 0.3s ease';
        });
        
        loginCard.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    }
    
    // Auto-focus on first input when page loads
    const firstInput = document.querySelector('.tab-content.active input');
    if (firstInput) {
        setTimeout(() => {
            firstInput.focus();
        }, 500);
    }
    
    // Remove duplicate button click handler - form submission is handled above
    
    // Add subtle animations to form elements
    const formGroups = document.querySelectorAll('.form-group');
    formGroups.forEach((group, index) => {
        group.style.opacity = '0';
        group.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            group.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            group.style.opacity = '1';
            group.style.transform = 'translateY(0)';
        }, index * 100 + 200);
    });
});