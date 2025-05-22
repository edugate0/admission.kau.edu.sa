/**
 * المصادقة وإدارة المستخدمين لبوابة القبول بجامعة الملك عبدالعزيز
 */

document.addEventListener('DOMContentLoaded', function() {
    // تهيئة نماذج تسجيل الدخول وإنشاء الحساب إذا كانت موجودة
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegistration);
    }
    
    // إضافة رابط نسيت كلمة المرور
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', handleForgotPassword);
    }
    
    // التحقق من حالة تسجيل الدخول عند تحميل الصفحة
    checkAuthStatus();
    
    // تحديث عناصر واجهة المستخدم بناءً على حالة تسجيل الدخول
    updateUIBasedOnAuthStatus();
});

/**
 * التعامل مع تسجيل الدخول
 * @param {Event} event - حدث النموذج
 */
function handleLogin(event) {
    event.preventDefault();
    
    // التحقق من صحة النموذج
    if (!validateForm(event.target)) {
        showValidationErrors(event.target);
        return;
    }
    
    const nationalId = document.getElementById('loginNationalId').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe')?.checked || false;
    
    // محاولة تسجيل الدخول
    if (authenticateUser(nationalId, password)) {
        // حفظ بيانات المستخدم في التخزين المحلي
        loginUser(nationalId, rememberMe);
        
        // عرض رسالة نجاح
        showNotification('تم تسجيل الدخول بنجاح', 'success');
        
        // إعادة توجيه المستخدم
        setTimeout(() => {
            redirectAfterLogin();
        }, 1500);
    } else {
        // عرض رسالة خطأ
        const alertContainer = event.target.querySelector('.alert-container');
        alertContainer.innerHTML = `
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                رقم الهوية أو كلمة المرور غير صحيحة.
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
    }
}

/**
 * التعامل مع إنشاء حساب جديد
 * @param {Event} event - حدث النموذج
 */
function handleRegistration(event) {
    event.preventDefault();
    
    // التحقق من صحة النموذج
    if (!validateForm(event.target)) {
        showValidationErrors(event.target);
        return;
    }
    
    // التحقق من تطابق كلمتي المرور
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    
    if (password !== confirmPassword) {
        document.getElementById('registerConfirmPassword').classList.add('is-invalid');
        return;
    }
    
    const nationalId = document.getElementById('registerNationalId').value;
    const firstName = document.getElementById('registerFirstName').value;
    const lastName = document.getElementById('registerLastName').value;
    const email = document.getElementById('registerEmail').value;
    const phone = document.getElementById('registerPhone').value;
    
    // التحقق من عدم وجود الحساب مسبقاً
    if (userExists(nationalId)) {
        const alertContainer = event.target.querySelector('.alert-container');
        alertContainer.innerHTML = `
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                هذا الرقم الوطني مسجل مسبقاً. يرجى تسجيل الدخول أو استخدام رقم آخر.
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
        return;
    }
    
    // إنشاء حساب جديد
    const userData = {
        nationalId,
        firstName,
        lastName,
        email,
        phone,
        password: hashPassword(password), // تشفير كلمة المرور (للعرض فقط - لا يستخدم للإنتاج)
        createdAt: new Date().toISOString(),
        status: 'active'
    };
    
    // حفظ بيانات المستخدم
    saveUser(userData);
    
    // عرض رسالة نجاح
    const alertContainer = event.target.querySelector('.alert-container');
    alertContainer.innerHTML = `
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            تم إنشاء الحساب بنجاح. يمكنك الآن تسجيل الدخول.
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
    
    // مسح النموذج
    event.target.reset();
    
    // إعادة توجيه إلى نموذج تسجيل الدخول بعد فترة
    setTimeout(() => {
        document.getElementById('loginNationalId').value = nationalId;
        document.getElementById('loginNationalId').focus();
    }, 2000);
}

/**
 * التعامل مع نسيان كلمة المرور
 * @param {Event} event - حدث النقر
 */
function handleForgotPassword(event) {
    event.preventDefault();
    
    // طلب رقم الهوية الوطنية
    const nationalId = prompt('الرجاء إدخال رقم الهوية الوطنية لاسترجاع كلمة المرور:');
    
    if (!nationalId) return;
    
    // التحقق من وجود المستخدم
    if (userExists(nationalId)) {
        // في تطبيق حقيقي، سيتم إرسال رمز تحقق إلى البريد الإلكتروني أو رقم الهاتف
        alert('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني المسجل.');
    } else {
        alert('لم يتم العثور على حساب بهذا الرقم الوطني.');
    }
}

/**
 * التحقق من مصادقة المستخدم
 * @param {string} nationalId - رقم الهوية الوطنية
 * @param {string} password - كلمة المرور
 * @returns {boolean} - نتيجة المصادقة
 */
function authenticateUser(nationalId, password) {
    const users = getUsers();
    const user = users.find(u => u.nationalId === nationalId);
    
    if (!user) return false;
    
    // في تطبيق حقيقي، سيتم استخدام طريقة أكثر أماناً للتحقق من كلمة المرور
    return user.password === hashPassword(password);
}

/**
 * تسجيل دخول المستخدم
 * @param {string} nationalId - رقم الهوية الوطنية
 * @param {boolean} rememberMe - تذكر تسجيل الدخول
 */
function loginUser(nationalId, rememberMe) {
    const users = getUsers();
    const user = users.find(u => u.nationalId === nationalId);
    
    if (!user) return;
    
    // حفظ معلومات المستخدم في الجلسة
    const authData = {
        nationalId: user.nationalId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isLoggedIn: true,
        loginTime: new Date().toISOString()
    };
    
    // تخزين بيانات المصادقة
    localStorage.setItem('authData', JSON.stringify(authData));
    
    // إذا تم اختيار "تذكرني"، قم بتخزين المعرف لفترة أطول
    if (rememberMe) {
        localStorage.setItem('rememberUser', nationalId);
    } else {
        localStorage.removeItem('rememberUser');
    }
}

/**
 * تسجيل خروج المستخدم
 */
function logoutUser() {
    localStorage.removeItem('authData');
    showNotification('تم تسجيل الخروج بنجاح', 'info');
    
    // إعادة توجيه المستخدم إلى الصفحة الرئيسية
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

/**
 * التحقق من حالة تسجيل الدخول
 * @returns {boolean} - هل المستخدم مسجل الدخول
 */
function checkAuthStatus() {
    const authData = localStorage.getItem('authData');
    
    if (authData) {
        const userData = JSON.parse(authData);
        return userData.isLoggedIn === true;
    }
    
    // التحقق من وجود تذكر المستخدم
    const rememberedUser = localStorage.getItem('rememberUser');
    if (rememberedUser) {
        const users = getUsers();
        const user = users.find(u => u.nationalId === rememberedUser);
        
        if (user) {
            // تسجيل دخول تلقائي
            loginUser(rememberedUser, true);
            return true;
        }
    }
    
    return false;
}

/**
 * الحصول على بيانات المستخدم الحالي
 * @returns {Object|null} - بيانات المستخدم أو null إذا لم يكن مسجل الدخول
 */
function getCurrentUser() {
    const authData = localStorage.getItem('authData');
    return authData ? JSON.parse(authData) : null;
}

/**
 * تحديث واجهة المستخدم بناءً على حالة تسجيل الدخول
 */
function updateUIBasedOnAuthStatus() {
    const isLoggedIn = checkAuthStatus();
    const navbarNav = document.getElementById('navbarNav');
    
    if (!navbarNav) return;
    
    // الحصول على قائمة العناصر
    const navItems = navbarNav.querySelector('ul.navbar-nav');
    
    if (isLoggedIn) {
        const user = getCurrentUser();
        
        // إضافة عناصر للمستخدم المسجل
        if (!document.getElementById('userDropdown')) {
            // إضافة عنصر القائمة المنسدلة للمستخدم
            const userDropdownItem = document.createElement('li');
            userDropdownItem.className = 'nav-item dropdown ms-3';
            userDropdownItem.innerHTML = `
                <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="fas fa-user-circle me-1"></i> ${user.firstName}
                </a>
                <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                    <li><a class="dropdown-item" href="dashboard.html"><i class="fas fa-tachometer-alt me-2"></i>لوحة التحكم</a></li>
                    <li><a class="dropdown-item" href="profile.html"><i class="fas fa-user me-2"></i>الملف الشخصي</a></li>
                    <li><a class="dropdown-item" href="applications.html"><i class="fas fa-clipboard-list me-2"></i>طلباتي</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item" href="#" id="logoutLink"><i class="fas fa-sign-out-alt me-2"></i>تسجيل الخروج</a></li>
                </ul>
            `;
            navItems.appendChild(userDropdownItem);
            
            // إضافة استماع لحدث تسجيل الخروج
            document.getElementById('logoutLink').addEventListener('click', function(e) {
                e.preventDefault();
                logoutUser();
            });
        }
    } else {
        // إزالة عناصر المستخدم المسجل إذا كانت موجودة
        const userDropdown = document.getElementById('userDropdown')?.closest('.nav-item');
        if (userDropdown) {
            userDropdown.remove();
        }
        
        // التحقق من وجود رابط تسجيل الدخول وإضافته إذا لم يكن موجوداً
        if (!document.querySelector('.nav-link[href="login.html"]')) {
            const loginItem = document.createElement('li');
            loginItem.className = 'nav-item ms-3';
            loginItem.innerHTML = `
                <a class="nav-link btn btn-outline-primary btn-sm px-3" href="login.html">
                    <i class="fas fa-sign-in-alt me-1"></i> تسجيل الدخول
                </a>
            `;
            navItems.appendChild(loginItem);
        }
    }
    
    // التحقق من الوصول إلى الصفحات المحمية
    const currentPage = window.location.pathname.split('/').pop();
    const protectedPages = ['apply.html', 'dashboard.html', 'profile.html', 'applications.html', 'student-dashboard.html'];
    
    if (protectedPages.includes(currentPage) && !isLoggedIn) {
        // إعادة توجيه إلى صفحة تسجيل الدخول مع الإشارة إلى الصفحة المطلوبة
        window.location.href = `login.html?redirect=${currentPage}`;
    }
}

/**
 * إعادة توجيه المستخدم بعد تسجيل الدخول
 */
function redirectAfterLogin() {
    const urlParams = new URLSearchParams(window.location.search);
    const redirectPage = urlParams.get('redirect');
    
    if (redirectPage) {
        window.location.href = redirectPage;
    } else {
        // التحقق مما إذا كان المستخدم لديه طلبات سابقة
        const currentUser = getCurrentUser();
        const applications = getApplications().filter(app => app.nationalId === currentUser.nationalId);
        
        if (applications.length > 0) {
            window.location.href = 'applications.html';
        } else {
            window.location.href = 'dashboard.html';
        }
    }
}

/**
 * التحقق من وجود المستخدم
 * @param {string} nationalId - رقم الهوية الوطنية
 * @returns {boolean} - هل المستخدم موجود
 */
function userExists(nationalId) {
    const users = getUsers();
    return users.some(user => user.nationalId === nationalId);
}

/**
 * حفظ معلومات المستخدم الجديد
 * @param {Object} userData - بيانات المستخدم
 */
function saveUser(userData) {
    let users = getUsers();
    users.push(userData);
    localStorage.setItem('users', JSON.stringify(users));
}

/**
 * الحصول على جميع المستخدمين
 * @returns {Array} - قائمة المستخدمين
 */
function getUsers() {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
}

/**
 * تشفير كلمة المرور بطريقة بسيطة (للعرض فقط - لا يستخدم للإنتاج)
 * @param {string} password - كلمة المرور
 * @returns {string} - كلمة المرور المشفرة
 */
function hashPassword(password) {
    // استخدام خوارزمية بسيطة للتشفير (للعرض فقط)
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // تحويل إلى 32bit integer
    }
    return hash.toString(16);
}