/**
 * نظام التسجيل وتسجيل الدخول - متوافق مع التخزين الملفي
 */

// عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة أحداث النقر على روابط التبديل بين تسجيل الدخول والتسجيل الجديد
    setupTabSwitching();
    
    // تهيئة نماذج تسجيل الدخول والتسجيل
    initLoginForm();
    initRegisterForm();
    
    // فحص توجيه URL
    checkRedirection();
});

/**
 * تهيئة روابط التبديل بين تسجيل الدخول والتسجيل الجديد
 */
function setupTabSwitching() {
    // النقر على رابط تسجيل الدخول
    const loginTabBtn = document.getElementById('login-tab-btn');
    if (loginTabBtn) {
        loginTabBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showTab('login-tab', 'register-tab');
        });
    }
    
    // النقر على رابط التسجيل الجديد
    const registerTabBtn = document.getElementById('register-tab-btn');
    if (registerTabBtn) {
        registerTabBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showTab('register-tab', 'login-tab');
        });
    }
}

/**
 * إظهار تبويب معين وإخفاء آخر
 */
function showTab(tabToShow, tabToHide) {
    document.getElementById(tabToShow).classList.add('active', 'show');
    document.getElementById(tabToHide).classList.remove('active', 'show');
    
    document.querySelector(`[href="#${tabToShow}"]`).classList.add('active');
    document.querySelector(`[href="#${tabToHide}"]`).classList.remove('active');
}

/**
 * تهيئة نموذج تسجيل الدخول
 */
function initLoginForm() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
}

/**
 * تهيئة نموذج التسجيل الجديد
 */
function initRegisterForm() {
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegistration);
    }
}

/**
 * معالجة تسجيل الدخول
 */
async function handleLogin(e) {
    e.preventDefault();
    
    // الحصول على بيانات النموذج
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    // التحقق من ملء الحقول المطلوبة
    if (!email || !password) {
        showNotification('يرجى ملء جميع الحقول المطلوبة', 'error');
        return;
    }
    
    // إظهار حالة التحميل
    const submitBtn = document.querySelector('#login-form button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> جارٍ تسجيل الدخول...';
    
    try {
        // في النظام الحقيقي، سيتم إرسال طلب إلى الخادم
        // const response = await fetch('/api/students/login', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify({ email, password })
        // });
        // const result = await response.json();
        
        // للتجربة، نتحقق من بيانات اعتماد ثابتة أو نتفقد sessionStorage
        let isAuthenticated = false;
        let userData = null;
        
        // التحقق من بيانات اعتماد ثابتة للتجربة
        if (email === 'student@example.com' && password === 'password123') {
            isAuthenticated = true;
            userData = {
                id: 'STD-001',
                firstName: 'أحمد',
                lastName: 'محمد',
                email: 'student@example.com',
                nationalId: '1234567890',
                phone: '0512345678'
            };
        } else {
            // يمكن إضافة المزيد من التحقق أو الاتصال بالخادم هنا
            isAuthenticated = false;
        }
        
        if (isAuthenticated) {
            // تخزين بيانات المستخدم والجلسة
            sessionStorage.setItem('studentId', userData.id);
            sessionStorage.setItem('userData', JSON.stringify(userData));
            
            // عرض إشعار نجاح
            showNotification('تم تسجيل الدخول بنجاح!', 'success');
            
            // التوجيه إلى الصفحة المناسبة
            redirectAfterAuth();
        } else {
            throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
        }
    } catch (error) {
        console.error('خطأ في تسجيل الدخول:', error);
        showNotification(error.message || 'حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.', 'error');
    } finally {
        // إعادة تفعيل زر التقديم
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'تسجيل الدخول';
    }
}

/**
 * معالجة التسجيل الجديد
 */
async function handleRegistration(e) {
    e.preventDefault();
    
    // الحصول على بيانات النموذج
    const firstName = document.getElementById('register-first-name').value;
    const lastName = document.getElementById('register-last-name').value;
    const nationalId = document.getElementById('register-national-id').value;
    const email = document.getElementById('register-email').value;
    const phone = document.getElementById('register-phone').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    
    // التحقق من ملء الحقول المطلوبة
    if (!firstName || !lastName || !nationalId || !email || !phone || !password || !confirmPassword) {
        showNotification('يرجى ملء جميع الحقول المطلوبة', 'error');
        return;
    }
    
    // التحقق من تطابق كلمات المرور
    if (password !== confirmPassword) {
        showNotification('كلمات المرور غير متطابقة', 'error');
        return;
    }
    
    // التحقق من صحة رقم الهوية الوطنية
    if (!validateNationalId(nationalId)) {
        showNotification('رقم الهوية الوطنية غير صحيح. يجب أن يتكون من 10 أرقام', 'error');
        return;
    }
    
    // التحقق من صحة البريد الإلكتروني
    if (!validateEmail(email)) {
        showNotification('البريد الإلكتروني غير صحيح', 'error');
        return;
    }
    
    // التحقق من صحة رقم الجوال
    if (!validatePhone(phone)) {
        showNotification('رقم الجوال غير صحيح. يجب أن يبدأ بـ 05 ويتكون من 10 أرقام', 'error');
        return;
    }
    
    // إظهار حالة التحميل
    const submitBtn = document.querySelector('#register-form button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> جارٍ التسجيل...';
    
    try {
        // في النظام الحقيقي، سيتم إرسال طلب إلى الخادم
        // const response = await fetch('/api/students/register', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify({
        //         firstName,
        //         lastName,
        //         nationalId,
        //         email,
        //         phone,
        //         password
        //     })
        // });
        // const result = await response.json();
        
        // للتجربة، ننشئ معرف طالب جديد ونخزن البيانات في sessionStorage
        const studentId = `STD-${Date.now()}`;
        const userData = {
            id: studentId,
            firstName,
            lastName,
            nationalId,
            email,
            phone,
            password // ملاحظة: في النظام الحقيقي، يجب تشفير كلمة المرور ولا يجب تخزينها كما هي
        };
        
        // تخزين بيانات المستخدم والجلسة
        sessionStorage.setItem('studentId', studentId);
        sessionStorage.setItem('userData', JSON.stringify(userData));
        
        // عرض إشعار نجاح
        showNotification('تم التسجيل بنجاح!', 'success');
        
        // التوجيه إلى الصفحة المناسبة بعد التأخير
        setTimeout(() => {
            redirectAfterAuth();
        }, 1500);
        
    } catch (error) {
        console.error('خطأ في التسجيل:', error);
        showNotification(error.message || 'حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى.', 'error');
    } finally {
        // إعادة تفعيل زر التقديم
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'تسجيل جديد';
    }
}

/**
 * التحقق من وجود توجيه (redirect) في URL
 */
function checkRedirection() {
    const urlParams = new URLSearchParams(window.location.search);
    const redirectParam = urlParams.get('redirect');
    
    // عرض تبويب التسجيل إذا كان هناك hash في URL
    if (window.location.hash === '#register') {
        showTab('register-tab', 'login-tab');
    }
    
    // تخزين التوجيه في sessionStorage إذا كان موجودًا
    if (redirectParam) {
        sessionStorage.setItem('authRedirect', redirectParam);
    }
}

/**
 * التوجيه بعد تسجيل الدخول أو التسجيل
 */
function redirectAfterAuth() {
    const redirectUrl = sessionStorage.getItem('authRedirect') || 'index.html';
    sessionStorage.removeItem('authRedirect'); // مسح التوجيه بعد استخدامه
    
    window.location.href = redirectUrl;
}

/**
 * التحقق من صحة رقم الهوية الوطنية
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
 * التحقق من صحة رقم الجوال
 */
function validatePhone(phone) {
    // التحقق من أن رقم الجوال يبدأ بـ 05 ويتكون من 10 أرقام
    return /^05\d{8}$/.test(phone);
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

/**
 * تسجيل الخروج
 */
function logoutUser() {
    // مسح بيانات الجلسة
    sessionStorage.removeItem('studentId');
    sessionStorage.removeItem('userData');
    sessionStorage.removeItem('applicationData');
    
    // التوجيه إلى صفحة تسجيل الدخول
    window.location.href = 'login.html';
}