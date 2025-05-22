/**
 * التعامل مع الاستعلام عن حالة الطلب
 */

document.addEventListener('DOMContentLoaded', function() {
    // تهيئة نموذج الاستعلام
    const statusForm = document.getElementById('applicationStatusForm');
    if (statusForm) {
        statusForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (validateForm(this)) {
                handleStatusInquiry();
            } else {
                showValidationErrors(this);
            }
        });
    }

    // تهيئة زر الطباعة
    const printBtn = document.getElementById('printApplicationBtn');
    if (printBtn) {
        printBtn.addEventListener('click', function() {
            window.print();
        });
    }

    // التحقق من وجود معلمات في عنوان URL
    checkUrlParameters();
});

/**
 * التحقق من وجود معلمات في عنوان URL للاستعلام التلقائي
 */
function checkUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const applicationId = urlParams.get('id');
    const nationalId = urlParams.get('nid');

    if (applicationId && nationalId) {
        document.getElementById('applicationId').value = applicationId;
        document.getElementById('nationalId').value = nationalId;
        handleStatusInquiry();
    }
}

/**
 * معالجة الاستعلام عن حالة الطلب
 */
function handleStatusInquiry() {
    const applicationId = document.getElementById('applicationId').value.trim();
    const nationalId = document.getElementById('nationalId').value.trim();
    const statusResult = document.getElementById('statusResult');

    if (!applicationId || !nationalId || !statusResult) {
        return;
    }

    // البحث عن الطلب في التخزين المحلي
    const applications = getApplications();
    const application = applications.find(app => 
        app.applicationId === applicationId && app.nationalId === nationalId
    );

    if (application) {
        // تحديد حالة الطلب ولونها
        let statusClass = '';
        let statusText = '';
        let additionalInfo = '';

        switch(application.status) {
            case 'pending':
                statusClass = 'alert-warning';
                statusText = 'قيد المراجعة';
                additionalInfo = `
                    <p>طلبك قيد المراجعة من قبل لجنة القبول. سيتم إشعارك عند تغيير حالة الطلب.</p>
                    <p>وقت المراجعة المتوقع: 3-5 أيام عمل.</p>
                `;
                break;
            case 'approved':
                statusClass = 'alert-success';
                statusText = 'مقبول';
                additionalInfo = `
                    <p>تهانينا! تم قبول طلبك في برنامج ${application.program || 'الدبلوم عن بعد'}.</p>
                    <p>يمكنك الآن <a href="login.html" class="alert-link">تسجيل الدخول</a> للوصول إلى البوابة الأكاديمية والاطلاع على المقررات الدراسية والجدول الزمني.</p>
                `;
                break;
            case 'rejected':
                statusClass = 'alert-danger';
                statusText = 'مرفوض';
                const reason = application.rejectionReason || 'عدم استيفاء شروط القبول.';
                additionalInfo = `
                    <p>نأسف لإبلاغك بأنه تم رفض طلبك.</p>
                    <p><strong>سبب الرفض:</strong> ${reason}</p>
                    <p>يمكنك التقدم بطلب جديد بعد معالجة سبب الرفض أو اختيار برنامج آخر يتناسب مع مؤهلاتك.</p>
                `;
                break;
            default:
                statusClass = 'alert-info';
                statusText = 'غير محدد';
                additionalInfo = `
                    <p>لم يتم تحديد حالة الطلب بعد. يرجى المحاولة مرة أخرى لاحقاً.</p>
                `;
        }

        // تنسيق التاريخ
        const submitDate = new Date(application.timestamp);
        const formattedDate = submitDate.toLocaleDateString('ar-SA');

        // عرض معلومات الطلب
        statusResult.innerHTML = `
            <div class="alert ${statusClass}">
                <h4 class="alert-heading">حالة الطلب: ${statusText}</h4>
                <hr>
                <div class="row">
                    <div class="col-md-6">
                        <p><strong>رقم الطلب:</strong> ${application.applicationId}</p>
                        <p><strong>تاريخ التقديم:</strong> ${formattedDate}</p>
                    </div>
                    <div class="col-md-6">
                        <p><strong>الاسم:</strong> ${application.firstName} ${application.lastName}</p>
                        <p><strong>البرنامج:</strong> ${application.program || 'غير محدد'}</p>
                    </div>
                </div>
                <hr>
                ${additionalInfo}
            </div>

            <div class="d-flex justify-content-center mt-3">
                <button type="button" class="btn btn-primary me-2 view-details-btn" data-id="${application.applicationId}" data-nid="${application.nationalId}">
                    <i class="fas fa-eye me-1"></i> عرض التفاصيل الكاملة
                </button>
                ${application.status === 'approved' ? `
                    <a href="login.html" class="btn btn-success">
                        <i class="fas fa-sign-in-alt me-1"></i> تسجيل الدخول
                    </a>
                ` : ''}
            </div>
        `;

        // إضافة حدث للزر عرض التفاصيل
        statusResult.querySelector('.view-details-btn').addEventListener('click', function() {
            const appId = this.getAttribute('data-id');
            viewApplicationDetails(appId);
        });
    } else {
        // عرض رسالة عدم العثور على الطلب
        statusResult.innerHTML = `
            <div class="alert alert-danger">
                <h4 class="alert-heading">لم يتم العثور على الطلب!</h4>
                <p>لم نتمكن من العثور على طلب بالمعلومات المدخلة. يرجى التأكد من صحة رقم الطلب ورقم الهوية الوطنية.</p>
                <hr>
                <p class="mb-0">إذا كنت متأكداً من صحة المعلومات، يرجى التواصل مع قسم القبول والتسجيل للمساعدة.</p>
            </div>
        `;
    }

    // عرض نتيجة الاستعلام
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
                    ${application.status === 'rejected' && application.rejectionReason ? 
                        `<p><strong>سبب الرفض:</strong> ${application.rejectionReason}</p>` : 
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
                    <a href="login.html" class="btn btn-success btn-lg">
                        <i class="fas fa-sign-in-alt me-1"></i> تسجيل الدخول للبوابة الأكاديمية
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