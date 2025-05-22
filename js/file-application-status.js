/**
 * صفحة استعلام حالة الطلب - متوافقة مع التخزين الملفي
 */

// عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة نموذج الاستعلام
    initQueryForm();
    
    // التحقق من وجود معلمات في URL
    checkUrlParameters();
});

/**
 * تهيئة نموذج الاستعلام
 */
function initQueryForm() {
    const queryForm = document.getElementById('application-query-form');
    if (queryForm) {
        queryForm.addEventListener('submit', handleApplicationQuery);
    }
}

/**
 * معالجة استعلام الطلب
 */
async function handleApplicationQuery(e) {
    e.preventDefault();
    
    // الحصول على بيانات النموذج
    const applicationId = document.getElementById('application-id').value;
    const nationalId = document.getElementById('national-id').value;
    
    // التحقق من ملء الحقول المطلوبة
    if (!applicationId || !nationalId) {
        showNotification('يرجى ملء جميع الحقول المطلوبة', 'error');
        return;
    }
    
    // إظهار حالة التحميل
    const queryBtn = document.querySelector('#application-query-form button[type="submit"]');
    queryBtn.disabled = true;
    queryBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> جارٍ البحث...';
    
    // إخفاء نتائج سابقة
    document.getElementById('result-container').classList.add('d-none');
    
    try {
        // في النظام الحقيقي، سيتم إرسال طلب إلى الخادم
        // const response = await fetch(`/api/applications/query?id=${applicationId}&nationalId=${nationalId}`);
        // const result = await response.json();
        
        // تأخير اصطناعي لمحاكاة الاتصال بالخادم
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // للتجربة، البحث في بيانات الطلبات المخزنة محلياً
        const application = await fetchApplicationFromServer(applicationId, nationalId);
        
        if (application) {
            // عرض نتائج الطلب
            displayApplicationResult(application);
        } else {
            showNotification('لم يتم العثور على الطلب. يرجى التأكد من صحة البيانات المدخلة.', 'error');
        }
    } catch (error) {
        console.error('خطأ في الاستعلام عن الطلب:', error);
        showNotification('حدث خطأ أثناء البحث عن الطلب. يرجى المحاولة مرة أخرى.', 'error');
    } finally {
        // إعادة تفعيل زر البحث
        queryBtn.disabled = false;
        queryBtn.innerHTML = 'استعلام';
    }
}

/**
 * البحث عن الطلب في الخادم (محاكاة)
 */
async function fetchApplicationFromServer(applicationId, nationalId) {
    // في نظام حقيقي، هذه الدالة ستتصل بالخادم
    
    // للتجربة، إنشاء طلب وهمي
    if (applicationId === 'APP-123456' && nationalId === '1234567890') {
        return {
            id: 'APP-123456',
            firstName: 'أحمد',
            lastName: 'محمد',
            nationalId: '1234567890',
            program: 'دبلوم إدارة الأعمال',
            status: 'pending',
            submissionDate: '2025-05-01T10:30:00.000Z'
        };
    } else if (applicationId === 'APP-234567' && nationalId === '2345678901') {
        return {
            id: 'APP-234567',
            firstName: 'سارة',
            lastName: 'عبدالله',
            nationalId: '2345678901',
            program: 'دبلوم علوم الحاسب',
            status: 'approved',
            submissionDate: '2025-05-02T14:15:00.000Z'
        };
    } else if (applicationId === 'APP-345678' && nationalId === '3456789012') {
        return {
            id: 'APP-345678',
            firstName: 'خالد',
            lastName: 'عبدالرحمن',
            nationalId: '3456789012',
            program: 'دبلوم المحاسبة',
            status: 'rejected',
            submissionDate: '2025-05-03T09:45:00.000Z',
            rejectReason: 'عدم استيفاء شروط القبول'
        };
    } else if (applicationId === 'APP-456789' && nationalId === '4567890123') {
        return {
            id: 'APP-456789',
            firstName: 'محمد',
            lastName: 'علي',
            nationalId: '4567890123',
            program: 'دبلوم التسويق',
            status: 'paid',
            submissionDate: '2025-05-04T11:20:00.000Z',
            paymentDate: '2025-05-05T15:30:00.000Z'
        };
    }
    
    // بيانات من sessionStorage
    const storedApp = sessionStorage.getItem('applicationData');
    if (storedApp) {
        const appData = JSON.parse(storedApp);
        if (appData.id === applicationId && appData.nationalId === nationalId) {
            return appData;
        }
    }
    
    // لم يتم العثور على الطلب
    return null;
}

/**
 * عرض نتائج الطلب
 */
function displayApplicationResult(application) {
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
    
    // تحديث معلومات الطلب
    document.getElementById('result-application-id').textContent = application.id;
    document.getElementById('result-student-name').textContent = `${application.firstName} ${application.lastName}`;
    document.getElementById('result-program').textContent = application.program || '-';
    document.getElementById('result-submission-date').textContent = formattedDate;
    
    // تحديث حالة الطلب
    const statusBadge = document.getElementById('result-status');
    statusBadge.className = `badge ${statusClass}`;
    statusBadge.textContent = statusText;
    
    // إضافة سبب الرفض إذا كان الطلب مرفوضًا
    const rejectReasonContainer = document.getElementById('reject-reason-container');
    const rejectReason = document.getElementById('result-reject-reason');
    
    if (application.status === 'rejected' && application.rejectReason) {
        rejectReason.textContent = application.rejectReason;
        rejectReasonContainer.classList.remove('d-none');
    } else {
        rejectReasonContainer.classList.add('d-none');
    }
    
    // إظهار الإجراءات المناسبة حسب الحالة
    const pendingActions = document.getElementById('pending-actions');
    const approvedActions = document.getElementById('approved-actions');
    const rejectedActions = document.getElementById('rejected-actions');
    const paidActions = document.getElementById('paid-actions');
    
    // إخفاء جميع الإجراءات
    pendingActions.classList.add('d-none');
    approvedActions.classList.add('d-none');
    rejectedActions.classList.add('d-none');
    paidActions.classList.add('d-none');
    
    // إظهار الإجراءات حسب الحالة
    if (application.status === 'pending') {
        pendingActions.classList.remove('d-none');
    } else if (application.status === 'approved') {
        approvedActions.classList.remove('d-none');
    } else if (application.status === 'rejected') {
        rejectedActions.classList.remove('d-none');
    } else if (application.status === 'paid') {
        paidActions.classList.remove('d-none');
    }
    
    // تحديث رابط تسجيل الدخول لإضافة معرف الطلب
    const loginBtn = document.getElementById('approved-login-btn');
    if (loginBtn) {
        loginBtn.href = `login.html?redirect=student-dashboard.html%3Fid%3D${application.id}`;
    }
    
    // تحديث رابط لوحة الطالب
    const dashboardBtn = document.getElementById('paid-dashboard-btn');
    if (dashboardBtn) {
        dashboardBtn.href = `student-dashboard.html?id=${application.id}`;
    }
    
    // إظهار حاوية النتائج
    document.getElementById('result-container').classList.remove('d-none');
}

/**
 * التحقق من وجود معلمات في URL
 */
function checkUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const applicationId = urlParams.get('id');
    const nationalId = urlParams.get('nid');
    
    if (applicationId && nationalId) {
        // ملء النموذج بالقيم من URL
        document.getElementById('application-id').value = applicationId;
        document.getElementById('national-id').value = nationalId;
        
        // تقديم النموذج تلقائيًا
        const queryForm = document.getElementById('application-query-form');
        if (queryForm) {
            queryForm.dispatchEvent(new Event('submit'));
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