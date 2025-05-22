/**
 * Admin Panel JavaScript for KAU Admission Portal
 * Handles admin login, dashboard, and application management
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check if admin is already logged in
    if (isAdminLoggedIn()) {
        showDashboard();
    } else {
        showLoginForm();
    }
    
    // Initialize event listeners
    initEventListeners();
});

/**
 * Initialize all event listeners for the admin panel
 */
function initEventListeners() {
    // Login form submission
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin();
        });
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Tab navigation
    const navLinks = document.querySelectorAll('.nav-link[data-tab]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const tabId = this.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
    
    // Export buttons
    document.getElementById('export-json-btn')?.addEventListener('click', exportAsJson);
    document.getElementById('export-csv-btn')?.addEventListener('click', exportAsCsv);
    document.getElementById('settings-export-json')?.addEventListener('click', exportAsJson);
    document.getElementById('settings-export-csv')?.addEventListener('click', exportAsCsv);
    
    // Print dashboard button
    document.getElementById('print-dashboard-btn')?.addEventListener('click', printDashboard);
    
    // Application search and filter
    document.getElementById('application-search')?.addEventListener('input', filterApplications);
    document.getElementById('status-filter')?.addEventListener('change', filterApplications);
    
    // Admin settings form
    const adminSettingsForm = document.getElementById('admin-settings-form');
    if (adminSettingsForm) {
        adminSettingsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveAdminSettings();
        });
    }
    
    // Data management
    document.getElementById('upload-data-btn')?.addEventListener('click', importData);
    document.getElementById('clear-data-btn')?.addEventListener('click', confirmClearData);
    
    // Application actions
    document.getElementById('approve-application-btn')?.addEventListener('click', approveApplication);
    document.getElementById('reject-application-btn')?.addEventListener('click', rejectApplication);
}

/**
 * Handle admin login
 */
function handleLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (verifyAdminLogin(username, password)) {
        // Set login status
        setAdminLoggedIn(true);
        
        // Show dashboard
        showDashboard();
    } else {
        // Show error
        const loginAlert = document.getElementById('login-alert');
        loginAlert.classList.remove('d-none');
        
        // Clear password field
        document.getElementById('password').value = '';
    }
}

/**
 * Handle admin logout
 */
function handleLogout() {
    // Set logout status
    setAdminLoggedIn(false);
    
    // Show login form
    showLoginForm();
}

/**
 * Show the login form
 */
function showLoginForm() {
    document.getElementById('admin-login').classList.remove('d-none');
    document.getElementById('admin-dashboard').classList.add('d-none');
    
    // Clear login form
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    document.getElementById('login-alert').classList.add('d-none');
}

/**
 * Show the admin dashboard
 */
function showDashboard() {
    document.getElementById('admin-login').classList.add('d-none');
    document.getElementById('admin-dashboard').classList.remove('d-none');
    
    // Load dashboard data
    loadDashboardData();
    
    // Set active tab
    switchTab('dashboard-tab');
}

/**
 * Switch between admin tabs
 * @param {string} tabId - The ID of the tab to show
 */
function switchTab(tabId) {
    // Hide all tabs
    const tabs = document.querySelectorAll('.admin-tab');
    tabs.forEach(tab => tab.classList.add('d-none'));
    
    // Show selected tab
    document.getElementById(tabId).classList.remove('d-none');
    
    // Update active nav link
    const navLinks = document.querySelectorAll('.nav-link[data-tab]');
    navLinks.forEach(link => {
        if (link.getAttribute('data-tab') === tabId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    // Load tab-specific data
    if (tabId === 'dashboard-tab') {
        loadDashboardData();
    } else if (tabId === 'applications-tab') {
        loadApplicationsData();
    } else if (tabId === 'settings-tab') {
        loadSettingsData();
    }
}

/**
 * Load data for the dashboard tab
 */
function loadDashboardData() {
    const applications = getApplications();
    
    // Update statistics
    document.getElementById('total-applications').textContent = applications.length;
    
    const approvedCount = applications.filter(app => app.status === 'approved').length;
    document.getElementById('approved-applications').textContent = approvedCount;
    
    const pendingCount = applications.filter(app => app.status === 'pending').length;
    document.getElementById('pending-applications').textContent = pendingCount;
    
    // Recent applications (5 most recent)
    const recentApplications = [...applications].sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
    ).slice(0, 5);
    
    const recentApplicationsTable = document.getElementById('recent-applications');
    recentApplicationsTable.innerHTML = '';
    
    if (recentApplications.length > 0) {
        recentApplications.forEach(app => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${app.applicationId}</td>
                <td>${app.firstName} ${app.lastName}</td>
                <td>${formatDate(app.timestamp)}</td>
                <td>${getStatusBadge(app.status)}</td>
            `;
            recentApplicationsTable.appendChild(row);
        });
    } else {
        recentApplicationsTable.innerHTML = `
            <tr>
                <td colspan="4" class="text-center">لا توجد طلبات حتى الآن</td>
            </tr>
        `;
    }
    
    // Program statistics
    const programStats = {};
    applications.forEach(app => {
        const program = app.program || 'غير محدد';
        if (!programStats[program]) {
            programStats[program] = 0;
        }
        programStats[program]++;
    });
    
    const programStatsTable = document.getElementById('program-stats');
    programStatsTable.innerHTML = '';
    
    if (Object.keys(programStats).length > 0) {
        const sortedPrograms = Object.entries(programStats)
            .sort(([, countA], [, countB]) => countB - countA);
            
        sortedPrograms.forEach(([program, count]) => {
            const percentage = (count / applications.length * 100).toFixed(1);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${program}</td>
                <td>${count}</td>
                <td>${percentage}%</td>
            `;
            programStatsTable.appendChild(row);
        });
    } else {
        programStatsTable.innerHTML = `
            <tr>
                <td colspan="3" class="text-center">لا توجد إحصائيات متاحة</td>
            </tr>
        `;
    }
}

/**
 * Load data for the applications tab
 */
function loadApplicationsData() {
    const applications = getApplications();
    
    // Sort applications by timestamp (newest first)
    const sortedApplications = [...applications].sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
    );
    
    // Display applications in the table
    const applicationsTable = document.getElementById('applications-table');
    const noApplicationsMessage = document.getElementById('no-applications-message');
    
    applicationsTable.innerHTML = '';
    
    if (sortedApplications.length > 0) {
        sortedApplications.forEach(app => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${app.applicationId}</td>
                <td>${app.firstName} ${app.lastName}</td>
                <td>${app.program || 'غير محدد'}</td>
                <td>${formatDate(app.timestamp)}</td>
                <td>${getStatusBadge(app.status)}</td>
                <td>
                    <button class="btn btn-sm btn-primary view-application" data-id="${app.applicationId}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-danger delete-application" data-id="${app.applicationId}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            applicationsTable.appendChild(row);
        });
        
        // Add event listeners to the buttons
        document.querySelectorAll('.view-application').forEach(btn => {
            btn.addEventListener('click', function() {
                const appId = this.getAttribute('data-id');
                viewApplicationDetails(appId);
            });
        });
        
        document.querySelectorAll('.delete-application').forEach(btn => {
            btn.addEventListener('click', function() {
                const appId = this.getAttribute('data-id');
                confirmDeleteApplication(appId);
            });
        });
        
        noApplicationsMessage.classList.add('d-none');
    } else {
        applicationsTable.innerHTML = '';
        noApplicationsMessage.classList.remove('d-none');
    }
    
    // Apply filters if any are active
    filterApplications();
}

/**
 * Load data for the settings tab
 */
function loadSettingsData() {
    // Load admin username
    const adminUsername = localStorage.getItem('adminUsername') || 'admin';
    document.getElementById('admin-username').value = adminUsername;
    
    // Clear password fields
    document.getElementById('admin-current-password').value = '';
    document.getElementById('admin-new-password').value = '';
    document.getElementById('admin-confirm-password').value = '';
}

/**
 * Filter applications based on search and status filter
 */
function filterApplications() {
    const searchTerm = document.getElementById('application-search').value.toLowerCase();
    const statusFilter = document.getElementById('status-filter').value;
    
    const rows = document.querySelectorAll('#applications-table tr');
    let visibleCount = 0;
    
    rows.forEach(row => {
        const rowText = row.textContent.toLowerCase();
        const status = row.querySelector('td:nth-child(5) .badge')?.textContent.toLowerCase();
        
        const matchesSearch = searchTerm === '' || rowText.includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || 
            (status && (
                (statusFilter === 'pending' && status.includes('قيد المراجعة')) ||
                (statusFilter === 'approved' && status.includes('مقبول')) ||
                (statusFilter === 'rejected' && status.includes('مرفوض'))
            ));
        
        if (matchesSearch && matchesStatus) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });
    
    // Show/hide no results message
    const noApplicationsMessage = document.getElementById('no-applications-message');
    if (visibleCount === 0 && rows.length > 0) {
        noApplicationsMessage.classList.remove('d-none');
    } else {
        noApplicationsMessage.classList.add('d-none');
    }
}

/**
 * View application details in a modal
 * @param {string} applicationId - The ID of the application to view
 */
function viewApplicationDetails(applicationId) {
    const application = getApplicationById(applicationId);
    
    if (!application) {
        alert('الطلب غير موجود');
        return;
    }
    
    // Populate modal content
    const contentElement = document.getElementById('application-details-content');
    
    let content = `
        <div class="application-details">
            <div class="row mb-3">
                <div class="col-md-6">
                    <p><strong>رقم الطلب:</strong> ${application.applicationId}</p>
                    <p><strong>تاريخ التقديم:</strong> ${formatDate(application.timestamp)}</p>
                    <p><strong>الحالة:</strong> ${getStatusBadge(application.status)}</p>
                </div>
                <div class="col-md-6">
                    <p><strong>البرنامج:</strong> ${application.program || 'غير محدد'}</p>
                    <p><strong>التخصص المطلوب:</strong> ${application.specialization || 'غير محدد'}</p>
                </div>
            </div>
            
            <h5 class="border-bottom pb-2 mb-3">البيانات الشخصية</h5>
            <div class="row mb-3">
                <div class="col-md-6">
                    <p><strong>الاسم الأول:</strong> ${application.firstName || ''}</p>
                    <p><strong>الاسم الأخير:</strong> ${application.lastName || ''}</p>
                    <p><strong>رقم الهوية:</strong> ${application.nationalId || ''}</p>
                    <p><strong>تاريخ الميلاد:</strong> ${application.birthDate || ''}</p>
                </div>
                <div class="col-md-6">
                    <p><strong>الجنس:</strong> ${application.gender || ''}</p>
                    <p><strong>الجنسية:</strong> ${application.nationality || ''}</p>
                    <p><strong>البريد الإلكتروني:</strong> ${application.email || ''}</p>
                    <p><strong>رقم الهاتف:</strong> ${application.phone || ''}</p>
                </div>
            </div>
            
            <h5 class="border-bottom pb-2 mb-3">المؤهلات العلمية</h5>
            <div class="row mb-3">
                <div class="col-md-6">
                    <p><strong>المؤهل العلمي:</strong> ${application.educationLevel || ''}</p>
                    <p><strong>التخصص:</strong> ${application.educationSpecialization || ''}</p>
                </div>
                <div class="col-md-6">
                    <p><strong>جهة التخرج:</strong> ${application.institution || ''}</p>
                    <p><strong>سنة التخرج:</strong> ${application.graduationYear || ''}</p>
                    <p><strong>المعدل التراكمي:</strong> ${application.gpa || ''}</p>
                </div>
            </div>
            
            <h5 class="border-bottom pb-2 mb-3">ملاحظات</h5>
            <div class="mb-3">
                <p>${application.notes || 'لا توجد ملاحظات'}</p>
            </div>
        </div>
    `;
    
    contentElement.innerHTML = content;
    
    // Update action buttons based on current status
    const approveBtn = document.getElementById('approve-application-btn');
    const rejectBtn = document.getElementById('reject-application-btn');
    
    approveBtn.setAttribute('data-id', applicationId);
    rejectBtn.setAttribute('data-id', applicationId);
    
    if (application.status === 'approved') {
        approveBtn.disabled = true;
        rejectBtn.disabled = false;
    } else if (application.status === 'rejected') {
        approveBtn.disabled = false;
        rejectBtn.disabled = true;
    } else {
        approveBtn.disabled = false;
        rejectBtn.disabled = false;
    }
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('applicationDetailsModal'));
    modal.show();
}

/**
 * Approve an application
 */
function approveApplication() {
    const applicationId = this.getAttribute('data-id');
    updateApplicationStatus(applicationId, 'approved');
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('applicationDetailsModal'));
    modal.hide();
    
    // Show success message
    alert('تم قبول الطلب بنجاح');
    
    // Reload applications data
    loadApplicationsData();
    loadDashboardData();
}

/**
 * Reject an application
 */
function rejectApplication() {
    const applicationId = this.getAttribute('data-id');
    updateApplicationStatus(applicationId, 'rejected');
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('applicationDetailsModal'));
    modal.hide();
    
    // Show success message
    alert('تم رفض الطلب بنجاح');
    
    // Reload applications data
    loadApplicationsData();
    loadDashboardData();
}

/**
 * Confirm deletion of an application
 * @param {string} applicationId - The ID of the application to delete
 */
function confirmDeleteApplication(applicationId) {
    const application = getApplicationById(applicationId);
    
    if (!application) {
        alert('الطلب غير موجود');
        return;
    }
    
    // Set up confirmation modal
    document.getElementById('confirmActionTitle').textContent = 'تأكيد حذف الطلب';
    document.getElementById('confirmActionMessage').textContent = 
        `هل أنت متأكد من أنك تريد حذف طلب ${application.firstName} ${application.lastName}؟ هذا الإجراء لا يمكن التراجع عنه.`;
    
    const confirmBtn = document.getElementById('confirmActionBtn');
    confirmBtn.textContent = 'حذف';
    confirmBtn.className = 'btn btn-danger';
    confirmBtn.onclick = function() {
        deleteApplication(applicationId);
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('confirmActionModal'));
        modal.hide();
        
        // Show success message
        alert('تم حذف الطلب بنجاح');
        
        // Reload applications data
        loadApplicationsData();
        loadDashboardData();
    };
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('confirmActionModal'));
    modal.show();
}

/**
 * Save admin settings
 */
function saveAdminSettings() {
    const username = document.getElementById('admin-username').value;
    const currentPassword = document.getElementById('admin-current-password').value;
    const newPassword = document.getElementById('admin-new-password').value;
    const confirmPassword = document.getElementById('admin-confirm-password').value;
    
    // Validate current password
    if (!verifyAdminLogin(localStorage.getItem('adminUsername'), currentPassword)) {
        alert('كلمة المرور الحالية غير صحيحة');
        return;
    }
    
    // Check if new password is provided
    if (newPassword) {
        // Validate password match
        if (newPassword !== confirmPassword) {
            alert('كلمة المرور الجديدة غير متطابقة');
            return;
        }
        
        // Update credentials
        saveAdminCredentials(username, newPassword);
    } else {
        // Update username only
        saveAdminCredentials(username, currentPassword);
    }
    
    // Show success message
    alert('تم حفظ الإعدادات بنجاح');
    
    // Clear password fields
    document.getElementById('admin-current-password').value = '';
    document.getElementById('admin-new-password').value = '';
    document.getElementById('admin-confirm-password').value = '';
}

/**
 * Export applications data as JSON
 */
function exportAsJson() {
    const jsonData = exportApplicationsAsJson();
    downloadFile(jsonData, 'kau-applications-export.json', 'application/json');
}

/**
 * Export applications data as CSV
 */
function exportAsCsv() {
    const csvData = exportApplicationsAsCsv();
    downloadFile(csvData, 'kau-applications-export.csv', 'text/csv');
}

/**
 * Download a file
 * @param {string} content - The file content
 * @param {string} fileName - The file name
 * @param {string} contentType - The content type
 */
function downloadFile(content, fileName, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    
    URL.revokeObjectURL(url);
}

/**
 * Import data from uploaded file
 */
function importData() {
    const fileInput = document.getElementById('import-data');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('الرجاء اختيار ملف للاستيراد');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const jsonData = e.target.result;
            const count = importApplicationsFromJson(jsonData);
            
            // Show success message
            alert(`تم استيراد ${count} طلب بنجاح`);
            
            // Reload data
            loadDashboardData();
            loadApplicationsData();
            
            // Clear file input
            fileInput.value = '';
        } catch (error) {
            alert(`خطأ في استيراد البيانات: ${error.message}`);
        }
    };
    
    reader.readAsText(file);
}

/**
 * Confirm clearing all data
 */
function confirmClearData() {
    // Set up confirmation modal
    document.getElementById('confirmActionTitle').textContent = 'تأكيد حذف جميع البيانات';
    document.getElementById('confirmActionMessage').textContent = 
        'هل أنت متأكد من أنك تريد حذف جميع بيانات الطلبات؟ هذا الإجراء لا يمكن التراجع عنه.';
    
    const confirmBtn = document.getElementById('confirmActionBtn');
    confirmBtn.textContent = 'حذف الكل';
    confirmBtn.className = 'btn btn-danger';
    confirmBtn.onclick = function() {
        clearAllApplications();
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('confirmActionModal'));
        modal.hide();
        
        // Show success message
        alert('تم حذف جميع البيانات بنجاح');
        
        // Reload data
        loadDashboardData();
        loadApplicationsData();
    };
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('confirmActionModal'));
    modal.show();
}

/**
 * Print dashboard
 */
function printDashboard() {
    window.print();
}

/**
 * Format a date string
 * @param {string} dateString - The date string to format
 * @returns {string} - Formatted date
 */
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('ar-SA', options);
}

/**
 * Get a status badge HTML
 * @param {string} status - The application status
 * @returns {string} - HTML for status badge
 */
function getStatusBadge(status) {
    let badgeClass = 'bg-secondary';
    let statusText = 'غير محدد';
    
    switch (status) {
        case 'pending':
            badgeClass = 'bg-warning text-dark';
            statusText = 'قيد المراجعة';
            break;
        case 'approved':
            badgeClass = 'bg-success';
            statusText = 'مقبول';
            break;
        case 'rejected':
            badgeClass = 'bg-danger';
            statusText = 'مرفوض';
            break;
    }
    
    return `<span class="badge ${badgeClass}">${statusText}</span>`;
}
