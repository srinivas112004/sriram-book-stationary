document.addEventListener('DOMContentLoaded', () => {
    const ordersContainer = document.getElementById('orders-container');
    const searchBar = document.getElementById('search-bar');
    const currentDateEl = document.getElementById('current-date');
    const SERVER_URL = '';

    // --- Set Current Date in Header with Real-time Updates ---
    if (currentDateEl) {
        const updateDateTime = () => {
            const now = new Date();
            const options = { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            };
            currentDateEl.textContent = now.toLocaleDateString('en-US', options);
        };
        
        updateDateTime();
        setInterval(updateDateTime, 60000); // Update every minute
    }

    // --- STATE ---
    let allOrders = [];

    // --- UI RENDERING ---
    const showSkeletonLoader = () => {
        let loaderHTML = '';
        for (let i = 0; i < 5; i++) {
            loaderHTML += '<div class="skeleton skeleton-card"></div>';
        }
        ordersContainer.innerHTML = loaderHTML;
    };

    const updateSummaryCards = () => {
        const total = allOrders.length;
        const completed = allOrders.filter(order => order.status === 'completed').length;
        const pending = total - completed;

        // Animate number changes
        const animateNumber = (elementId, newValue) => {
            const element = document.getElementById(elementId);
            const currentValue = parseInt(element.textContent) || 0;
            const increment = (newValue - currentValue) / 20;
            let current = currentValue;
            
            const timer = setInterval(() => {
                current += increment;
                if ((increment > 0 && current >= newValue) || (increment < 0 && current <= newValue)) {
                    current = newValue;
                    clearInterval(timer);
                }
                element.textContent = Math.round(current);
            }, 50);
        };

        animateNumber('total-orders', total);
        animateNumber('pending-orders', pending);
        animateNumber('completed-orders', completed);
    };

    const displayOrders = (ordersToDisplay) => {
        if (!ordersContainer) return;

        if (ordersToDisplay.length === 0 && allOrders.length > 0) {
            ordersContainer.innerHTML = '<p>No orders match your search.</p>';
            return;
        }
        if (allOrders.length === 0) {
            ordersContainer.innerHTML = '<p>No orders found.</p>';
            return;
        }

        ordersContainer.innerHTML = '';
        ordersToDisplay.forEach((order, index) => {
            console.log('Processing order:', order);
            const status = order.status || 'pending';
            const card = document.createElement('div');
            card.className = `order-card ${status}`;
            card.dataset.index = index;
            
            // Add staggered animation
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
                card.style.transition = 'all 0.3s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);

            const fileLinks = order.files.map(file => {
                console.log('Processing file:', file);
                
                // Determine file type and icon
                let fileIcon = 'fa-file';
                let fileType = 'File';
                
                if (file.toLowerCase().includes('.jpg') || file.toLowerCase().includes('.jpeg') || file.toLowerCase().includes('.png') || file.toLowerCase().includes('.gif')) {
                    fileIcon = 'fa-image';
                    fileType = 'Image';
                } else if (file.toLowerCase().includes('.pdf')) {
                    fileIcon = 'fa-file-pdf';
                    fileType = 'PDF';
                } else if (file.toLowerCase().includes('.doc') || file.toLowerCase().includes('.docx')) {
                    fileIcon = 'fa-file-word';
                    fileType = 'Document';
                } else if (file.toLowerCase().includes('.xls') || file.toLowerCase().includes('.xlsx')) {
                    fileIcon = 'fa-file-excel';
                    fileType = 'Spreadsheet';
                }
                
                // Get file size (we can't get actual size from filename, but we can show the type)
                const fileName = file.split('-').slice(1).join('-'); // Remove timestamp prefix
                
                return `<li>
                    <a href="/uploads/${file}" target="_blank" download>
                        <i class="fa-solid ${fileIcon}"></i> 
                        <div class="file-info">
                            <span class="file-name">${fileName}</span>
                            <span class="file-type">${fileType}</span>
                        </div>
                        <i class="fa-solid fa-download download-icon"></i>
                    </a>
                </li>`;
            }).join('');

            card.innerHTML = `
                <div class="order-header">
                    <div class="order-header-main">
                        <div class="status-dot ${status}"></div>
                        <div>
                            <h3>${order.name}</h3>
                            <span class="order-timestamp">${order.timestamp}</span>
                        </div>
                    </div>
                    <i class="fa-solid fa-chevron-down expand-icon"></i>
                </div>
                <div class="order-details">
                    <p><strong>Phone:</strong> ${order.phone}</p>
                    <p><strong>Files (${order.files.length}):</strong></p>
                    ${order.files.length > 0 ? `<ul>${fileLinks}</ul>` : '<p style="color: var(--text-secondary); font-style: italic;">No files uploaded</p>'}
                    <div class="order-actions">
                        <button class="status-btn complete" ${status === 'completed' ? 'disabled' : ''}>✅ Mark Completed</button>
                        <button class="delete-btn">❌ Delete</button>
                    </div>
                </div>
            `;
            ordersContainer.appendChild(card);
        });
    };

    // --- DATA FETCHING ---
    const fetchOrders = async () => {
        showSkeletonLoader();
        try {
            const response = await fetch('/orders', {
                method: 'GET',
                credentials: 'include', // Important for session cookies!
                headers: { 'Content-Type': 'application/json' }
            });
            if (response.status === 401) {
                window.location.href = '/login';
                return;
            }
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                window.location.href = '/login';
                return;
            }
            const orders = await response.json();
            allOrders = orders;
            console.log('Fetched orders:', allOrders);
            displayOrders(allOrders);
            updateSummaryCards();
        } catch (error) {
            console.error('Error fetching orders:', error);
            ordersContainer.innerHTML = `<p class="error">Failed to load orders. Please <a href="/login">login again</a>.</p>`;
        }
    };

    // --- Auto-refresh every 30 seconds ---
    setInterval(fetchOrders, 30000);

    // --- EVENT LISTENERS ---
    ordersContainer.addEventListener('click', async e => {
        const card = e.target.closest('.order-card');
        if (!card) return;
        const index = card.dataset.index;

        // Expand/collapse
        if (e.target.closest('.order-header')) {
            card.classList.toggle('expanded');
        }

        // Mark Completed
        if (e.target.classList.contains('complete')) {
            e.target.textContent = 'Updating...';
            e.target.disabled = true;
            const res = await fetch(`/complete/${index}`, { 
                method: "POST",
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            });
            if (res.status === 401) {
                window.location.href = '/login';
                return;
            }
            const contentType = res.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                window.location.href = '/login';
                return;
            }
            const data = await res.json();
            if (data.success) {
                fetchOrders();
            } else {
                alert('Mark as complete failed: ' + (data.message || 'Unknown error'));
                e.target.textContent = '✅ Mark Completed';
                e.target.disabled = false;
            }
        }

        // Delete Order
        if (e.target.classList.contains('delete-btn')) {
            if (!confirm("Delete this order and files?")) return;
            e.target.textContent = 'Deleting...';
            e.target.disabled = true;
            const res = await fetch(`/delete/${index}`, { 
                method: "POST",
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            });
            if (res.status === 401) {
                window.location.href = '/login';
                return;
            }
            const contentType = res.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                window.location.href = '/login';
                return;
            }
            const data = await res.json();
            if (data.success) {
                fetchOrders();
            } else {
                alert('Delete failed: ' + (data.message || 'Unknown error'));
                e.target.textContent = '❌ Delete';
                e.target.disabled = false;
            }
        }
    });

    // Search
    const getFilteredOrders = () => {
        const query = searchBar.value.trim().toLowerCase();
        if (!query) return allOrders;
        return allOrders.filter(order =>
            (order.name && order.name.toLowerCase().includes(query)) ||
            (order.phone && order.phone.includes(query))
        );
    };
    searchBar.addEventListener('input', () => {
        displayOrders(getFilteredOrders());
    });

    // Init
    fetchOrders();
});
