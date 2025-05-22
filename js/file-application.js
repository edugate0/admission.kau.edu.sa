/**
 * نظام تقديم الطلبات - متوافق مع التخزين الملفي
 */

// متغيرات عامة
let currentStep = 1;
let totalSteps = 4;
let formData = {};
let uploadedDocuments = [];

// عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // التحقق من حالة تسجيل الدخول للمستخدم
    checkAuthStatus().then(isAuthenticated => {
        if (!isAuthenticated) {
            // إظهار رسالة تسجيل الدخول
            document.getElementById('login-required-message').classList.remove('d-none');
            document.getElementById('applicationForm').classList.add('d-none');
        } else {
            // إخفاء رسالة تسجيل الدخول وإظهار نموذج التقديم
            document.getElementById('login-required-message').classList.add('d-none');
            document.getElementById('applicationForm').classList.remove('d-none');
            
            // تحميل بيانات المستخدم المسجل
            loadUserData();
        }
    });
    
    // تهيئة الخطوات
    setupSteps();
    
    // إضافة مستمعات الأحداث للأزرار
    document.getElementById('next-btn').addEventListener('click', nextStep);
    document.getElementById('prev-btn').addEventListener('click', prevStep);
    
    // إضافة مستمع حدث لتقديم النموذج
    document.getElementById('applicationForm').addEventListener('submit', submitApplication);
    
    // تهيئة وظائف رفع الملفات
    setupFileUploads();
    
    // تهيئة قائمة سنوات التخرج
    populateGraduationYears();
});

/**
 * التحقق من تسجيل دخول المستخدم
 * ملاحظة: في النظام الحقيقي، ستتصل هذه الدالة بالخادم للتحقق من صحة الجلسة
 */
async function checkAuthStatus() {
    // للتجربة، نستخدم sessionStorage للتحقق من تسجيل الدخول
    return !!sessionStorage.getItem('studentId');
}

/**
 * تحميل بيانات المستخدم المسجل
 */
async function loadUserData() {
    try {
        // في النظام الحقيقي، ستقوم بجلب البيانات من الخادم
        // const studentId = sessionStorage.getItem('studentId');
        // const response = await fetch(`/api/students/${studentId}`);
        // const userData = await response.json();
        
        // للتجربة، نستخدم بيانات من sessionStorage
        const userDataStr = sessionStorage.getItem('userData');
        if (userDataStr) {
            const userData = JSON.parse(userDataStr);
            
            // ملء حقول النموذج بالبيانات المتاحة
            if (userData.firstName) document.getElementById('firstName').value = userData.firstName;
            if (userData.lastName) document.getElementById('lastName').value = userData.lastName;
            if (userData.nationalId) document.getElementById('nationalId').value = userData.nationalId;
            if (userData.birthDate) document.getElementById('birthDate').value = userData.birthDate;
            if (userData.gender) document.getElementById('gender').value = userData.gender;
            if (userData.nationality) document.getElementById('nationality').value = userData.nationality;
            if (userData.email) document.getElementById('email').value = userData.email;
            if (userData.phone) document.getElementById('phone').value = userData.phone;
            if (userData.address) document.getElementById('address').value = userData.address;
        }
    } catch (error) {
        console.error('خطأ في تحميل بيانات المستخدم:', error);
        showNotification('حدث خطأ أثناء تحميل بيانات المستخدم', 'error');
    }
}

/**
 * تهيئة خطوات التقديم
 */
function setupSteps() {
    // إظهار الخطوة الأولى فقط
    showStep(currentStep);
    
    // تحديث مؤشرات الخطوات
    updateStepIndicators();
}

/**
 * عرض خطوة معينة وإخفاء البقية
 */
function showStep(stepNumber) {
    // إخفاء جميع الخطوات
    const steps = document.querySelectorAll('.form-step');
    steps.forEach(step => {
        step.style.display = 'none';
    });
    
    // إظهار الخطوة المطلوبة
    const currentStepElement = document.getElementById(`step-${stepNumber}`);
    if (currentStepElement) {
        currentStepElement.style.display = 'block';
    }
    
    // تحديث أزرار التنقل
    updateNavigationButtons();
}

/**
 * تحديث مؤشرات الخطوات
 */
function updateStepIndicators() {
    const indicators = document.querySelectorAll('.step-indicator');
    
    indicators.forEach((indicator, index) => {
        const stepNum = index + 1;
        
        if (stepNum < currentStep) {
            // خطوة مكتملة
            indicator.classList.remove('active', 'pending');
            indicator.classList.add('completed');
        } else if (stepNum === currentStep) {
            // الخطوة الحالية
            indicator.classList.remove('completed', 'pending');
            indicator.classList.add('active');
        } else {
            // خطوة مستقبلية
            indicator.classList.remove('completed', 'active');
            indicator.classList.add('pending');
        }
    });
}

/**
 * تحديث أزرار التنقل
 */
function updateNavigationButtons() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-btn');
    
    // زر السابق
    if (currentStep === 1) {
        prevBtn.style.display = 'none';
    } else {
        prevBtn.style.display = 'inline-block';
    }
    
    // زر التالي وزر التقديم
    if (currentStep === totalSteps) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'inline-block';
    } else {
        nextBtn.style.display = 'inline-block';
        submitBtn.style.display = 'none';
    }
}

/**
 * الانتقال إلى الخطوة التالية
 */
function nextStep() {
    // التحقق من صحة البيانات في الخطوة الحالية
    if (!validateCurrentStep()) {
        return;
    }
    
    // جمع البيانات من النموذج
    collectFormData();
    
    // الانتقال للخطوة التالية إذا لم نصل للخطوة الأخيرة
    if (currentStep < totalSteps) {
        currentStep++;
        showStep(currentStep);
        updateStepIndicators();
        window.scrollTo(0, 0);
    }
}

/**
 * الرجوع إلى الخطوة السابقة
 */
function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
        updateStepIndicators();
        window.scrollTo(0, 0);
    }
}

/**
 * جمع البيانات من النموذج الحالي
 */
function collectFormData() {
    // الحصول على جميع عناصر الإدخال في النموذج
    const form = document.getElementById('applicationForm');
    const formElements = form.elements;
    
    // جمع البيانات من عناصر الإدخال
    for (let i = 0; i < formElements.length; i++) {
        const element = formElements[i];
        if (element.name && element.value) {
            formData[element.name] = element.value;
        }
    }
}

/**
 * التحقق من صحة البيانات في الخطوة الحالية
 */
function validateCurrentStep() {
    const currentStepElement = document.getElementById(`step-${currentStep}`);
    
    // التحقق من جميع الحقول المطلوبة في الخطوة الحالية
    const requiredFields = currentStepElement.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value) {
            isValid = false;
            field.classList.add('is-invalid');
        } else {
            field.classList.remove('is-invalid');
        }
    });
    
    // عرض رسالة خطأ إذا كانت البيانات غير صحيحة
    if (!isValid) {
        showNotification('يرجى ملء جميع الحقول المطلوبة', 'error');
    }
    
    // تحقق إضافي حسب الخطوة
    if (isValid && currentStep === 2) {
        // التحقق من صحة رقم الهوية الوطنية
        const nationalId = document.getElementById('nationalId').value;
        if (nationalId && !validateNationalId(nationalId)) {
            isValid = false;
            document.getElementById('nationalId').classList.add('is-invalid');
            showNotification('رقم الهوية الوطنية غير صحيح', 'error');
        }
        
        // التحقق من صحة البريد الإلكتروني
        const email = document.getElementById('email').value;
        if (email && !validateEmail(email)) {
            isValid = false;
            document.getElementById('email').classList.add('is-invalid');
            showNotification('البريد الإلكتروني غير صحيح', 'error');
        }
        
        // التحقق من صحة رقم الجوال
        const phone = document.getElementById('phone').value;
        if (phone && !validatePhone(phone)) {
            isValid = false;
            document.getElementById('phone').classList.add('is-invalid');
            showNotification('رقم الجوال غير صحيح', 'error');
        }
    }
    
    return isValid;
}

/**
 * التحقق من صحة رقم الهوية الوطنية (مثال بسيط)
 */
function validateNationalId(nationalId) {
    // التحقق من أن رقم الهوية مكون من 10 أرقام
    return /^\d{10}$/.test(nationalId);
}

/**
 * التحقق من صحة البريد الإلكتروني
 */
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * التحقق من صحة رقم الجوال (مثال بسيط)
 */
function validatePhone(phone) {
    // التحقق من أن رقم الجوال يبدأ بـ 05 ويتكون من 10 أرقام
    return /^05\d{8}$/.test(phone);
}

/**
 * تقديم طلب القبول
 */
async function submitApplication(e) {
    e.preventDefault();
    
    // التحقق من صحة البيانات في الخطوة الأخيرة
    if (!validateCurrentStep()) {
        return;
    }
    
    // جمع كافة البيانات من النموذج
    collectFormData();
    
    // إضافة المستندات المرفوعة
    formData.documents = uploadedDocuments;
    
    // إضافة بيانات الطالب
    formData.studentId = sessionStorage.getItem('studentId');
    formData.submissionDate = new Date().toISOString();
    formData.status = 'pending'; // حالة الطلب الأولية: قيد المراجعة
    
    // إظهار حالة التحميل
    const submitBtn = document.getElementById('submit-btn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> جارٍ التقديم...';
    
    try {
        // في النظام الحقيقي، سترسل البيانات إلى الخادم
        // const response = await fetch('/api/applications/submit', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify(formData)
        // });
        // const result = await response.json();
        
        // للتجربة، سنمثل نجاح الإرسال
        // حفظ بيانات الطلب في sessionStorage
        formData.id = `APP-${Date.now()}`;
        sessionStorage.setItem('applicationData', JSON.stringify(formData));
        
        // تأخير اصطناعي لمحاكاة الاتصال بالخادم
        setTimeout(() => {
            // توجيه المستخدم إلى صفحة التأكيد
            window.location.href = 'confirmation.html?id=' + formData.id;
        }, 1500);
        
    } catch (error) {
        console.error('خطأ في تقديم الطلب:', error);
        showNotification('حدث خطأ أثناء تقديم الطلب. يرجى المحاولة مرة أخرى.', 'error');
        
        // إعادة تفعيل زر التقديم
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'تقديم الطلب';
    }
}

/**
 * ملء قائمة سنوات التخرج
 */
function populateGraduationYears() {
    const graduationYearSelect = document.getElementById('graduationYear');
    if (!graduationYearSelect) return;
    
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 50; // بداية من 50 سنة سابقة
    
    for (let year = currentYear; year >= startYear; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        graduationYearSelect.appendChild(option);
    }
}

/**
 * تهيئة وظائف رفع الملفات
 */
function setupFileUploads() {
    const uploadBtns = document.querySelectorAll('.file-upload-btn');
    
    uploadBtns.forEach(btn => {
        const inputId = btn.getAttribute('data-input');
        const fileInput = document.getElementById(inputId);
        
        if (fileInput) {
            // إضافة مستمع حدث للزر
            btn.addEventListener('click', () => {
                fileInput.click();
            });
            
            // إضافة مستمع حدث لتغيير الملف
            fileInput.addEventListener('change', (e) => {
                handleFileUpload(e.target);
            });
        }
    });
}

/**
 * معالجة رفع الملف
 */
function handleFileUpload(fileInput) {
    const file = fileInput.files[0];
    if (!file) return;
    
    const documentType = fileInput.getAttribute('data-document-type');
    const previewContainerId = fileInput.getAttribute('data-preview');
    const previewContainer = document.getElementById(previewContainerId);
    
    // التحقق من نوع الملف وحجمه
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    const maxSize = 5 * 1024 * 1024; // 5 ميجابايت
    
    if (!allowedTypes.includes(file.type)) {
        showNotification('نوع الملف غير مدعوم. يرجى رفع ملف PDF أو JPEG أو PNG.', 'error');
        fileInput.value = '';
        return;
    }
    
    if (file.size > maxSize) {
        showNotification('حجم الملف كبير جدًا. الحد الأقصى هو 5 ميجابايت.', 'error');
        fileInput.value = '';
        return;
    }
    
    // إنشاء عنصر معاينة الملف
    if (previewContainer) {
        // إفراغ الحاوية
        previewContainer.innerHTML = '';
        
        // إضافة اسم الملف وحجمه
        const fileInfo = document.createElement('div');
        fileInfo.className = 'file-info';
        fileInfo.innerHTML = `
            <i class="fas fa-file-alt me-2"></i>
            <span>${file.name}</span>
            <small class="text-muted ms-2">(${formatFileSize(file.size)})</small>
            <button type="button" class="btn btn-sm btn-danger ms-2 remove-file" data-input="${fileInput.id}">
                <i class="fas fa-times"></i>
            </button>
        `;
        previewContainer.appendChild(fileInfo);
        
        // إضافة مستمع حدث لزر الحذف
        previewContainer.querySelector('.remove-file').addEventListener('click', () => {
            fileInput.value = '';
            previewContainer.innerHTML = '';
            
            // حذف الملف من مصفوفة الملفات المرفوعة
            uploadedDocuments = uploadedDocuments.filter(doc => doc.type !== documentType);
        });
    }
    
    // إضافة الملف إلى مصفوفة الملفات المرفوعة
    const reader = new FileReader();
    reader.onload = function(e) {
        // تحويل الملف إلى Base64 لتخزينه
        const base64Data = e.target.result;
        
        // إضافة الملف إلى المصفوفة أو تحديث الملف الموجود
        const existingDocIndex = uploadedDocuments.findIndex(doc => doc.type === documentType);
        
        if (existingDocIndex !== -1) {
            // تحديث الملف الموجود
            uploadedDocuments[existingDocIndex] = {
                type: documentType,
                name: file.name,
                size: file.size,
                data: base64Data,
                mimeType: file.type,
                uploadDate: new Date().toISOString()
            };
        } else {
            // إضافة ملف جديد
            uploadedDocuments.push({
                type: documentType,
                name: file.name,
                size: file.size,
                data: base64Data,
                mimeType: file.type,
                uploadDate: new Date().toISOString()
            });
        }
    };
    
    reader.readAsDataURL(file);
}

/**
 * تنسيق حجم الملف
 */
function formatFileSize(bytes) {
    if (bytes < 1024) {
        return bytes + ' بايت';
    } else if (bytes < 1024 * 1024) {
        return (bytes / 1024).toFixed(2) + ' كيلوبايت';
    } else {
        return (bytes / (1024 * 1024)).toFixed(2) + ' ميجابايت';
    }
}

/**
 * عرض إشعار للمستخدم
 */
function showNotification(message, type = 'info') {
    const alertContainer = document.querySelector('.alert-container');
    if (!alertContainer) return;
    
    // تحديد فئة التنبيه
    let alertClass = 'alert-info';
    if (type === 'success') alertClass = 'alert-success';
    if (type === 'error') alertClass = 'alert-danger';
    if (type === 'warning') alertClass = 'alert-warning';
    
    // إنشاء عنصر التنبيه
    const alert = document.createElement('div');
    alert.className = `alert ${alertClass} alert-dismissible fade show`;
    alert.role = 'alert';
    
    // تحديد أيقونة حسب النوع
    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    if (type === 'error') icon = 'fa-exclamation-circle';
    if (type === 'warning') icon = 'fa-exclamation-triangle';
    
    alert.innerHTML = `
        <i class="fas ${icon} me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="إغلاق"></button>
    `;
    
    // إضافة التنبيه إلى الحاوية
    alertContainer.appendChild(alert);
    
    // إزالة التنبيه تلقائيًا بعد 5 ثوانٍ
    setTimeout(() => {
        alert.classList.remove('show');
        setTimeout(() => {
            alertContainer.removeChild(alert);
        }, 150);
    }, 5000);
}