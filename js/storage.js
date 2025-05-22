/**
 * Storage management for KAU Admission Portal
 * Handles localStorage operations for application data
 */

/**
 * Save an application to localStorage
 * @param {Object} application - The application data to save
 */
function saveApplication(application) {
    // Generate application ID if not exists
    if (!application.applicationId) {
        application.applicationId = generateApplicationId();
    }
    
    // Add timestamp if not exists
    if (!application.timestamp) {
        application.timestamp = new Date().toISOString();
    }
    
    // Set initial status if not exists
    if (!application.status) {
        application.status = 'pending';
    }
    
    // Get current applications array from localStorage
    let applications = getApplications();
    
    // Check if application with same ID already exists (for updates)
    const existingIndex = applications.findIndex(app => app.applicationId === application.applicationId);
    
    if (existingIndex >= 0) {
        // Update existing application
        applications[existingIndex] = application;
    } else {
        // Add new application
        applications.push(application);
    }
    
    // Save to localStorage
    localStorage.setItem('applications', JSON.stringify(applications));
    
    return application.applicationId;
}

/**
 * Get all applications from localStorage
 * @returns {Array} - Array of all applications
 */
function getApplications() {
    const applications = localStorage.getItem('applications');
    return applications ? JSON.parse(applications) : [];
}

/**
 * Get a specific application by ID
 * @param {string} applicationId - The application ID to retrieve
 * @returns {Object|null} - The application object or null if not found
 */
function getApplicationById(applicationId) {
    const applications = getApplications();
    return applications.find(app => app.applicationId === applicationId) || null;
}

/**
 * Delete an application by ID
 * @param {string} applicationId - The application ID to delete
 * @returns {boolean} - Whether the deletion was successful
 */
function deleteApplication(applicationId) {
    let applications = getApplications();
    const initialLength = applications.length;
    
    // Filter out the application with the matching ID
    applications = applications.filter(app => app.applicationId !== applicationId);
    
    // If length changed, it means we found and removed an application
    if (applications.length !== initialLength) {
        localStorage.setItem('applications', JSON.stringify(applications));
        return true;
    }
    
    return false;
}

/**
 * Update application status
 * @param {string} applicationId - The application ID to update
 * @param {string} status - The new status (pending, approved, rejected)
 * @returns {boolean} - Whether the update was successful
 */
function updateApplicationStatus(applicationId, status) {
    const applications = getApplications();
    const application = applications.find(app => app.applicationId === applicationId);
    
    if (application) {
        application.status = status;
        application.statusUpdateTime = new Date().toISOString();
        localStorage.setItem('applications', JSON.stringify(applications));
        return true;
    }
    
    return false;
}

/**
 * Generate a unique application ID
 * @returns {string} - A unique application ID
 */
function generateApplicationId() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    return `KAU-${year}${month}${day}-${random}`;
}

/**
 * Save admin credentials (for demo purposes only)
 * In a real application, this would use proper authentication
 * @param {string} username - Admin username
 * @param {string} password - Admin password
 */
function saveAdminCredentials(username, password) {
    // In a real application, passwords should never be stored in plain text
    // This is only for demonstration purposes
    const hashedPassword = simpleHash(password);
    
    localStorage.setItem('adminUsername', username);
    localStorage.setItem('adminPassword', hashedPassword);
}

/**
 * Verify admin login
 * @param {string} username - Admin username
 * @param {string} password - Admin password
 * @returns {boolean} - Whether login is successful
 */
function verifyAdminLogin(username, password) {
    const storedUsername = localStorage.getItem('adminUsername');
    const storedPassword = localStorage.getItem('adminPassword');
    
    // If no admin account exists yet, create default admin
    if (!storedUsername || !storedPassword) {
        saveAdminCredentials('admin', 'admin123');
        return username === 'admin' && password === 'admin123';
    }
    
    return username === storedUsername && simpleHash(password) === storedPassword;
}

/**
 * Set admin logged in status
 * @param {boolean} status - Whether admin is logged in
 */
function setAdminLoggedIn(status) {
    if (status) {
        localStorage.setItem('adminLoggedIn', 'true');
        localStorage.setItem('adminLoginTime', new Date().toISOString());
    } else {
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminLoginTime');
    }
}

/**
 * Check if admin is logged in
 * @returns {boolean} - Whether admin is logged in
 */
function isAdminLoggedIn() {
    return localStorage.getItem('adminLoggedIn') === 'true';
}

/**
 * Simple hash function for demo purposes only
 * @param {string} str - String to hash
 * @returns {string} - Hashed string
 */
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16);
}

/**
 * Export applications data as JSON
 * @returns {string} - JSON string of applications data
 */
function exportApplicationsAsJson() {
    const applications = getApplications();
    return JSON.stringify(applications, null, 2);
}

/**
 * Export applications data as CSV
 * @returns {string} - CSV string of applications data
 */
function exportApplicationsAsCsv() {
    const applications = getApplications();
    
    if (applications.length === 0) {
        return '';
    }
    
    // Get headers from first application
    const headers = Object.keys(applications[0]);
    
    // Create CSV header row
    let csv = headers.join(',') + '\n';
    
    // Add application data rows
    applications.forEach(app => {
        const values = headers.map(header => {
            let value = app[header] || '';
            // Escape commas and quotes
            if (value.toString().includes(',') || value.toString().includes('"')) {
                value = `"${value.toString().replace(/"/g, '""')}"`;
            }
            return value;
        });
        csv += values.join(',') + '\n';
    });
    
    return csv;
}

/**
 * Import applications data from JSON
 * @param {string} jsonData - JSON string of applications data
 * @returns {number} - Number of applications imported
 */
function importApplicationsFromJson(jsonData) {
    try {
        const importedApplications = JSON.parse(jsonData);
        
        if (!Array.isArray(importedApplications)) {
            throw new Error('Invalid data format. Expected an array of applications.');
        }
        
        // Validate each application
        importedApplications.forEach(app => {
            if (!app.applicationId || !app.timestamp) {
                throw new Error('Invalid application data. Missing required fields.');
            }
        });
        
        // Save the imported applications
        localStorage.setItem('applications', jsonData);
        
        return importedApplications.length;
    } catch (error) {
        console.error('Error importing applications:', error);
        throw error;
    }
}

/**
 * Clear all application data
 * WARNING: This will delete all stored applications
 */
function clearAllApplications() {
    localStorage.removeItem('applications');
}
