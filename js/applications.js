/**
 * إدارة الطلبات لبوابة القبول بجامعة الملك عبدالعزيز
 */

document.addEventListener('DOMContentLoaded', function() {
    // التحقق من حالة تسجيل الدخول
    if (!checkAuthStatus()) {
        // سيقوم مكتبة auth.js بالتحويل إلى صفحة تسجيل الدخول
        return;
    }
    
    // تحميل الطلبات الخاصة بالمستخدم الحالي
    loadUserApplications();
    
    // تهيئة نموذج الاستعلام عن الطلب
    const applicationStatusForm = document.getElementById('applicationStatusForm');
    if (applicationStatusForm) {
        applicationStatusForm.addEventListener('submit', handleStatusCheck);
    }
    
    // تهيئة زر الطباعة
    const printApplicationBtn = document.getElementById('printApplicationBtn');
    if (printApplicationBtn) {
        printApplicationBtn.addEventListener('click', function() {
            printApplicationDetails();
        });
    }
});

/**
 * تحميل طلبات المستخدم الحالي
 */
function loadUserApplications() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    // الحصول على الطلبات المرتبطة برقم الهوية الوطنية للمستخدم
    const applications = getApplications().filter(app => app.nationalId === currentUser.nationalId);
    
    const applicationsTable = document.getElementById('applicationsTable');
    const noApplicationsMessage = document.getElementById('noApplicationsMessage');
    
    if (applications.length === 0) {
        // إظهار رسالة عدم وجود طلبات
        if (applicationsTable) applicationsTable.innerHTML = '';
        if (noApplicationsMessage) noApplicationsMessage.classList.remove('d-none');
        return;
    }
    
    // إخفاء رسالة عدم وجود طلبات وعرض الجدول
    if (noApplicationsMessage) noApplicationsMessage.classList.add('d-none');
    if (!applicationsTable) return;
    
    // ترتيب الطلبات حسب تاريخ التقديم (الأحدث أولاً)
    const sortedApplications = applications.sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
    );
    
    // عرض الطلبات في الجدول
    applicationsTable.innerHTML = '';
    sortedApplications.forEach(app => {
        const row = document.createElement('tr');
        
        // تحديد لون الحالة وشكلها
        let statusBadge = '';
        switch(app.status) {
            case 'pending':
                statusBadge = '<span class="badge bg-warning text-dark">قيد المراجعة</span>';
                break;
            case 'approved':
                statusBadge = '<span class="badge bg-success">مقبول</span>';
                break;
            case 'rejected':
                statusBadge = '<span class="badge bg-danger">مرفوض</span>';
                break;
            default:
                statusBadge = '<span class="badge bg-secondary">غير محدد</span>';
        }
        
        // تنسيق التواريخ
        const submitDate = new Date(app.timestamp);
        const formattedSubmitDate = submitDate.toLocaleDateString('ar-SA');
        
        const updateDate = app.statusUpdateTime ? new Date(app.statusUpdateTime) : submitDate;
        const formattedUpdateDate = updateDate.toLocaleDateString('ar-SA');
        
        row.innerHTML = `
            <td>${app.applicationId}</td>
            <td>${app.program || 'غير محدد'}</td>
            <td>${formattedSubmitDate}</td>
            <td>${formattedUpdateDate}</td>
            <td>${statusBadge}</td>
            <td>
                <button class="btn btn-sm btn-primary view-application me-1" data-id="${app.applicationId}">
                    <i class="fas fa-eye"></i> عرض
                </button>
                ${app.status === 'approved' ? 
                    `<a href="student-dashboard.html?id=${app.applicationId}" class="btn btn-sm btn-success">
                        <i class="fas fa-graduation-cap"></i> البوابة الأكاديمية
                     </a>` : 
                    ''}
            </td>
        `;
        
        applicationsTable.appendChild(row);
    });
    
    // إضافة استماع لأحداث أزرار العرض
    document.querySelectorAll('.view-application').forEach(btn => {
        btn.addEventListener('click', function() {
            const appId = this.getAttribute('data-id');
            viewApplicationDetails(appId);
        });
    });
}

/**
 * التعامل مع استعلام عن حالة طلب
 * @param {Event} event - حدث التقديم
 */
function handleStatusCheck(event) {
    event.preventDefault();
    
    const applicationId = document.getElementById('applicationId').value.trim();
    const nationalId = document.getElementById('nationalIdCheck').value.trim();
    
    if (!applicationId || !nationalId) {
        return;
    }
    
    // البحث عن الطلب بالرقم ورقم الهوية
    const applications = getApplications();
    const application = applications.find(app => 
        app.applicationId === applicationId && app.nationalId === nationalId
    );
    
    const statusResult = document.getElementById('statusResult');
    
    if (!statusResult) return;
    
    if (application) {
        // تحديد حالة الطلب وعرضها
        let statusClass = '';
        let statusText = '';
        
        switch(application.status) {
            case 'pending':
                statusClass = 'alert-warning';
                statusText = 'قيد المراجعة';
                break;
            case 'approved':
                statusClass = 'alert-success';
                statusText = 'مقبول';
                break;
            case 'rejected':
                statusClass = 'alert-danger';
                statusText = 'مرفوض';
                break;
            default:
                statusClass = 'alert-info';
                statusText = 'غير محدد';
        }
        
        // تنسيق التاريخ
        const submitDate = new Date(application.timestamp);
        const formattedDate = submitDate.toLocaleDateString('ar-SA');
        
        statusResult.innerHTML = `
            <div class="alert ${statusClass}">
                <h5>حالة الطلب: ${statusText}</h5>
                <hr>
                <p><strong>رقم الطلب:</strong> ${application.applicationId}</p>
                <p><strong>البرنامج:</strong> ${application.program || 'غير محدد'}</p>
                <p><strong>تاريخ التقديم:</strong> ${formattedDate}</p>
                ${application.status === 'approved' ?
                    `<p class="mt-3">يمكنك <a href="student-dashboard.html?id=${application.applicationId}" class="alert-link">الوصول إلى البوابة الأكاديمية</a>.</p>` :
                    ''}
                ${application.status === 'rejected' && application.notes ?
                    `<p><strong>ملاحظات:</strong> ${application.notes}</p>` :
                    ''}
            </div>
            <button type="button" class="btn btn-primary view-details-btn" data-id="${application.applicationId}">
                <i class="fas fa-eye me-1"></i> عرض التفاصيل الكاملة
            </button>
        `;
        
        // إضافة استماع لحدث زر عرض التفاصيل
        document.querySelector('.view-details-btn').addEventListener('click', function() {
            const appId = this.getAttribute('data-id');
            viewApplicationDetails(appId);
        });
    } else {
        statusResult.innerHTML = `
            <div class="alert alert-danger">
                لم يتم العثور على طلب بهذه المعلومات. يرجى التأكد من رقم الطلب ورقم الهوية الوطنية.
            </div>
        `;
    }
    
    statusResult.classList.remove('d-none');
}

/**
 * عرض تفاصيل الطلب في نافذة منبثقة
 * @param {string} applicationId - رقم الطلب
 */
function viewApplicationDetails(applicationId) {
    const application = getApplicationById(applicationId);
    
    if (!application) {
        showNotification('لم يتم العثور على الطلب المطلوب.', 'error');
        return;
    }
    
    const modalContent = document.getElementById('applicationDetailsContent');
    if (!modalContent) return;
    
    // تنسيق التواريخ
    const submitDate = new Date(application.timestamp);
    const formattedSubmitDate = submitDate.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // تحديد حالة الطلب
    let statusBadge = '';
    switch(application.status) {
        case 'pending':
            statusBadge = '<span class="badge bg-warning text-dark fs-6">قيد المراجعة</span>';
            break;
        case 'approved':
            statusBadge = '<span class="badge bg-success fs-6">مقبول</span>';
            break;
        case 'rejected':
            statusBadge = '<span class="badge bg-danger fs-6">مرفوض</span>';
            break;
        default:
            statusBadge = '<span class="badge bg-secondary fs-6">غير محدد</span>';
    }
    
    // بناء محتوى التفاصيل
    let detailsContent = `
        <div class="application-details">
            <div class="row mb-4">
                <div class="col-md-6">
                    <h5 class="border-bottom pb-2 mb-3">معلومات الطلب</h5>
                    <p><strong>رقم الطلب:</strong> ${application.applicationId}</p>
                    <p><strong>تاريخ التقديم:</strong> ${formattedSubmitDate}</p>
                    <p><strong>البرنامج:</strong> ${application.program || 'غير محدد'}</p>
                    <p><strong>التخصص:</strong> ${application.specialization || 'غير محدد'}</p>
                </div>
                <div class="col-md-6">
                    <h5 class="border-bottom pb-2 mb-3">حالة الطلب</h5>
                    <p><strong>الحالة الحالية:</strong> ${statusBadge}</p>
                    ${application.statusUpdateTime ? 
                        `<p><strong>تاريخ آخر تحديث:</strong> ${new Date(application.statusUpdateTime).toLocaleDateString('ar-SA')}</p>` : 
                        ''}
                    ${application.status === 'rejected' && application.notes ? 
                        `<p><strong>سبب الرفض:</strong> ${application.notes}</p>` : 
                        ''}
                </div>
            </div>
            
            <h5 class="border-bottom pb-2 mb-3">البيانات الشخصية</h5>
            <div class="row mb-4">
                <div class="col-md-6">
                    <p><strong>الاسم الكامل:</strong> ${application.firstName} ${application.lastName}</p>
                    <p><strong>رقم الهوية الوطنية:</strong> ${application.nationalId}</p>
                    <p><strong>تاريخ الميلاد:</strong> ${application.birthDate || 'غير محدد'}</p>
                </div>
                <div class="col-md-6">
                    <p><strong>الجنس:</strong> ${application.gender || 'غير محدد'}</p>
                    <p><strong>البريد الإلكتروني:</strong> ${application.email || 'غير محدد'}</p>
                    <p><strong>رقم الهاتف:</strong> ${application.phone || 'غير محدد'}</p>
                </div>
            </div>
            
            <h5 class="border-bottom pb-2 mb-3">المؤهلات العلمية</h5>
            <div class="row mb-4">
                <div class="col-md-6">
                    <p><strong>المؤهل العلمي:</strong> ${application.educationLevel || 'غير محدد'}</p>
                    <p><strong>التخصص:</strong> ${application.educationSpecialization || 'غير محدد'}</p>
                    <p><strong>المعدل التراكمي:</strong> ${application.gpa || 'غير محدد'}</p>
                </div>
                <div class="col-md-6">
                    <p><strong>جهة التخرج:</strong> ${application.institution || 'غير محدد'}</p>
                    <p><strong>سنة التخرج:</strong> ${application.graduationYear || 'غير محدد'}</p>
                </div>
            </div>
            
            ${application.notes ? 
                `<h5 class="border-bottom pb-2 mb-3">ملاحظات</h5>
                <div class="mb-4">
                    <p>${application.notes}</p>
                </div>` : 
                ''}
                
            ${application.status === 'approved' ? 
                `<div class="text-center mt-4">
                    <a href="student-dashboard.html?id=${application.applicationId}" class="btn btn-success btn-lg">
                        <i class="fas fa-graduation-cap me-1"></i> الانتقال إلى البوابة الأكاديمية
                    </a>
                </div>` : 
                ''}
        </div>
    `;
    
    modalContent.innerHTML = detailsContent;
    
    // عرض النافذة المنبثقة
    const modal = new bootstrap.Modal(document.getElementById('applicationDetailsModal'));
    modal.show();
}

/**
 * طباعة تفاصيل الطلب
 */
function printApplicationDetails() {
    window.print();
}