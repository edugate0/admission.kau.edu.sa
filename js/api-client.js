// API Client - للاتصال بخادم API
const API_BASE_URL = 'http://localhost:3000/api';

// التعامل مع طلبات API
async function apiRequest(endpoint, method = 'GET', data = null) {
    try {
        const url = `${API_BASE_URL}${endpoint}`;
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            options.body = JSON.stringify(data);
        }
        
        const response = await fetch(url, options);
        return await response.json();
    } catch (error) {
        console.error('خطأ في الاتصال بالخادم:', error);
        return {
            success: false,
            message: 'حدث خطأ في الاتصال بالخادم. يرجى المحاولة مرة أخرى لاحقاً.'
        };
    }
}

// دوال API للطلاب
const studentApi = {
    // تسجيل طالب جديد
    async register(studentData) {
        return await apiRequest('/students/register', 'POST', studentData);
    },
    
    // تسجيل الدخول
    async login(credentials) {
        return await apiRequest('/students/login', 'POST', credentials);
    },
    
    // جلب بيانات الطالب
    async getProfile(studentId) {
        return await apiRequest(`/students/${studentId}`);
    }
};

// دوال API للتقديم
const applicationApi = {
    // تقديم طلب جديد
    async submitApplication(applicationData) {
        return await apiRequest('/applications/submit', 'POST', applicationData);
    },
    
    // جلب طلبات طالب معين
    async getStudentApplications(studentId) {
        return await apiRequest(`/applications/student/${studentId}`);
    },
    
    // جلب تفاصيل طلب معين
    async getApplication(applicationId) {
        return await apiRequest(`/applications/${applicationId}`);
    }
};

// دوال API للدفع
const paymentApi = {
    // معالجة الدفع
    async processPayment(paymentData) {
        return await apiRequest('/payments/process', 'POST', paymentData);
    },
    
    // جلب تفاصيل معاملة دفع
    async getPayment(paymentId) {
        return await apiRequest(`/payments/${paymentId}`);
    }
};

// دوال API للإدارة
const adminApi = {
    // جلب جميع الطلبات
    async getAllApplications() {
        return await apiRequest('/admin/applications');
    },
    
    // تحديث حالة طلب
    async updateApplicationStatus(applicationId, status) {
        return await apiRequest(`/admin/applications/${applicationId}/status`, 'POST', { status });
    }
};