/**
 * ملف الاتصال بواجهة برمجة التطبيقات (API)
 * يوفر هذا الملف وظائف لتسهيل الاتصال بالخادم والتعامل مع البيانات
 */

// عنوان الخادم الأساسي
const API_BASE_URL = 'http://localhost:3000/api';

/**
 * دالة للاتصال بواجهة برمجة التطبيقات
 * @param {string} endpoint - نقطة النهاية للطلب
 * @param {string} method - طريقة الطلب (GET, POST, PUT, DELETE)
 * @param {object} data - البيانات المرسلة مع الطلب (اختياري)
 * @returns {Promise} نتيجة الطلب
 */
async function apiRequest(endpoint, method = 'GET', data = null) {
    try {
        // إنشاء عنوان URL كامل
        const url = `${API_BASE_URL}${endpoint}`;
        
        // إعداد خيارات الطلب
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include' // تضمين ملفات تعريف الارتباط (cookies) في الطلب
        };
        
        // إضافة البيانات للطلب إذا كانت موجودة
        if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            options.body = JSON.stringify(data);
        }
        
        // إرسال الطلب
        const response = await fetch(url, options);
        
        // التحقق من حالة الاستجابة
        if (!response.ok) {
            // محاولة تحليل رسالة الخطأ إذا كانت متاحة
            let errorMessage;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || `خطأ في الطلب: ${response.status}`;
            } catch (e) {
                errorMessage = `خطأ في الطلب: ${response.status}`;
            }
            
            throw new Error(errorMessage);
        }
        
        // تحليل الاستجابة وإرجاعها
        return await response.json();
        
    } catch (error) {
        console.error('خطأ في الاتصال بالخادم:', error);
        throw error;
    }
}

/**
 * واجهة برمجة التطبيقات للطلاب
 */
const studentApi = {
    /**
     * تسجيل طالب جديد
     * @param {object} studentData - بيانات الطالب
     */
    async register(studentData) {
        return await apiRequest('/students/register', 'POST', studentData);
    },
    
    /**
     * تسجيل دخول الطالب
     * @param {string} email - البريد الإلكتروني
     * @param {string} password - كلمة المرور
     */
    async login(email, password) {
        return await apiRequest('/students/login', 'POST', { email, password });
    },
    
    /**
     * الحصول على الملف الشخصي للطالب
     * @param {string} studentId - معرف الطالب
     */
    async getProfile(studentId) {
        return await apiRequest(`/students/${studentId}`);
    },
    
    /**
     * تحديث الملف الشخصي للطالب
     * @param {string} studentId - معرف الطالب
     * @param {object} profileData - بيانات الملف الشخصي الجديدة
     */
    async updateProfile(studentId, profileData) {
        return await apiRequest(`/students/${studentId}`, 'PUT', profileData);
    }
};

/**
 * واجهة برمجة التطبيقات للطلبات
 */
const applicationApi = {
    /**
     * تقديم طلب جديد
     * @param {object} applicationData - بيانات الطلب
     */
    async submitApplication(applicationData) {
        return await apiRequest('/applications/submit', 'POST', applicationData);
    },
    
    /**
     * الحصول على طلبات طالب محدد
     * @param {string} studentId - معرف الطالب
     */
    async getStudentApplications(studentId) {
        return await apiRequest(`/applications/student/${studentId}`);
    },
    
    /**
     * الحصول على تفاصيل طلب محدد
     * @param {string} applicationId - معرف الطلب
     */
    async getApplication(applicationId) {
        return await apiRequest(`/applications/${applicationId}`);
    },
    
    /**
     * الاستعلام عن طلب بواسطة معرفه ورقم الهوية
     * @param {string} applicationId - معرف الطلب
     * @param {string} nationalId - رقم الهوية
     */
    async queryApplication(applicationId, nationalId) {
        return await apiRequest(`/applications/query?id=${applicationId}&nationalId=${nationalId}`);
    }
};

/**
 * واجهة برمجة التطبيقات للبرامج
 */
const programApi = {
    /**
     * الحصول على جميع البرامج
     */
    async getAllPrograms() {
        return await apiRequest('/programs');
    },
    
    /**
     * الحصول على تفاصيل برنامج محدد
     * @param {string} programId - معرف البرنامج
     */
    async getProgram(programId) {
        return await apiRequest(`/programs/${programId}`);
    },
    
    /**
     * الحصول على برامج حسب الفئة
     * @param {string} categoryId - معرف الفئة
     */
    async getProgramsByCategory(categoryId) {
        return await apiRequest(`/programs/category/${categoryId}`);
    }
};

/**
 * واجهة برمجة التطبيقات للمدفوعات
 */
const paymentApi = {
    /**
     * معالجة عملية دفع
     * @param {object} paymentData - بيانات الدفع
     */
    async processPayment(paymentData) {
        return await apiRequest('/payments/process', 'POST', paymentData);
    },
    
    /**
     * الحصول على تفاصيل عملية دفع محددة
     * @param {string} paymentId - معرف عملية الدفع
     */
    async getPayment(paymentId) {
        return await apiRequest(`/payments/${paymentId}`);
    },
    
    /**
     * الحصول على مدفوعات طالب محدد
     * @param {string} studentId - معرف الطالب
     */
    async getStudentPayments(studentId) {
        return await apiRequest(`/payments/student/${studentId}`);
    },
    
    /**
     * الحصول على مدفوعات طلب محدد
     * @param {string} applicationId - معرف الطلب
     */
    async getApplicationPayments(applicationId) {
        return await apiRequest(`/payments/application/${applicationId}`);
    }
};

/**
 * واجهة برمجة التطبيقات للمستندات
 */
const documentApi = {
    /**
     * رفع مستند
     * @param {string} studentId - معرف الطالب
     * @param {string} documentType - نوع المستند
     * @param {File} file - ملف المستند
     */
    async uploadDocument(studentId, documentType, file) {
        // إنشاء نموذج بيانات لرفع الملف
        const formData = new FormData();
        formData.append('file', file);
        formData.append('documentType', documentType);
        formData.append('studentId', studentId);
        
        // إنشاء خيارات الطلب
        const options = {
            method: 'POST',
            body: formData,
            credentials: 'include'
        };
        
        // إرسال الطلب
        const response = await fetch(`${API_BASE_URL}/documents/upload/${studentId}`, options);
        
        if (!response.ok) {
            // محاولة تحليل رسالة الخطأ إذا كانت متاحة
            let errorMessage;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || `خطأ في رفع المستند: ${response.status}`;
            } catch (e) {
                errorMessage = `خطأ في رفع المستند: ${response.status}`;
            }
            
            throw new Error(errorMessage);
        }
        
        // تحليل الاستجابة وإرجاعها
        return await response.json();
    },
    
    /**
     * الحصول على مستندات طالب محدد
     * @param {string} studentId - معرف الطالب
     */
    async getStudentDocuments(studentId) {
        return await apiRequest(`/documents/student/${studentId}`);
    },
    
    /**
     * حذف مستند
     * @param {string} studentId - معرف الطالب
     * @param {string} documentId - معرف المستند
     */
    async deleteDocument(studentId, documentId) {
        return await apiRequest(`/documents/${studentId}/${documentId}`, 'DELETE');
    }
};

/**
 * واجهة برمجة التطبيقات للمصادقة
 */
const authApi = {
    /**
     * التحقق من حالة المصادقة
     */
    async checkAuthStatus() {
        try {
            // محاولة الحصول على معلومات المستخدم الحالي
            const response = await apiRequest('/auth/status');
            return response.authenticated || false;
        } catch (error) {
            console.error('خطأ في التحقق من حالة المصادقة:', error);
            return false;
        }
    },
    
    /**
     * تسجيل الخروج
     */
    async logout() {
        try {
            await apiRequest('/auth/logout', 'POST');
            return true;
        } catch (error) {
            console.error('خطأ في تسجيل الخروج:', error);
            throw error;
        }
    }
};

// تصدير واجهات برمجة التطبيقات
window.studentApi = studentApi;
window.applicationApi = applicationApi;
window.programApi = programApi;
window.paymentApi = paymentApi;
window.documentApi = documentApi;
window.authApi = authApi;