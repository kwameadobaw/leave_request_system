// Manager dashboard specific JavaScript

// Tab switching functionality
function showManagerTab(tabName) {
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
}

// Initialize manager dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    // Add confirmation for approve/reject actions
    const actionForms = document.querySelectorAll('.action-form');
    actionForms.forEach(form => {
        const approveBtn = form.querySelector('.approve-btn');
        const rejectBtn = form.querySelector('.reject-btn');
        
        if (approveBtn) {
            approveBtn.addEventListener('click', function(e) {
                e.preventDefault();
                const requestId = form.querySelector('input[name="request_id"]').value;
                const comment = form.querySelector('textarea[name="comment"]').value;
                
                // Store original button text
                if (!this.dataset.originalText) {
                    this.dataset.originalText = this.innerHTML;
                }
                
                // Show confirmation dialog
                utils.confirm(`Are you sure you want to approve request #${requestId}?`, () => {
                    // Show loading state
                    this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Approving...';
                    this.disabled = true;
                    
                    // Submit the form
                    form.submit();
                });
            });
        }
        
        if (rejectBtn) {
            rejectBtn.addEventListener('click', function(e) {
                e.preventDefault();
                const requestId = form.querySelector('input[name="request_id"]').value;
                const comment = form.querySelector('textarea[name="comment"]').value;
                
                // Check if comment is provided for rejection
                if (!comment.trim()) {
                    utils.showNotification('Please provide a reason for rejection', 'error');
                    form.querySelector('textarea[name="comment"]').focus();
                    return;
                }
                
                // Store original button text
                if (!this.dataset.originalText) {
                    this.dataset.originalText = this.innerHTML;
                }
                
                // Show confirmation dialog
                utils.confirm(`Are you sure you want to reject request #${requestId}?`, () => {
                    // Show loading state
                    this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Rejecting...';
                    this.disabled = true;
                    
                    // Submit the form
                    form.submit();
                });
            });
        }
    });
    
    // Add sorting functionality to the table
    const table = document.querySelector('table');
    if (table) {
        const headers = table.querySelectorAll('th');
        headers.forEach((header, index) => {
            // Skip columns that shouldn't be sortable
            if (['Reason', 'Comment'].includes(header.textContent.trim())) {
                return;
            }
            
            // Add sort indicator and cursor style
            header.style.cursor = 'pointer';
            header.innerHTML += ' <span class="sort-indicator">⇅</span>';
            
            // Add click event for sorting
            header.addEventListener('click', function() {
                sortTable(table, index);
            });
        });
    }
    
    // Function to sort table
    function sortTable(table, columnIndex) {
        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        const header = table.querySelectorAll('th')[columnIndex];
        const indicator = header.querySelector('.sort-indicator');
        
        // Determine sort direction
        const isAscending = indicator.textContent === '⇅' || indicator.textContent === '↓';
        
        // Update all indicators
        table.querySelectorAll('.sort-indicator').forEach(ind => {
            ind.textContent = '⇅';
        });
        
        // Update current indicator
        indicator.textContent = isAscending ? '↑' : '↓';
        
        // Sort rows
        rows.sort((a, b) => {
            const cellA = a.querySelectorAll('td')[columnIndex].textContent.trim();
            const cellB = b.querySelectorAll('td')[columnIndex].textContent.trim();
            
            // Handle different data types
            if (cellA.startsWith('#') && cellB.startsWith('#')) {
                // ID column (numeric)
                return isAscending 
                    ? parseInt(cellA.substring(1)) - parseInt(cellB.substring(1))
                    : parseInt(cellB.substring(1)) - parseInt(cellA.substring(1));
            } else if (!isNaN(Date.parse(cellA)) && !isNaN(Date.parse(cellB))) {
                // Date column
                return isAscending 
                    ? new Date(cellA) - new Date(cellB)
                    : new Date(cellB) - new Date(cellA);
            } else {
                // Text column
                return isAscending 
                    ? cellA.localeCompare(cellB)
                    : cellB.localeCompare(cellA);
            }
        });
        
        // Reorder rows
        rows.forEach(row => {
            tbody.appendChild(row);
        });
    }
    
    // Add search functionality for the table
    const tableContainer = document.querySelector('.requests-table');
    if (tableContainer) {
        // Create search input
        const searchBox = document.createElement('div');
        searchBox.className = 'table-search';
        searchBox.innerHTML = `
            <i class="fas fa-search"></i>
            <input type="text" id="tableSearch" placeholder="Search requests...">
        `;
        
        // Add styles for search box
        if (!document.querySelector('#table-search-styles')) {
            const styles = document.createElement('style');
            styles.id = 'table-search-styles';
            styles.textContent = `
                .table-search {
                    position: relative;
                    margin-bottom: 1rem;
                }
                .table-search i {
                    position: absolute;
                    left: 1rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #6b7280;
                }
                .table-search input {
                    width: 100%;
                    padding: 0.75rem 1rem 0.75rem 2.5rem;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    font-size: 1rem;
                }
                .table-search input:focus {
                    border-color: #4f46e5;
                    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
                }
                tr.hidden {
                    display: none;
                }
            `;
            document.head.appendChild(styles);
        }
        
        tableContainer.insertBefore(searchBox, tableContainer.firstChild);
        
        // Add search functionality
        const searchInput = document.getElementById('tableSearch');
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const rows = table.querySelectorAll('tbody tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    row.classList.remove('hidden');
                } else {
                    row.classList.add('hidden');
                }
            });
        });
    }
    
    // Add animations to request cards
    const requestCards = document.querySelectorAll('.request-card');
    requestCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100 + 300);
    });
    
    // Add hover effects to request cards
    requestCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)';
            this.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
        });
    });
    
    // Add character counter to comment textareas
    const commentTextareas = document.querySelectorAll('textarea[name="comment"]');
    commentTextareas.forEach(textarea => {
        const counterDiv = document.createElement('div');
        counterDiv.className = 'character-counter';
        counterDiv.innerHTML = '<span class="count">0</span> / 200 characters';
        
        // Add styles for character counter
        if (!document.querySelector('#counter-styles')) {
            const styles = document.createElement('style');
            styles.id = 'counter-styles';
            styles.textContent = `
                .character-counter {
                    text-align: right;
                    font-size: 0.75rem;
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
        
        textarea.parentElement.appendChild(counterDiv);
        
        textarea.addEventListener('input', function() {
            const length = this.value.length;
            const countSpan = counterDiv.querySelector('.count');
            countSpan.textContent = length;
            
            // Update counter color based on length
            counterDiv.className = 'character-counter';
            if (length > 180) {
                counterDiv.classList.add('error');
            } else if (length > 150) {
                counterDiv.classList.add('warning');
            }
            
            // Limit to 200 characters
            if (length > 200) {
                this.value = this.value.substring(0, 200);
                countSpan.textContent = '200';
            }
        });
    });
    
    // Add quick comment templates
    commentTextareas.forEach(textarea => {
        const templates = [
            'Approved as requested.',
            'Request approved. Enjoy your time off.',
            'Your leave request has been approved.',
            'Request denied due to staffing constraints.',
            'Please provide more details about your request.',
            'Request rejected. Please discuss with your supervisor.'
        ];
        
        const templateContainer = document.createElement('div');
        templateContainer.className = 'comment-templates';
        templateContainer.innerHTML = '<div class="template-label">Quick templates:</div>';
        
        // Add styles for templates
        if (!document.querySelector('#template-styles')) {
            const styles = document.createElement('style');
            styles.id = 'template-styles';
            styles.textContent = `
                .comment-templates {
                    margin-top: 0.5rem;
                    font-size: 0.875rem;
                }
                .template-label {
                    color: #6b7280;
                    margin-bottom: 0.5rem;
                }
                .template-chips {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                }
                .template-chip {
                    padding: 0.25rem 0.75rem;
                    background: #f3f4f6;
                    border: 1px solid #d1d5db;
                    border-radius: 20px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-size: 0.75rem;
                }
                .template-chip:hover {
                    background: #e5e7eb;
                    border-color: #9ca3af;
                }
            `;
            document.head.appendChild(styles);
        }
        
        const chipsContainer = document.createElement('div');
        chipsContainer.className = 'template-chips';
        
        templates.forEach(template => {
            const chip = document.createElement('div');
            chip.className = 'template-chip';
            chip.textContent = template.length > 25 ? template.substring(0, 25) + '...' : template;
            chip.title = template;
            chip.addEventListener('click', function() {
                textarea.value = template;
                textarea.dispatchEvent(new Event('input')); // Trigger character counter
                textarea.focus();
            });
            chipsContainer.appendChild(chip);
        });
        
        templateContainer.appendChild(chipsContainer);
        textarea.parentElement.appendChild(templateContainer);
    });
    
    // Add bulk action functionality for pending requests
    const pendingTab = document.getElementById('pending-tab');
    if (pendingTab && pendingTab.querySelectorAll('.request-card').length > 1) {
        const bulkActionBar = document.createElement('div');
        bulkActionBar.className = 'bulk-action-bar';
        bulkActionBar.innerHTML = `
            <div class="bulk-action-header">
                <div class="select-all-container">
                    <input type="checkbox" id="selectAll" class="select-all-checkbox">
                    <label for="selectAll">Select All</label>
                </div>
                <div class="bulk-action-count">0 selected</div>
            </div>
            <div class="bulk-action-buttons">
                <button class="bulk-approve-btn" disabled>
                    <i class="fas fa-check"></i> Approve Selected
                </button>
                <button class="bulk-reject-btn" disabled>
                    <i class="fas fa-times"></i> Reject Selected
                </button>
            </div>
        `;
        
        // Add styles for bulk actions
        if (!document.querySelector('#bulk-action-styles')) {
            const styles = document.createElement('style');
            styles.id = 'bulk-action-styles';
            styles.textContent = `
                .bulk-action-bar {
                    background: white;
                    border-radius: 12px;
                    padding: 1rem;
                    margin-bottom: 1.5rem;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 1rem;
                }
                .bulk-action-header {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
                .select-all-container {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .select-all-checkbox {
                    width: 1.25rem;
                    height: 1.25rem;
                }
                .bulk-action-count {
                    padding: 0.25rem 0.75rem;
                    background: #f3f4f6;
                    border-radius: 20px;
                    font-size: 0.875rem;
                    color: #4b5563;
                }
                .bulk-action-buttons {
                    display: flex;
                    gap: 0.75rem;
                }
                .bulk-approve-btn, .bulk-reject-btn {
                    padding: 0.5rem 1rem;
                    border: none;
                    border-radius: 8px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .bulk-approve-btn {
                    background: #10b981;
                    color: white;
                }
                .bulk-approve-btn:hover:not(:disabled) {
                    background: #059669;
                }
                .bulk-reject-btn {
                    background: #ef4444;
                    color: white;
                }
                .bulk-reject-btn:hover:not(:disabled) {
                    background: #dc2626;
                }
                .bulk-approve-btn:disabled, .bulk-reject-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                .request-checkbox {
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    width: 1.25rem;
                    height: 1.25rem;
                    z-index: 10;
                }
                .request-card {
                    position: relative;
                }
                .request-card.selected {
                    border: 2px solid #4f46e5;
                    background: rgba(79, 70, 229, 0.05);
                }
            `;
            document.head.appendChild(styles);
        }
        
        // Insert bulk action bar at the top of the pending tab
        const cardContainer = pendingTab.querySelector('.card-body');
        cardContainer.insertBefore(bulkActionBar, cardContainer.firstChild);
        
        // Add checkboxes to each request card
        const requestCards = pendingTab.querySelectorAll('.request-card');
        requestCards.forEach(card => {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'request-checkbox';
            checkbox.dataset.requestId = card.querySelector('input[name="request_id"]').value;
            
            card.appendChild(checkbox);
            
            checkbox.addEventListener('change', function() {
                if (this.checked) {
                    card.classList.add('selected');
                } else {
                    card.classList.remove('selected');
                }
                updateSelectedCount();
            });
        });
        
        // Select all functionality
        const selectAllCheckbox = document.getElementById('selectAll');
        selectAllCheckbox.addEventListener('change', function() {
            const checkboxes = pendingTab.querySelectorAll('.request-checkbox');
            checkboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
                const card = checkbox.closest('.request-card');
                if (this.checked) {
                    card.classList.add('selected');
                } else {
                    card.classList.remove('selected');
                }
            });
            updateSelectedCount();
        });
        
        // Update selected count
        function updateSelectedCount() {
            const selectedCount = pendingTab.querySelectorAll('.request-checkbox:checked').length;
            const countElement = bulkActionBar.querySelector('.bulk-action-count');
            countElement.textContent = `${selectedCount} selected`;
            
            const approveBtn = bulkActionBar.querySelector('.bulk-approve-btn');
            const rejectBtn = bulkActionBar.querySelector('.bulk-reject-btn');
            
            if (selectedCount > 0) {
                approveBtn.disabled = false;
                rejectBtn.disabled = false;
            } else {
                approveBtn.disabled = true;
                rejectBtn.disabled = true;
            }
        }
        
        // Bulk approve functionality
        const bulkApproveBtn = bulkActionBar.querySelector('.bulk-approve-btn');
        bulkApproveBtn.addEventListener('click', function() {
            const selectedCheckboxes = pendingTab.querySelectorAll('.request-checkbox:checked');
            const selectedIds = Array.from(selectedCheckboxes).map(checkbox => checkbox.dataset.requestId);
            
            if (selectedIds.length === 0) return;
            
            utils.confirm(`Are you sure you want to approve ${selectedIds.length} requests?`, () => {
                utils.showNotification(`Bulk approve functionality would be implemented here for IDs: ${selectedIds.join(', ')}`, 'info');
            });
        });
        
        // Bulk reject functionality
        const bulkRejectBtn = bulkActionBar.querySelector('.bulk-reject-btn');
        bulkRejectBtn.addEventListener('click', function() {
            const selectedCheckboxes = pendingTab.querySelectorAll('.request-checkbox:checked');
            const selectedIds = Array.from(selectedCheckboxes).map(checkbox => checkbox.dataset.requestId);
            
            if (selectedIds.length === 0) return;
            
            // Prompt for rejection reason
            const reason = prompt('Please provide a reason for rejecting these requests:');
            if (!reason) return;
            
            utils.confirm(`Are you sure you want to reject ${selectedIds.length} requests?`, () => {
                utils.showNotification(`Bulk reject functionality would be implemented here for IDs: ${selectedIds.join(', ')} with reason: ${reason}`, 'info');
            });
        });
    }
});