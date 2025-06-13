// Security dashboard specific JavaScript

// Initialize security dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', filterRequests);
    }
    
    // Function to filter requests based on search input
    function filterRequests() {
        const searchTerm = searchInput.value.toLowerCase();
        const securityCards = document.querySelectorAll('.security-card');
        
        securityCards.forEach(card => {
            const employeeName = card.dataset.employee;
            const cardText = card.textContent.toLowerCase();
            
            if (cardText.includes(searchTerm) || employeeName.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
        
        // Update stats after filtering
        updateFilterStats();
    }
    
    // Function to update stats based on visible cards
    function updateFilterStats() {
        const visibleCards = document.querySelectorAll('.security-card[style="display: block;"]');
        const totalVisible = visibleCards.length;
        
        // Update the stats
        const statNumbers = document.querySelectorAll('.stat-number');
        if (statNumbers.length > 0) {
            statNumbers[0].textContent = totalVisible;
        }
        
        // Show message if no results
        const noResults = document.querySelector('.no-results');
        const securityGrid = document.querySelector('.security-grid');
        
        if (totalVisible === 0 && !noResults) {
            const noResultsDiv = document.createElement('div');
            noResultsDiv.className = 'no-results';
            noResultsDiv.innerHTML = `
                <i class="fas fa-search"></i>
                <h3>No Results Found</h3>
                <p>No employees match your search criteria.</p>
            `;
            
            // Add styles for no results
            if (!document.querySelector('#no-results-styles')) {
                const styles = document.createElement('style');
                styles.id = 'no-results-styles';
                styles.textContent = `
                    .no-results {
                        text-align: center;
                        padding: 3rem 2rem;
                        color: #6b7280;
                        background: white;
                        border-radius: 12px;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                        grid-column: 1 / -1;
                    }
                    .no-results i {
                        font-size: 3rem;
                        margin-bottom: 1rem;
                        opacity: 0.5;
                    }
                    .no-results h3 {
                        margin-bottom: 0.5rem;
                        color: #374151;
                    }
                `;
                document.head.appendChild(styles);
            }
            
            securityGrid.appendChild(noResultsDiv);
        } else if (totalVisible > 0 && noResults) {
            noResults.remove();
        }
    }
    
    // Add animations to security cards
    const securityCards = document.querySelectorAll('.security-card');
    securityCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100 + 300);
    });
    
    // Add hover effects to security cards
    securityCards.forEach(card => {
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
    
    // Add date filter functionality
    const cardHeader = document.querySelector('.card-header');
    if (cardHeader) {
        const dateFilter = document.createElement('div');
        dateFilter.className = 'date-filter';
        dateFilter.innerHTML = `
            <label for="dateFilter">
                <i class="fas fa-calendar-alt"></i>
                Filter by date:
            </label>
            <select id="dateFilter">
                <option value="all">All dates</option>
                <option value="today">Today</option>
                <option value="tomorrow">Tomorrow</option>
                <option value="week">This week</option>
                <option value="month">This month</option>
            </select>
        `;
        
        // Add styles for date filter
        if (!document.querySelector('#date-filter-styles')) {
            const styles = document.createElement('style');
            styles.id = 'date-filter-styles';
            styles.textContent = `
                .date-filter {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-top: 1rem;
                }
                .date-filter label {
                    color: #6b7280;
                    font-size: 0.875rem;
                }
                .date-filter select {
                    padding: 0.5rem 1rem;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    font-size: 0.875rem;
                    background: white;
                }
                .date-filter select:focus {
                    border-color: #4f46e5;
                    outline: none;
                }
            `;
            document.head.appendChild(styles);
        }
        
        cardHeader.appendChild(dateFilter);
        
        // Add event listener for date filter
        const dateFilterSelect = document.getElementById('dateFilter');
        dateFilterSelect.addEventListener('change', function() {
            const filterValue = this.value;
            const securityCards = document.querySelectorAll('.security-card');
            
            securityCards.forEach(card => {
                // Reset display first (in case search filter is also applied)
                if (card.style.display === 'none' && searchInput.value === '') {
                    card.style.display = 'block';
                }
                
                const startDateText = card.querySelector('.detail-content .value').textContent;
                const startDate = new Date(startDateText);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);
                
                const nextWeek = new Date(today);
                nextWeek.setDate(nextWeek.getDate() + 7);
                
                const nextMonth = new Date(today);
                nextMonth.setMonth(nextMonth.getMonth() + 1);
                
                let showCard = true;
                
                switch (filterValue) {
                    case 'today':
                        showCard = startDate.toDateString() === today.toDateString();
                        break;
                    case 'tomorrow':
                        showCard = startDate.toDateString() === tomorrow.toDateString();
                        break;
                    case 'week':
                        showCard = startDate >= today && startDate < nextWeek;
                        break;
                    case 'month':
                        showCard = startDate >= today && startDate < nextMonth;
                        break;
                    default: // 'all'
                        showCard = true;
                }
                
                if (!showCard) {
                    card.style.display = 'none';
                }
            });
            
            // Update stats after filtering
            updateFilterStats();
        });
    }
    
    // Add print functionality
    const cardBody = document.querySelector('.card-body');
    if (cardBody) {
        const printButton = document.createElement('button');
        printButton.className = 'print-button';
        printButton.innerHTML = '<i class="fas fa-print"></i> Print Report';
        
        // Add styles for print button
        if (!document.querySelector('#print-button-styles')) {
            const styles = document.createElement('style');
            styles.id = 'print-button-styles';
            styles.textContent = `
                .print-button {
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    padding: 0.5rem 1rem;
                    background: #4f46e5;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    transition: all 0.3s ease;
                }
                .print-button:hover {
                    background: #4338ca;
                    transform: translateY(-2px);
                }
                .card {
                    position: relative;
                }
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .security-grid, .security-grid * {
                        visibility: visible;
                    }
                    .security-grid {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    .print-button, .search-box, .date-filter {
                        display: none !important;
                    }
                }
            `;
            document.head.appendChild(styles);
        }
        
        cardBody.appendChild(printButton);
        
        printButton.addEventListener('click', function() {
            window.print();
        });
    }
    
    // Add export functionality
    if (cardBody) {
        const exportButton = document.createElement('button');
        exportButton.className = 'export-button';
        exportButton.innerHTML = '<i class="fas fa-file-export"></i> Export CSV';
        
        // Add styles for export button
        if (!document.querySelector('#export-button-styles')) {
            const styles = document.createElement('style');
            styles.id = 'export-button-styles';
            styles.textContent = `
                .export-button {
                    position: absolute;
                    top: 1rem;
                    right: 8rem;
                    padding: 0.5rem 1rem;
                    background: #10b981;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    transition: all 0.3s ease;
                }
                .export-button:hover {
                    background: #059669;
                    transform: translateY(-2px);
                }
            `;
            document.head.appendChild(styles);
        }
        
        cardBody.appendChild(exportButton);
        
        exportButton.addEventListener('click', function() {
            // Get visible cards
            const visibleCards = Array.from(document.querySelectorAll('.security-card'))
                .filter(card => card.style.display !== 'none');
            
            if (visibleCards.length === 0) {
                utils.showNotification('No data to export', 'error');
                return;
            }
            
            // Create CSV content
            let csvContent = 'Employee,Request ID,Start Date,End Date,Reason\n';
            
            visibleCards.forEach(card => {
                const employee = card.querySelector('h3').textContent;
                const requestId = card.querySelector('.request-id').textContent.replace('Request #', '');
                const startDate = card.querySelectorAll('.detail-content .value')[0].textContent;
                const endDate = card.querySelectorAll('.detail-content .value')[1].textContent;
                const reason = card.querySelector('.reason-text').textContent.replace(/,/g, ';');
                
                csvContent += `"${employee}",${requestId},"${startDate}","${endDate}","${reason}"\n`;
            });
            
            // Create download link
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', 'approved_leave_requests.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            utils.showNotification('CSV file exported successfully', 'success');
        });
    }
    
    // Add real-time clock
    const dashboardHeader = document.querySelector('.dashboard-header');
    if (dashboardHeader) {
        const clockDiv = document.createElement('div');
        clockDiv.className = 'real-time-clock';
        clockDiv.innerHTML = '<i class="fas fa-clock"></i> <span id="clock"></span>';
        
        // Add styles for clock
        if (!document.querySelector('#clock-styles')) {
            const styles = document.createElement('style');
            styles.id = 'clock-styles';
            styles.textContent = `
                .real-time-clock {
                    margin-top: 1rem;
                    padding: 0.5rem 1rem;
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 20px;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 1.1rem;
                    backdrop-filter: blur(5px);
                }
            `;
            document.head.appendChild(styles);
        }
        
        dashboardHeader.appendChild(clockDiv);
        
        // Update clock every second
        function updateClock() {
            const now = new Date();
            const timeString = now.toLocaleTimeString();
            const dateString = now.toLocaleDateString(undefined, { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            
            document.getElementById('clock').textContent = `${dateString} ${timeString}`;
            setTimeout(updateClock, 1000);
        }
        
        updateClock();
    }
});