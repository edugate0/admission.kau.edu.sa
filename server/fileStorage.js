// File-based Storage System for KAU Applications
const fs = require('fs');
const path = require('path');

// Base directory for all data
const DATA_DIR = path.join(__dirname, '..', 'data');

// Ensure data directories exist
function ensureDirectoriesExist() {
    const directories = [
        DATA_DIR,
        path.join(DATA_DIR, 'students'),
        path.join(DATA_DIR, 'applications'),
        path.join(DATA_DIR, 'payments')
    ];

    directories.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
}

// Initialize storage
ensureDirectoriesExist();

// Generic file operations
function saveData(directory, filename, data) {
    const filePath = path.join(DATA_DIR, directory, `${filename}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
}

function getData(directory, filename) {
    const filePath = path.join(DATA_DIR, directory, `${filename}.json`);
    if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    return null;
}

function getAllData(directory) {
    const dirPath = path.join(DATA_DIR, directory);
    if (!fs.existsSync(dirPath)) {
        return [];
    }
    
    const files = fs.readdirSync(dirPath).filter(file => file.endsWith('.json'));
    return files.map(file => {
        return JSON.parse(fs.readFileSync(path.join(dirPath, file), 'utf8'));
    });
}

function deleteData(directory, filename) {
    const filePath = path.join(DATA_DIR, directory, `${filename}.json`);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
    }
    return false;
}

// Student specific operations
const studentStorage = {
    saveStudent(student) {
        // Ensure student has ID
        if (!student.id) {
            student.id = Date.now().toString();
        }
        return saveData('students', student.id, student);
    },
    
    getStudent(studentId) {
        return getData('students', studentId);
    },
    
    getStudentByEmail(email) {
        const students = getAllData('students');
        return students.find(student => student.email === email);
    },
    
    getAllStudents() {
        return getAllData('students');
    },
    
    deleteStudent(studentId) {
        return deleteData('students', studentId);
    }
};

// Application specific operations
const applicationStorage = {
    saveApplication(application) {
        // Ensure application has ID
        if (!application.id) {
            application.id = `APP-${Date.now()}`;
        }
        return saveData('applications', application.id, application);
    },
    
    getApplication(applicationId) {
        return getData('applications', applicationId);
    },
    
    getApplicationsByStudent(studentId) {
        const applications = getAllData('applications');
        return applications.filter(app => app.studentId === studentId);
    },
    
    getAllApplications() {
        return getAllData('applications');
    },
    
    deleteApplication(applicationId) {
        return deleteData('applications', applicationId);
    },
    
    updateApplicationStatus(applicationId, status) {
        const application = this.getApplication(applicationId);
        if (application) {
            application.status = status;
            return this.saveApplication(application);
        }
        return false;
    }
};

// Payment specific operations
const paymentStorage = {
    savePayment(payment) {
        // Ensure payment has ID
        if (!payment.id) {
            payment.id = `PAY-${Date.now()}`;
        }
        
        // Add timestamp if not present
        if (!payment.timestamp) {
            payment.timestamp = new Date().toISOString();
        }
        
        return saveData('payments', payment.id, payment);
    },
    
    getPayment(paymentId) {
        return getData('payments', paymentId);
    },
    
    getPaymentsByApplication(applicationId) {
        const payments = getAllData('payments');
        return payments.filter(payment => payment.applicationId === applicationId);
    },
    
    getPaymentsByStudent(studentId) {
        const payments = getAllData('payments');
        return payments.filter(payment => payment.studentId === studentId);
    },
    
    getAllPayments() {
        return getAllData('payments');
    }
};

module.exports = {
    studentStorage,
    applicationStorage,
    paymentStorage
};