/**
 * لوحة تحكم الطالب لبوابة القبول بجامعة الملك عبدالعزيز
 * التحديث الجديد مع التخزين الملفي وواجهة API
 */

// متغيرات عامة
let currentStudentData = null;
let currentApplicationData = null;

document.addEventListener('DOMContentLoaded', function() {
    // التحقق من حالة تسجيل الدخول
    checkAuthStatus().then(isAuthenticated => {
        if (!isAuthenticated) {
            // توجيه المستخدم إلى صفحة تسجيل الدخول
            window.location.href = 'login.html?redirect=student-dashboard.html';
            return;
        }
        
        // تحميل بيانات الطالب من الخادم
        initDashboard();
    });
    
    // إضافة مستمع لحدث النقر على زر تسجيل الخروج
    document.getElementById('logout-btn')?.addEventListener('click', handleLogout);
    
    // تهيئة التبديل بين علامات التبويب
    initTabSwitching();
});

/**
 * تهيئة لوحة التحكم وتحميل بيانات الطالب
 */
async function initDashboard() {
    try {
        // الحصول على بيانات الطالب من الجلسة الحالية
        const studentId = sessionStorage.getItem('studentId');
        
        if (!studentId) {
            showNotification('لم يتم العثور على بيانات الطالب', 'error');
            return;
        }
        
        // تحميل بيانات الطالب من الخادم
        await loadStudentData(studentId);
        
        // تحميل طلبات الطالب
        await loadStudentApplications(studentId);
        
        // تحديث واجهة المستخدم
        updateDashboardUI();
        
    } catch (error) {
        console.error('خطأ في تهيئة لوحة التحكم:', error);
        showNotification('حدث خطأ أثناء تحميل البيانات', 'error');
    }
}

/**
 * تحميل بيانات الطالب من الخادم
 */
async function loadStudentData(studentId) {
    try {
        // في حالة وجود API حقيقي، سنستخدم الدالة التالية
        // const response = await studentApi.getProfile(studentId);
        
        // للأغراض التجريبية، سنقوم بتحميل البيانات من الجلسة
        const userDataStr = sessionStorage.getItem('userData');
        if (userDataStr) {
            currentStudentData = JSON.parse(userDataStr);
        } else {
            throw new Error('لم يتم العثور على بيانات الطالب');
        }
    } catch (error) {
        console.error('خطأ في تحميل بيانات الطالب:', error);
        throw error;
    }
}

/**
 * تحميل طلبات الطالب من الخادم
 */
async function loadStudentApplications(studentId) {
    try {
        // في حالة وجود API حقيقي، سنستخدم الدالة التالية
        // const response = await applicationApi.getStudentApplications(studentId);
        
        // للأغراض التجريبية، سنقوم بتحميل بيانات الطلب من الجلسة
        const applicationDataStr = sessionStorage.getItem('applicationData');
        if (applicationDataStr) {
            currentApplicationData = JSON.parse(applicationDataStr);
        }
    } catch (error) {
        console.error('خطأ في تحميل طلبات الطالب:', error);
        throw error;
    }
}

/**
 * تحديث واجهة المستخدم بناءً على البيانات المحملة
 */
function updateDashboardUI() {
    // تحديث بيانات الطالب
    if (currentStudentData) {
        // تحديث معلومات الملف الشخصي
        document.getElementById('user-fullname').textContent = `${currentStudentData.firstName} ${currentStudentData.lastName}`;
        document.getElementById('banner-name').textContent = currentStudentData.firstName;
        document.getElementById('user-id').textContent = currentStudentData.nationalId || '-';
        document.getElementById('user-email').textContent = currentStudentData.email || '-';
        document.getElementById('user-phone').textContent = currentStudentData.phone || '-';
        
        // إذا كان هناك صورة شخصية
        if (currentStudentData.profileImage) {
            document.getElementById('user-avatar').src = currentStudentData.profileImage;
        }
    }

    // تحديث بيانات الطلب
    if (currentApplicationData) {
        // تحديث برنامج الطالب
        document.getElementById('user-program').textContent = currentApplicationData.program || '-';
        
        // تحديث تفاصيل الطلب
        document.getElementById('application-id').textContent = currentApplicationData.id || '-';
        document.getElementById('application-date').textContent = formatDate(currentApplicationData.submissionDate) || '-';
        document.getElementById('application-program').textContent = currentApplicationData.program || '-';
        document.getElementById('application-specialization').textContent = currentApplicationData.specialization || '-';
        document.getElementById('application-education').textContent = currentApplicationData.educationLevel || '-';
        document.getElementById('application-gpa').textContent = currentApplicationData.gpa || '-';

        // تحديث حالة الطلب
        updateApplicationStatus(currentApplicationData.status);
        
        // إذا كان الطلب مقبولاً، تفعيل قسم الدفع
        if (currentApplicationData.status === 'approved') {
            document.getElementById('quick-payment-btn').classList.add('btn-primary');
            document.getElementById('quick-payment-btn').classList.remove('btn-outline-primary');
        }
    }

    // تحميل الإشعارات
    loadNotifications();
}

/**
 * تحديث حالة الطلب في واجهة المستخدم
 */
function updateApplicationStatus(status) {
    const statusCard = document.getElementById('status-card');
    const statusBadge = document.getElementById('status-badge');
    const statusMessage = document.getElementById('status-message');
    
    // إزالة جميع فئات الحالة
    statusCard.classList.remove('status-pending', 'status-approved', 'status-rejected', 'status-paid');
    statusBadge.classList.remove('bg-warning', 'bg-success', 'bg-danger', 'bg-info');
    
    // تحديد فئة الحالة الجديدة
    switch (status) {
        case 'pending':
            statusCard.classList.add('status-pending');
            statusBadge.classList.add('bg-warning');
            statusBadge.textContent = 'قيد المراجعة';
            statusMessage.textContent = 'جاري مراجعة طلبك...';
            
            // تحديث أقسام الدفع
            document.getElementById('payment-not-required').classList.remove('d-none');
            document.getElementById('payment-required').classList.add('d-none');
            document.getElementById('payment-completed').classList.add('d-none');
            break;
            
        case 'approved':
            statusCard.classList.add('status-approved');
            statusBadge.classList.add('bg-success');
            statusBadge.textContent = 'مقبول';
            statusMessage.textContent = 'تم قبول طلبك! يرجى إتمام إجراءات التسجيل من خلال سداد الرسوم الدراسية.';
            
            // تحديث أقسام الدفع
            document.getElementById('payment-not-required').classList.add('d-none');
            document.getElementById('payment-required').classList.remove('d-none');
            document.getElementById('payment-completed').classList.add('d-none');
            break;
            
        case 'rejected':
            statusCard.classList.add('status-rejected');
            statusBadge.classList.add('bg-danger');
            statusBadge.textContent = 'مرفوض';
            statusMessage.textContent = 'نأسف، تم رفض طلبك. يمكنك التواصل مع الدعم الفني لمزيد من المعلومات.';
            
            // تحديث أقسام الدفع
            document.getElementById('payment-not-required').classList.remove('d-none');
            document.getElementById('payment-required').classList.add('d-none');
            document.getElementById('payment-completed').classList.add('d-none');
            break;
            
        case 'paid':
            statusCard.classList.add('status-paid');
            statusBadge.classList.add('bg-info');
            statusBadge.textContent = 'تم السداد';
            statusMessage.textContent = 'تم سداد الرسوم الدراسية بنجاح. يمكنك الآن الدخول إلى النظام الأكاديمي.';
            
            // تحديث أقسام الدفع
            document.getElementById('payment-not-required').classList.add('d-none');
            document.getElementById('payment-required').classList.add('d-none');
            document.getElementById('payment-completed').classList.remove('d-none');
            
            // تفعيل الوصول للنظام الأكاديمي
            document.getElementById('quick-academic-btn').classList.remove('disabled');
            break;
    }
}

/**
 * تحميل الإشعارات
 */
function loadNotifications() {
    const noticesList = document.getElementById('notices-list');
    if (!noticesList) return;
    
    // إفراغ قائمة الإشعارات
    noticesList.innerHTML = '';
    
    // إشعارات افتراضية
    const notices = [
        {
            title: 'التسجيل للفصل الدراسي',
            message: 'تم فتح باب التسجيل للفصل الدراسي القادم، يرجى التسجيل قبل تاريخ 15/06/2025.',
            date: '2025-05-01',
            type: 'info'
        },
        {
            title: 'موعد الاختبارات النهائية',
            message: 'ستبدأ الاختبارات النهائية بتاريخ 01/07/2025، يرجى الاطلاع على جدول الاختبارات.',
            date: '2025-05-15',
            type: 'warning'
        }
    ];
    
    // إضافة الإشعارات إلى القائمة
    notices.forEach(notice => {
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item';
        
        let badgeClass = 'bg-primary';
        if (notice.type === 'warning') badgeClass = 'bg-warning';
        if (notice.type === 'danger') badgeClass = 'bg-danger';
        
        listItem.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h6 class="mb-1">${notice.title}</h6>
                    <p class="mb-0 text-muted small">${formatDate(notice.date)}</p>
                </div>
                <span class="badge ${badgeClass}">جديد</span>
            </div>
            <p class="mb-0 mt-2">${notice.message}</p>
        `;
        
        noticesList.appendChild(listItem);
    });
}

/**
 * تهيئة وظيفة التبديل بين علامات التبويب
 */
function initTabSwitching() {
    // إضافة مستمع لأحداث النقر على علامات التبويب
    document.querySelectorAll('[data-bs-toggle="pill"]').forEach(tab => {
        tab.addEventListener('shown.bs.tab', event => {
            // يمكن تنفيذ إجراءات محددة عند تبديل التبويب
            const targetId = event.target.getAttribute('data-bs-target').substring(1);
            console.log('تم التبديل إلى التبويب:', targetId);
        });
    });
}

/**
 * معالجة عملية تسجيل الخروج
 */
function handleLogout() {
    // مسح بيانات الجلسة
    sessionStorage.removeItem('studentId');
    sessionStorage.removeItem('userData');
    sessionStorage.removeItem('applicationData');
    
    // توجيه المستخدم إلى صفحة تسجيل الدخول
    window.location.href = 'login.html';
}

/**
 * تنسيق التاريخ بالتنسيق العربي
 */
function formatDate(dateString) {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA');
}

/**
 * عرض إشعار للمستخدم
 */
function showNotification(message, type = 'info') {
    // يمكن استخدام مكتبة إشعارات أو Bootstrap Toast
    alert(message);
}

/**
 * التحقق من حالة تسجيل الدخول
 * ملاحظة: هذه وظيفة وهمية، في التطبيق الحقيقي ستتصل بالخادم
 */
async function checkAuthStatus() {
    return !!sessionStorage.getItem('studentId');
}

// دالة لتبديل علامات التبويب من خلال الأزرار
function switchToTab(tabId) {
    document.getElementById(tabId).click();
}