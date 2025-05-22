// KAU Application Server
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { studentStorage, applicationStorage } = require('./fileStorage');
const { processPayment, getPayment } = require('./paymentProcessor');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..')));

// Routes
// Students API
app.post('/api/students/register', (req, res) => {
    try {
        const student = req.body;
        
        // Check if email already exists
        const existingStudent = studentStorage.getStudentByEmail(student.email);
        if (existingStudent) {
            return res.status(400).json({ success: false, message: 'البريد الإلكتروني مسجل مسبقاً' });
        }
        
        // Save new student
        studentStorage.saveStudent(student);
        
        res.json({ 
            success: true, 
            message: 'تم تسجيل الطالب بنجاح',
            studentId: student.id
        });
    } catch (error) {
        console.error('Error registering student:', error);
        res.status(500).json({ success: false, message: 'حدث خطأ أثناء تسجيل الطالب' });
    }
});

app.post('/api/students/login', (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find student by email
        const student = studentStorage.getStudentByEmail(email);
        
        if (!student || student.password !== password) {
            return res.status(401).json({ 
                success: false, 
                message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' 
            });
        }
        
        // Don't send password back to client
        const { password: pwd, ...studentData } = student;
        
        res.json({ 
            success: true,
            message: 'تم تسجيل الدخول بنجاح',
            student: studentData
        });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ success: false, message: 'حدث خطأ أثناء تسجيل الدخول' });
    }
});

// Applications API
app.post('/api/applications/submit', (req, res) => {
    try {
        const application = req.body;
        
        // Generate application ID if not provided
        if (!application.id) {
            application.id = `APP-${Date.now()}`;
        }
        
        // Set initial status
        application.status = 'pending';
        application.submissionDate = new Date().toISOString();
        
        // Save application
        applicationStorage.saveApplication(application);
        
        res.json({ 
            success: true,
            message: 'تم تقديم الطلب بنجاح',
            applicationId: application.id
        });
    } catch (error) {
        console.error('Error submitting application:', error);
        res.status(500).json({ success: false, message: 'حدث خطأ أثناء تقديم الطلب' });
    }
});

app.get('/api/applications/student/:studentId', (req, res) => {
    try {
        const { studentId } = req.params;
        
        // Get all applications for this student
        const applications = applicationStorage.getApplicationsByStudent(studentId);
        
        res.json({ 
            success: true,
            applications
        });
    } catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({ success: false, message: 'حدث خطأ أثناء جلب طلبات التقديم' });
    }
});

app.get('/api/applications/:applicationId', (req, res) => {
    try {
        const { applicationId } = req.params;
        
        // Get application by ID
        const application = applicationStorage.getApplication(applicationId);
        
        if (!application) {
            return res.status(404).json({ success: false, message: 'الطلب غير موجود' });
        }
        
        res.json({ 
            success: true,
            application
        });
    } catch (error) {
        console.error('Error fetching application:', error);
        res.status(500).json({ success: false, message: 'حدث خطأ أثناء جلب تفاصيل الطلب' });
    }
});

// Payment API
app.post('/api/payments/process', async (req, res) => {
    try {
        const paymentInfo = req.body;
        
        // Process the payment
        const result = await processPayment(paymentInfo);
        
        res.json(result);
    } catch (error) {
        console.error('Error processing payment:', error);
        res.status(500).json({ 
            success: false, 
            message: 'حدث خطأ أثناء معالجة الدفع' 
        });
    }
});

app.get('/api/payments/:paymentId', (req, res) => {
    try {
        const { paymentId } = req.params;
        
        // Get payment details
        const payment = getPayment(paymentId);
        
        if (!payment) {
            return res.status(404).json({ success: false, message: 'المعاملة غير موجودة' });
        }
        
        res.json({ 
            success: true,
            payment
        });
    } catch (error) {
        console.error('Error fetching payment:', error);
        res.status(500).json({ success: false, message: 'حدث خطأ أثناء جلب تفاصيل المعاملة' });
    }
});

// Admin API endpoints
app.get('/api/admin/applications', (req, res) => {
    try {
        // Get all applications (for admin panel)
        const applications = applicationStorage.getAllApplications();
        
        res.json({ 
            success: true,
            applications
        });
    } catch (error) {
        console.error('Error fetching all applications:', error);
        res.status(500).json({ success: false, message: 'حدث خطأ أثناء جلب طلبات التقديم' });
    }
});

app.post('/api/admin/applications/:applicationId/status', (req, res) => {
    try {
        const { applicationId } = req.params;
        const { status } = req.body;
        
        // Update application status
        const success = applicationStorage.updateApplicationStatus(applicationId, status);
        
        if (!success) {
            return res.status(404).json({ success: false, message: 'الطلب غير موجود' });
        }
        
        res.json({ 
            success: true,
            message: 'تم تحديث حالة الطلب بنجاح'
        });
    } catch (error) {
        console.error('Error updating application status:', error);
        res.status(500).json({ success: false, message: 'حدث خطأ أثناء تحديث حالة الطلب' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`KAU Application Server running on port ${port}`);
});