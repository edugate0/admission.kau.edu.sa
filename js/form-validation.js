/**
 * Form validation for KAU Admission Portal
 * Handles validation for application forms and other inputs
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get all forms that need validation
    const forms = document.querySelectorAll('.needs-validation');
    
    // Loop over them and prevent submission if there are invalid fields
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!validateForm(form)) {
                event.preventDefault();
                event.stopPropagation();
                showValidationErrors(form);
            } else {
                // If it's the application form, process the submission
                if (form.id === 'applicationForm') {
                    event.preventDefault();
                    submitApplication(form);
                }
            }
        }, false);
        
        // Add input event listeners for real-time validation
        attachInputValidators(form);
    });
    
    // Initialize special validation fields
    initializeSpecialFields();
});

/**
 * Validate the entire form
 * @param {HTMLFormElement} form - The form to validate
 * @returns {boolean} - Whether the form is valid
 */
function validateForm(form) {
    let isValid = true;
    
    // Check all required fields
    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.classList.add('is-invalid');
        } else {
            field.classList.remove('is-invalid');
            field.classList.add('is-valid');
        }
    });
    
    // Validate email fields
    const emailFields = form.querySelectorAll('input[type="email"]');
    emailFields.forEach(field => {
        if (field.value && !validateEmail(field.value)) {
            isValid = false;
            field.classList.add('is-invalid');
        }
    });
    
    // Validate phone fields
    const phoneFields = form.querySelectorAll('input[type="tel"]');
    phoneFields.forEach(field => {
        if (field.value && !validatePhone(field.value)) {
            isValid = false;
            field.classList.add('is-invalid');
        }
    });
    
    // Validate ID fields
    const idFields = form.querySelectorAll('.national-id');
    idFields.forEach(field => {
        if (field.value && !validateNationalId(field.value)) {
            isValid = false;
            field.classList.add('is-invalid');
        }
    });
    
    // Check password match if applicable
    if (form.querySelector('#password') && form.querySelector('#confirmPassword')) {
        const password = form.querySelector('#password').value;
        const confirmPassword = form.querySelector('#confirmPassword').value;
        
        if (password !== confirmPassword) {
            isValid = false;
            form.querySelector('#confirmPassword').classList.add('is-invalid');
        }
    }
    
    return isValid;
}

/**
 * Show validation errors for all invalid fields
 * @param {HTMLFormElement} form - The form with validation errors
 */
function showValidationErrors(form) {
    // Add the was-validated class to enable Bootstrap validation styles
    form.classList.add('was-validated');
    
    // Focus on the first invalid field
    const firstInvalid = form.querySelector('.is-invalid');
    if (firstInvalid) {
        firstInvalid.focus();
        
        // Show alert for required fields
        const alertContainer = form.querySelector('.alert-container');
        if (alertContainer) {
            alertContainer.innerHTML = `
                <div class="alert alert-danger alert-dismissible fade show" role="alert">
                    الرجاء إكمال جميع الحقول المطلوبة وتصحيح الأخطاء قبل الإرسال.
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
            `;
        }
    }
}

/**
 * Attach input validators to form fields
 * @param {HTMLFormElement} form - The form to attach input validators to
 */
function attachInputValidators(form) {
    // Attach events to all input, select, and textarea elements
    const fields = form.querySelectorAll('input, select, textarea');
    
    fields.forEach(field => {
        // Validate on blur (when field loses focus)
        field.addEventListener('blur', () => {
            validateField(field);
        });
        
        // For select elements, also validate on change
        if (field.tagName === 'SELECT') {
            field.addEventListener('change', () => {
                validateField(field);
            });
        }
    });
}

/**
 * Validate a single form field
 * @param {HTMLElement} field - The field to validate
 * @returns {boolean} - Whether the field is valid
 */
function validateField(field) {
    let isValid = true;
    
    // Skip if disabled or part of a hidden form group
    if (field.disabled || field.closest('.form-group')?.style.display === 'none') {
        return true;
    }
    
    // Check if required and empty
    if (field.hasAttribute('required') && !field.value.trim()) {
        isValid = false;
    }
    
    // Validate based on field type
    if (field.value.trim()) {
        if (field.type === 'email' && !validateEmail(field.value)) {
            isValid = false;
        } else if (field.type === 'tel' && !validatePhone(field.value)) {
            isValid = false;
        } else if (field.classList.contains('national-id') && !validateNationalId(field.value)) {
            isValid = false;
        }
    }
    
    // Show validation state
    if (isValid) {
        field.classList.remove('is-invalid');
        if (field.value.trim()) {
            field.classList.add('is-valid');
        } else {
            field.classList.remove('is-valid');
        }
    } else {
        field.classList.add('is-invalid');
        field.classList.remove('is-valid');
    }
    
    return isValid;
}

/**
 * Validate email format
 * @param {string} email - The email to validate
 * @returns {boolean} - Whether the email is valid
 */
function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

/**
 * Validate phone number format (Saudi Arabia)
 * @param {string} phone - The phone number to validate
 * @returns {boolean} - Whether the phone number is valid
 */
function validatePhone(phone) {
    // Saudi phone format: +966xxxxxxxxx or 05xxxxxxxx
    const re = /^((\+9665)|05)[0-9]{8}$/;
    return re.test(phone);
}

/**
 * Validate Saudi National ID format
 * @param {string} id - The national ID to validate
 * @returns {boolean} - Whether the ID is valid
 */
function validateNationalId(id) {
    // Saudi National ID: 10 digits, starting with 1 or 2
    const re = /^[12][0-9]{9}$/;
    return re.test(id);
}

/**
 * Initialize special validation fields like date pickers
 */
function initializeSpecialFields() {
    // Initialize date fields
    const dateFields = document.querySelectorAll('input[type="date"]');
    dateFields.forEach(field => {
        // Set max date to today for birth date fields
        if (field.classList.contains('birth-date')) {
            const today = new Date();
            const dd = String(today.getDate()).padStart(2, '0');
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const yyyy = today.getFullYear();
            field.setAttribute('max', `${yyyy-15}-${mm}-${dd}`); // Assume minimum age is 15
        }
    });
}

/**
 * Submit application form data
 * @param {HTMLFormElement} form - The application form
 */
function submitApplication(form) {
    // Get form data
    const formData = new FormData(form);
    const applicationData = {};
    
    // Convert FormData to object
    for (const [key, value] of formData.entries()) {
        applicationData[key] = value;
    }
    
    // Add application ID and timestamp
    applicationData.applicationId = generateApplicationId();
    applicationData.timestamp = new Date().toISOString();
    applicationData.status = 'pending';
    
    // Save to localStorage
    saveApplication(applicationData);
    
    // Redirect to confirmation page
    window.location.href = `confirmation.html?id=${applicationData.applicationId}`;
}

/**
 * Generate a unique application ID
 * @returns {string} - Unique application ID
 */
function generateApplicationId() {
    // Format: KAU-YYYY-XXXXXXXX
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
    return `KAU-${year}-${random}`;
}

/**
 * Save application data to localStorage
 * @param {Object} applicationData - The application data to save
 */
function saveApplication(applicationData) {
    // Get existing applications
    let applications = JSON.parse(localStorage.getItem('applications')) || [];
    
    // Add new application
    applications.push(applicationData);
    
    // Save back to localStorage
    localStorage.setItem('applications', JSON.stringify(applications));
}
