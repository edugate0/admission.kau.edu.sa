/**
 * Main JavaScript file for the KAU Admission Portal
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('KAU Admission Portal initialized');
    
    // Check if user is logged in for admin section
    checkAdminAccess();
    
    // Initialize any tooltips
    initTooltips();
    
    // Add current year to footer copyright
    updateCopyright();
});

/**
 * Initialize Bootstrap tooltips
 */
function initTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

/**
 * Check if current page is admin page and verify access
 */
function checkAdminAccess() {
    // Check if we're on an admin page
    if (window.location.pathname.includes('/admin/')) {
        const isLoggedIn = localStorage.getItem('adminLoggedIn');
        // If not logged in and not on the login page, redirect to login
        if (!isLoggedIn && !window.location.pathname.endsWith('index.html')) {
            window.location.href = 'index.html';
        }
    }
}

/**
 * Update the copyright year in the footer
 */
function updateCopyright() {
    const currentYear = new Date().getFullYear();
    const copyrightElements = document.querySelectorAll('.copyright-year');
    
    copyrightElements.forEach(element => {
        element.textContent = currentYear;
    });
}

/**
 * Toggle mobile menu for responsive design
 */
function toggleMobileMenu() {
    const navbarCollapse = document.querySelector('.navbar-collapse');
    if (navbarCollapse) {
        navbarCollapse.classList.toggle('show');
    }
}

/**
 * Scroll to specific section smoothly
 * @param {string} sectionId - The ID of the section to scroll to
 */
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

/**
 * Show a toast notification
 * @param {string} message - The message to display
 * @param {string} type - The type of notification (success, error, warning, info)
 */
function showNotification(message, type = 'info') {
    // Create toast container if it doesn't exist
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }
    
    // Set toast color based on type
    let bgColor = 'bg-info';
    switch (type) {
        case 'success':
            bgColor = 'bg-success';
            break;
        case 'error':
            bgColor = 'bg-danger';
            break;
        case 'warning':
            bgColor = 'bg-warning';
            break;
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${bgColor} text-white`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    // Add toast content
    toast.innerHTML = `
        <div class="toast-header">
            <strong class="me-auto">إشعار</strong>
            <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
            ${message}
        </div>
    `;
    
    // Add to container
    toastContainer.appendChild(toast);
    
    // Initialize and show toast
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    // Remove toast after it's hidden
    toast.addEventListener('hidden.bs.toast', function() {
        toast.remove();
    });
}
