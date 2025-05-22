/**
 * لوحة تحكم الطالب لبوابة القبول بجامعة الملك عبدالعزيز
 */

document.addEventListener('DOMContentLoaded', function() {
    // التحقق من حالة تسجيل الدخول
    if (!checkAuthStatus()) {
        // سيقوم مكتبة auth.js بالتحويل إلى صفحة تسجيل الدخول
        return;
    }
    
    // تحميل بيانات الطالب
    loadStudentData();
    
    // تهيئة التنقل بين الأقسام
    initSectionNavigation();
    
    // تهيئة أحداث تسجيل الخروج
    document.getElementById('logoutLink')?.addEventListener('click', function(e) {
        e.preventDefault();
        logoutUser();
    });
    
    // تهيئة الطباعة
    document.querySelectorAll('.print-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            window.print();
        });
    });
});

/**
 * تحميل بيانات الطالب من التخزين المحلي
 */
function loadStudentData() {
    const urlParams = new URLSearchParams(window.location.search);
    const applicationId = urlParams.get('id');
    
    if (!applicationId) {
        showNotification('لم يتم تحديد رقم الطلب.', 'error');
        return;
    }
    
    // الحصول على بيانات الطلب والطالب
    const application = getApplicationById(applicationId);
    
    if (!application) {
        showNotification('لم يتم العثور على بيانات الطلب.', 'error');
        return;
    }
    
    // التحقق من أن الطلب مقبول
    if (application.status !== 'approved') {
        showNotification('هذا الطلب غير مقبول بعد.', 'warning');
        setTimeout(() => {
            window.location.href = 'applications.html';
        }, 3000);
        return;
    }
    
    // الحصول على بيانات المستخدم
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        showNotification('لم يتم العثور على بيانات المستخدم.', 'error');
        return;
    }
    
    // التحقق من أن الطلب يخص المستخدم الحالي
    if (application.nationalId !== currentUser.nationalId) {
        showNotification('لا يمكنك الوصول إلى بيانات هذا الطلب.', 'error');
        setTimeout(() => {
            window.location.href = 'applications.html';
        }, 3000);
        return;
    }
    
    // تحديث بيانات الطالب في الصفحة
    const studentName = `${application.firstName} ${application.lastName}`;
    
    // تحديث العناصر بالاسم
    document.getElementById('studentName').textContent = studentName;
    document.getElementById('sidebarStudentName').textContent = studentName;
    document.getElementById('welcomeStudentName').textContent = studentName;
    
    // تحديث البرنامج
    const program = application.program || 'دبلوم غير محدد';
    document.getElementById('studentProgram').textContent = program;
    document.getElementById('welcomeStudentProgram').textContent = program;
    
    // تحديث رقم الطالب (نستخدم رقم الطلب كرقم طالب للعرض)
    const studentId = applicationId.split('-')[2]; // استخراج الجزء الأخير من رقم الطلب
    document.getElementById('studentId').textContent = `الرقم الجامعي: ${studentId}`;
}

/**
 * تهيئة التنقل بين أقسام لوحة التحكم
 */
function initSectionNavigation() {
    // إضافة أحداث النقر لروابط التنقل
    document.querySelectorAll('[data-section]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-section');
            switchSection(sectionId);
            
            // تحديث الرابط النشط في الشريط الجانبي
            document.querySelectorAll('.sidebar-link').forEach(sideLink => {
                if (sideLink.getAttribute('data-section') === sectionId) {
                    sideLink.classList.add('active');
                } else {
                    sideLink.classList.remove('active');
                }
            });
            
            // في حالة الشاشات الصغيرة، أغلق القائمة بعد النقر
            if (window.innerWidth < 992) {
                const navbarCollapse = document.getElementById('navbarStudent');
                if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                    bootstrap.Collapse.getInstance(navbarCollapse).hide();
                }
            }
        });
    });
}

/**
 * التبديل بين أقسام لوحة التحكم
 * @param {string} sectionId - معرف القسم المراد عرضه
 */
function switchSection(sectionId) {
    // إخفاء جميع الأقسام
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.add('d-none');
    });
    
    // إظهار القسم المطلوب
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.remove('d-none');
    }
    
    // تحميل بيانات القسم إذا لزم الأمر
    switch(sectionId) {
        case 'courses-section':
            // يمكن استدعاء دالة لتحميل بيانات المقررات
            break;
        case 'assignments-section':
            // يمكن استدعاء دالة لتحميل بيانات الواجبات
            break;
        case 'exams-section':
            // يمكن استدعاء دالة لتحميل بيانات الاختبارات
            break;
        case 'grades-section':
            // يمكن استدعاء دالة لتحميل بيانات الدرجات
            break;
        case 'schedule-section':
            // يمكن استدعاء دالة لتحميل بيانات الجدول الدراسي
            break;
    }
}