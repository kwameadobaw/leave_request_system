// Employee dashboard specific JavaScript

// Initialize employee dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    // Form validation for new request
    const requestForm = document.querySelector('.request-form');
    if (requestForm) {
        const startDateInput = document.getElementById('start_date');
        const endDateInput = document.getElementById('end_date');
        const reasonInput = document.getElementById('reason');
        
        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        startDateInput.min = today;
        endDateInput.min = today;
        
        // Update end date minimum when start date changes
        startDateInput.addEventListener('change', function() {
            endDateInput.min = this.value;
            if (endDateInput.value && endDateInput.value < this.value) {
                endDateInput.value = this.value;
            }
            updateDurationDisplay();
        });
        
        // Update duration display when end date changes
        endDateInput.addEventListener('change', function() {
            updateDurationDisplay();
        });
        
        // Function to update duration display
        function updateDurationDisplay() {
            if (startDateInput.value && endDateInput.value) {
                const days = utils.calculateDays(startDateInput.value, endDateInput.value);
                
                // Remove existing duration display
                const existingDuration = document.querySelector('.duration-display');
                if (existingDuration) {
                    existingDuration.remove();
                }
                
                // Add new duration display
                const durationDiv = document.createElement('div');
                durationDiv.className = 'duration-display';
                durationDiv.innerHTML = `
                    <i class="fas fa-calendar-day"></i>
                    <span>Duration: <strong>${days} day${days !== 1 ? 's' : ''}</strong></span>
                `;
                
                // Add styles if not already present
                if (!document.querySelector('#duration-styles')) {
                    const styles = document.createElement('style');
                    styles.id = 'duration-styles';
                    styles.textContent = `
                        .duration-display {
                            display: flex;
                            align-items: center;
                            gap: 0.5rem;
                            padding: 0.75rem 1rem;
                            background: #e0f2fe;
                            border: 1px solid #0891b2;
                            border-radius: 8px;
                            color: #0c4a6e;
                            font-size: 0.875rem;
                            margin-top: 0.5rem;
                            animation: fadeIn 0.3s ease;
                        }
                    `;
                    document.head.appendChild(styles);
                }
                
                endDateInput.parentElement.appendChild(durationDiv);
            }
        }
        
        // Form submission validation
        requestForm.addEventListener('submit', function(e) {
            const startDate = startDateInput.value;
            const endDate = endDateInput.value;
            const reason = reasonInput.value.trim();
            
            // Validate required fields
            if (!startDate || !endDate || !reason) {
                e.preventDefault();
                utils.showNotification('Please fill in all required fields', 'error');
                return;
            }
            
            // Validate date range
            const dateError = validation.validateDateRange(startDate, endDate);
            if (dateError) {
                e.preventDefault();
                utils.showNotification(dateError, 'error');
                return;
            }
            
            // Validate reason length
            if (reason.length < 10) {
                e.preventDefault();
                utils.showNotification('Please provide a more detailed reason (at least 10 characters)', 'error');
                return;
            }
            
            // Check for weekend-only requests (optional warning)
            const start = new Date(startDate);
            const end = new Date(endDate);
            const isWeekendOnly = isOnlyWeekends(start, end);
            
            if (isWeekendOnly) {
                const confirmed = confirm('Your request only covers weekends. Are you sure you want to submit this request?');
                if (!confirmed) {
                    e.preventDefault();
                    return;
                }
            }
            
            // Show success message
            utils.showNotification('Submitting your request...', 'info');
        });
    }
    
    // Function to check if date range only covers weekends
    function isOnlyWeekends(startDate, endDate) {
        const current = new Date(startDate);
        const end = new Date(endDate);
        
        while (current <= end) {
            const dayOfWeek = current.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
                return false;
            }
            current.setDate(current.getDate() + 1);
        }
        
        return true;
    }
    
    // Add character counter to reason textarea
    const reasonTextarea = document.getElementById('reason');
    if (reasonTextarea) {
        const counterDiv = document.createElement('div');
        counterDiv.className = 'character-counter';
        counterDiv.innerHTML = '<span class="count">0</span> / 500 characters';
        
        // Add styles for character counter
        if (!document.querySelector('#counter-styles')) {
            const styles = document.createElement('style');
            styles.id = 'counter-styles';
            styles.textContent = `
                .character-counter {
                    text-align: right;
                    font-size: 0.875rem;
                    color: #6b7280;
                    margin-top: 0.25rem;
                }
                .character-counter.warning {
                    color: #f59e0b;
                }
                .character-counter.error {
                    color: #ef4444;
                }
            `;
            document.head.appendChild(styles);
        }
        
        reasonTextarea.parentElement.appendChild(counterDiv);
        
        reasonTextarea.addEventListener('input', function() {
            const length = this.value.length;
            const countSpan = counterDiv.querySelector('.count');
            countSpan.textContent = length;
            
            // Update counter color based on length
            counterDiv.className = 'character-counter';
            if (length > 450) {
                counterDiv.classList.add('error');
            } else if (length > 400) {
                counterDiv.classList.add('warning');
            }
            
            // Limit to 500 characters
            if (length > 500) {
                this.value = this.value.substring(0, 500);
                countSpan.textContent = '500';
            }
        });
    }
    
    // Add animations to request history items
    const requestItems = document.querySelectorAll('.request-item');
    requestItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-20px)';
        
        setTimeout(() => {
            item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateX(0)';
        }, index * 100 + 300);
    });
    
    // Add hover effects to request items
    requestItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(5px)';
            this.style.transition = 'transform 0.3s ease';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0)';
        });
    });
    
    // Add copy functionality to request details
    const requestDetails = document.querySelectorAll('.request-item');
    requestDetails.forEach(item => {
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-request-btn';
        copyButton.innerHTML = '<i class="fas fa-copy"></i>';
        copyButton.title = 'Copy request details';
        
        // Add styles for copy button
        if (!document.querySelector('#copy-btn-styles')) {
            const styles = document.createElement('style');
            styles.id = 'copy-btn-styles';
            styles.textContent = `
                .copy-request-btn {
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    background: rgba(79, 70, 229, 0.1);
                    border: 1px solid rgba(79, 70, 229, 0.2);
                    color: #4f46e5;
                    padding: 0.5rem;
                    border-radius: 6px;
                    cursor: pointer;
                    opacity: 0;
                    transition: all 0.3s ease;
                }
                .request-item {
                    position: relative;
                }
                .request-item:hover .copy-request-btn {
                    opacity: 1;
                }
                .copy-request-btn:hover {
                    background: rgba(79, 70, 229, 0.2);
                }
            `;
            document.head.appendChild(styles);
        }
        
        item.appendChild(copyButton);
        
        copyButton.addEventListener('click', function() {
            const requestId = item.querySelector('.request-id').textContent;
            const dates = item.querySelector('.detail-value').textContent;
            const reason = item.querySelectorAll('.detail-value')[1].textContent;
            const status = item.querySelector('.request-status').textContent.trim();
            
            const copyText = `${requestId}\nDates: ${dates}\nReason: ${reason}\nStatus: ${status}`;
            
            navigator.clipboard.writeText(copyText).then(() => {
                utils.showNotification('Request details copied to clipboard', 'success');
                this.innerHTML = '<i class="fas fa-check"></i>';
                setTimeout(() => {
                    this.innerHTML = '<i class="fas fa-copy"></i>';
                }, 2000);
            }).catch(() => {
                utils.showNotification('Failed to copy to clipboard', 'error');
            });
        });
    });
    
    // Add quick actions for pending requests
    const pendingRequests = document.querySelectorAll('.request-item.pending');
    pendingRequests.forEach(item => {
        const quickActions = document.createElement('div');
        quickActions.className = 'quick-actions';
        quickActions.innerHTML = `
            <button class="quick-action-btn edit-btn" title="Edit request">
                <i class="fas fa-edit"></i>
            </button>
            <button class="quick-action-btn cancel-btn" title="Cancel request">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add styles for quick actions
        if (!document.querySelector('#quick-actions-styles')) {
            const styles = document.createElement('style');
            styles.id = 'quick-actions-styles';
            styles.textContent = `
                .quick-actions {
                    display: flex;
                    gap: 0.5rem;
                    margin-top: 1rem;
                    padding-top: 1rem;
                    border-top: 1px solid rgba(0, 0, 0, 0.1);
                }
                .quick-action-btn {
                    padding: 0.5rem 1rem;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.875rem;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .edit-btn {
                    background: #3b82f6;
                    color: white;
                }
                .edit-btn:hover {
                    background: #2563eb;
                }
                .cancel-btn {
                    background: #ef4444;
                    color: white;
                }
                .cancel-btn:hover {
                    background: #dc2626;
                }
            `;
            document.head.appendChild(styles);
        }
        
        item.appendChild(quickActions);
        
        // Add event listeners for quick actions
        const editBtn = quickActions.querySelector('.edit-btn');
        const cancelBtn = quickActions.querySelector('.cancel-btn');
        
        editBtn.addEventListener('click', function() {
            utils.showNotification('Edit functionality would be implemented here', 'info');
        });
        
        cancelBtn.addEventListener('click', function() {
            utils.confirm('Are you sure you want to cancel this request?', () => {
                utils.showNotification('Cancel functionality would be implemented here', 'info');
            });
        });
    });
    
    // Add auto-save functionality for the form
    const formInputs = document.querySelectorAll('.request-form input, .request-form textarea');
    formInputs.forEach(input => {
        // Load saved data
        const savedValue = localStorage.getItem(`draft_${input.name}`);
        if (savedValue && !input.value) {
            input.value = savedValue;
            if (input.name === 'reason') {
                input.dispatchEvent(new Event('input')); // Trigger character counter
            }
        }
        
        // Save data on input
        input.addEventListener('input', function() {
            localStorage.setItem(`draft_${this.name}`, this.value);
        });
    });
    
    // Clear draft data on successful form submission
    if (requestForm) {
        requestForm.addEventListener('submit', function() {
            formInputs.forEach(input => {
                localStorage.removeItem(`draft_${input.name}`);
            });
        });
    }
});