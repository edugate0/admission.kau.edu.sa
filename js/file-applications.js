/**
 * صفحة قائمة الطلبات - متوافقة مع التخزين الملفي
 */

// متغيرات عامة
let applications = [];

// عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // التحقق من حالة تسجيل الدخول
    checkAuthStatus().then(isAuthenticated => {
        if (!isAuthenticated) {
            // توجيه المستخدم إلى صفحة تسجيل الدخول
            window.location.href = 'login.html?redirect=applications.html';
            return;
        }
        
        // تحميل بيانات الطلبات
        loadApplications();
    });
    
    // إضافة مستمع حدث لزر تسجيل الخروج
    document.getElementById('logout-btn')?.addEventListener('click', logoutUser);
});

/**
 * التحقق من تسجيل دخول المستخدم
 */
async function checkAuthStatus() {
    // للتجربة، نستخدم sessionStorage للتحقق من تسجيل الدخول
    return !!sessionStorage.getItem('studentId');
}

/**
 * تحميل بيانات الطلبات من الخادم
 */
async function loadApplications() {
    try {
        // إظهار حالة التحميل
        showLoading(true);
        
        // الحصول على معرف الطالب
        const studentId = sessionStorage.getItem('studentId');
        
        if (!studentId) {
            showNotification('لم يتم العثور على بيانات الطالب', 'error');
            return;
        }
        
        // في النظام الحقيقي، سنقوم بجلب البيانات من الخادم
        // const response = await fetch(`/api/applications/student/${studentId}`);
        // const result = await response.json();
        // applications = result.applications || [];
        
        // للتجربة، سنقوم بإنشاء بيانات افتراضية
        applications = await generateSampleApplications(studentId);
        
        // تحديث واجهة المستخدم
        updateUI();
        
    } catch (error) {
        console.error('خطأ في تحميل بيانات الطلبات:', error);
        showNotification('حدث خطأ أثناء تحميل بيانات الطلبات', 'error');
    } finally {
        // إخفاء حالة التحميل
        showLoading(false);
    }
}

/**
 * إنشاء بيانات افتراضية للتجربة
 */
async function generateSampleApplications(studentId) {
    // التأخير الاصطناعي لمحاكاة تحميل البيانات
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // الحصول على بيانات الطالب
    const userDataStr = sessionStorage.getItem('userData');
    let userData = null;
    
    if (userDataStr) {
        userData = JSON.parse(userDataStr);
    }
    
    // إنشاء طلب افتراضي إذا كان هناك بيانات محفوظة
    const storedAppStr = sessionStorage.getItem('applicationData');
    if (storedAppStr) {
        return [JSON.parse(storedAppStr)];
    }
    
    // إنشاء أمثلة افتراضية
    const sampleApplications = [];
    
    // مثال 1: طلب قيد المراجعة
    sampleApplications.push({
        id: `APP-${Date.now() - 3600000}`,
        programId: 'BUS-001',
        program: 'دبلوم إدارة الأعمال',
        specialization: 'إدارة أعمال عامة',
        submissionDate: new Date(Date.now() - 3600000).toISOString(),
        status: 'pending',
        statusDate: new Date(Date.now() - 3600000).toISOString(),
        firstName: userData?.firstName || 'أحمد',
        lastName: userData?.lastName || 'محمد',
        nationalId: userData?.nationalId || '1234567890',
        studentId: studentId
    });
    
    // مثال 2: طلب مقبول
    sampleApplications.push({
        id: `APP-${Date.now() - 7200000}`,
        programId: 'IT-001',
        program: 'دبلوم علوم الحاسب',
        specialization: 'برمجة وتطوير',
        submissionDate: new Date(Date.now() - 7200000).toISOString(),
        status: 'approved',
        statusDate: new Date(Date.now() - 3500000).toISOString(),
        firstName: userData?.firstName || 'أحمد',
        lastName: userData?.lastName || 'محمد',
        nationalId: userData?.nationalId || '1234567890',
        studentId: studentId
    });
    
    return sampleApplications;
}

/**
 * تحديث واجهة المستخدم
 */
function updateUI() {
    // تحديث اسم المستخدم
    updateUserInfo();
    
    // تحديث قائمة الطلبات
    updateApplicationsList();
    
    // تحديث إحصائيات الطلبات
    updateApplicationsStats();
}

/**
 * تحديث معلومات المستخدم في الصفحة
 */
function updateUserInfo() {
    // الحصول على بيانات المستخدم
    const userDataStr = sessionStorage.getItem('userData');
    if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        
        // تحديث اسم المستخدم
        const userNameElement = document.getElementById('user-name');
        if (userNameElement && userData.firstName) {
            userNameElement.textContent = `${userData.firstName} ${userData.lastName}`;
        }
    }
}

/**
 * تحديث قائمة الطلبات
 */
function updateApplicationsList() {
    const applicationsContainer = document.getElementById('applications-container');
    const noApplicationsMessage = document.getElementById('no-applications-message');
    
    if (!applicationsContainer || !noApplicationsMessage) return;
    
    // إذا لم تكن هناك طلبات
    if (applications.length === 0) {
        applicationsContainer.classList.add('d-none');
        noApplicationsMessage.classList.remove('d-none');
        return;
    }
    
    // إظهار قائمة الطلبات وإخفاء رسالة عدم وجود طلبات
    applicationsContainer.classList.remove('d-none');
    noApplicationsMessage.classList.add('d-none');
    
    // الحصول على جدول الطلبات
    const tableBody = document.getElementById('applications-table-body');
    if (!tableBody) return;
    
    // إفراغ الجدول
    tableBody.innerHTML = '';
    
    // إضافة الطلبات إلى الجدول
    applications.forEach(application => {
        // تنسيق التاريخ
        const submissionDate = new Date(application.submissionDate);
        const formattedDate = submissionDate.toLocaleDateString('ar-SA');
        
        // تحديد فئة وحالة الطلب
        let statusClass = '';
        let statusText = '';
        let actionButton = '';
        
        switch (application.status) {
            case 'pending':
                statusClass = 'bg-warning';
                statusText = 'قيد المراجعة';
                actionButton = `
                    <button class="btn btn-sm btn-outline-primary view-details-btn" data-id="${application.id}">
                        <i class="fas fa-eye me-1"></i> عرض التفاصيل
                    </button>
                `;
                break;
            case 'approved':
                statusClass = 'bg-success';
                statusText = 'مقبول';
                actionButton = `
                    <a href="student-dashboard.html?id=${application.id}" class="btn btn-sm btn-primary">
                        <i class="fas fa-sign-in-alt me-1"></i> الدخول إلى لوحة التحكم
                    </a>
                `;
                break;
            case 'rejected':
                statusClass = 'bg-danger';
                statusText = 'مرفوض';
                actionButton = `
                    <button class="btn btn-sm btn-outline-primary view-details-btn" data-id="${application.id}">
                        <i class="fas fa-eye me-1"></i> عرض التفاصيل
                    </button>
                `;
                break;
            case 'paid':
                statusClass = 'bg-info';
                statusText = 'تم السداد';
                actionButton = `
                    <a href="student-dashboard.html?id=${application.id}" class="btn btn-sm btn-primary">
                        <i class="fas fa-sign-in-alt me-1"></i> الدخول إلى لوحة التحكم
                    </a>
                `;
                break;
            default:
                statusClass = 'bg-secondary';
                statusText = 'غير معروف';
                actionButton = `
                    <button class="btn btn-sm btn-outline-primary view-details-btn" data-id="${application.id}">
                        <i class="fas fa-eye me-1"></i> عرض التفاصيل
                    </button>
                `;
        }
        
        // إنشاء صف الجدول
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${application.id}</td>
            <td>${application.program}</td>
            <td>${formattedDate}</td>
            <td><span class="badge ${statusClass}">${statusText}</span></td>
            <td>${actionButton}</td>
        `;
        
        // إضافة الصف إلى الجدول
        tableBody.appendChild(row);
    });
    
    // إضافة مستمعات الأحداث لأزرار عرض التفاصيل
    addViewDetailsListeners();
}

/**
 * إضافة مستمعات الأحداث لأزرار عرض التفاصيل
 */
function addViewDetailsListeners() {
    const viewDetailsButtons = document.querySelectorAll('.view-details-btn');
    
    viewDetailsButtons.forEach(button => {
        button.addEventListener('click', function() {
            const applicationId = this.getAttribute('data-id');
            
            // العثور على الطلب
            const application = applications.find(app => app.id === applicationId);
            
            if (application) {
                // عرض تفاصيل الطلب
                showApplicationDetails(application);
            }
        });
    });
}

/**
 * عرض تفاصيل الطلب
 */
function showApplicationDetails(application) {
    // تنسيق التاريخ
    const submissionDate = new Date(application.submissionDate);
    const formattedDate = submissionDate.toLocaleDateString('ar-SA');
    
    // تحديد حالة الطلب
    let statusClass = '';
    let statusText = '';
    
    switch (application.status) {
        case 'pending':
            statusClass = 'bg-warning';
            statusText = 'قيد المراجعة';
            break;
        case 'approved':
            statusClass = 'bg-success';
            statusText = 'مقبول';
            break;
        case 'rejected':
            statusClass = 'bg-danger';
            statusText = 'مرفوض';
            break;
        case 'paid':
            statusClass = 'bg-info';
            statusText = 'تم السداد';
            break;
        default:
            statusClass = 'bg-secondary';
            statusText = 'غير معروف';
    }
    
    // تحديث محتوى النافذة المنبثقة
    const modal = document.getElementById('application-details-modal');
    const modalBody = modal.querySelector('.modal-body');
    
    modalBody.innerHTML = `
        <div class="row mb-3">
            <div class="col-md-6">
                <p><strong>رقم الطلب:</strong> ${application.id}</p>
                <p><strong>حالة الطلب:</strong> <span class="badge ${statusClass}">${statusText}</span></p>
                <p><strong>تاريخ التقديم:</strong> ${formattedDate}</p>
            </div>
            <div class="col-md-6">
                <p><strong>البرنامج:</strong> ${application.program}</p>
                <p><strong>التخصص:</strong> ${application.specialization || '-'}</p>
            </div>
        </div>
        <hr>
        <div class="row">
            <div class="col-md-12">
                <h6>بيانات مقدم الطلب:</h6>
                <p><strong>الاسم:</strong> ${application.firstName} ${application.lastName}</p>
                <p><strong>رقم الهوية:</strong> ${application.nationalId}</p>
            </div>
        </div>
    `;
    
    // إضافة سبب الرفض إذا كان الطلب مرفوضًا
    if (application.status === 'rejected' && application.rejectReason) {
        const rejectReasonDiv = document.createElement('div');
        rejectReasonDiv.className = 'alert alert-danger mt-3';
        rejectReasonDiv.innerHTML = `
            <h6 class="alert-heading">سبب الرفض:</h6>
            <p class="mb-0">${application.rejectReason}</p>
        `;
        modalBody.appendChild(rejectReasonDiv);
    }
    
    // إضافة زر لوحة التحكم إذا كان الطلب مقبولاً أو تم السداد
    if (application.status === 'approved' || application.status === 'paid') {
        const dashboardBtnDiv = document.createElement('div');
        dashboardBtnDiv.className = 'text-center mt-3';
        dashboardBtnDiv.innerHTML = `
            <a href="student-dashboard.html?id=${application.id}" class="btn btn-primary">
                <i class="fas fa-sign-in-alt me-1"></i> الدخول إلى لوحة التحكم
            </a>
        `;
        modalBody.appendChild(dashboardBtnDiv);
    }
    
    // إظهار النافذة المنبثقة
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
}

/**
 * تحديث إحصائيات الطلبات
 */
function updateApplicationsStats() {
    const statsContainer = document.getElementById('applications-stats');
    if (!statsContainer) return;
    
    // حساب الإحصائيات
    const totalCount = applications.length;
    const pendingCount = applications.filter(app => app.status === 'pending').length;
    const approvedCount = applications.filter(app => app.status === 'approved').length;
    const rejectedCount = applications.filter(app => app.status === 'rejected').length;
    const paidCount = applications.filter(app => app.status === 'paid').length;
    
    // إنشاء محتوى الإحصائيات
    statsContainer.innerHTML = `
        <div class="row g-2 text-center">
            <div class="col-4">
                <div class="stats-card bg-light py-2 rounded">
                    <div class="stats-number">${totalCount}</div>
                    <div class="stats-label">إجمالي الطلبات</div>
                </div>
            </div>
            <div class="col-4">
                <div class="stats-card bg-warning bg-opacity-10 py-2 rounded">
                    <div class="stats-number">${pendingCount}</div>
                    <div class="stats-label">قيد المراجعة</div>
                </div>
            </div>
            <div class="col-4">
                <div class="stats-card bg-success bg-opacity-10 py-2 rounded">
                    <div class="stats-number">${approvedCount + paidCount}</div>
                    <div class="stats-label">مقبولة</div>
                </div>
            </div>
        </div>
    `;
}

/**
 * تسجيل الخروج
 */
function logoutUser() {
    // مسح بيانات الجلسة
    sessionStorage.removeItem('studentId');
    sessionStorage.removeItem('userData');
    
    // التوجيه إلى صفحة تسجيل الدخول
    window.location.href = 'login.html';
}

/**
 * إظهار/إخفاء حالة التحميل
 */
function showLoading(isLoading) {
    const loadingSpinner = document.getElementById('loading-spinner');
    const contentContainer = document.getElementById('content-container');
    
    if (loadingSpinner && contentContainer) {
        if (isLoading) {
            loadingSpinner.classList.remove('d-none');
            contentContainer.classList.add('d-none');
        } else {
            loadingSpinner.classList.add('d-none');
            contentContainer.classList.remove('d-none');
        }
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