/**
 * إدارة المدفوعات - لوحة تحكم المشرف
 */

// المتغيرات العامة
let allPayments = [];
let filteredPayments = [];

document.addEventListener('DOMContentLoaded', function() {
    // التحقق من تسجيل دخول المشرف
    if (!checkAdminAuth()) {
        window.location.href = 'login.html';
        return;
    }
    
    // تهيئة جدول المدفوعات
    initPaymentsTable();
    
    // تهيئة البحث والتصفية
    initSearchAndFilters();
    
    // تهيئة تصدير البيانات
    initExportButtons();
});

/**
 * تهيئة جدول المدفوعات
 */
async function initPaymentsTable() {
    // عرض حالة التحميل
    showLoadingState(true);
    
    try {
        // تحميل جميع المدفوعات
        await loadAllPayments();
        
        // عرض المدفوعات في الجدول
        renderPaymentsTable(allPayments);
        
    } catch (error) {
        console.error('خطأ في تحميل بيانات المدفوعات:', error);
        showErrorMessage('حدث خطأ أثناء تحميل بيانات المدفوعات.');
    } finally {
        // إخفاء حالة التحميل
        showLoadingState(false);
    }
}

/**
 * تحميل جميع بيانات المدفوعات
 */
async function loadAllPayments() {
    try {
        // في الإصدار النهائي سيتم استخدام API لتحميل البيانات
        // const response = await fetch('/api/admin/payments');
        // allPayments = await response.json();
        
        // للتجربة، سنقوم بتحميل البيانات من الملف
        const response = await fetch('/data/payments/payments-list.json');
        if (!response.ok) {
            throw new Error(`فشل تحميل البيانات: ${response.status}`);
        }
        
        const data = await response.json();
        allPayments = Array.isArray(data) ? data : [];
        filteredPayments = [...allPayments];
        
        console.log(`تم تحميل ${allPayments.length} سجل من المدفوعات`);
    } catch (error) {
        console.error('خطأ في تحميل بيانات المدفوعات:', error);
        // إنشاء بيانات افتراضية للتجربة إذا فشل التحميل
        createSamplePayments();
    }
}

/**
 * إنشاء بيانات مدفوعات افتراضية للتجربة
 */
function createSamplePayments() {
    allPayments = [
        {
            id: 'PAY-001',
            amount: 12500,
            studentId: 'STD-001',
            studentName: 'أحمد محمد علي',
            applicationId: 'APP-001',
            program: 'دبلوم إدارة الأعمال',
            timestamp: '2025-05-01T10:30:00.000Z',
            status: 'completed',
            method: 'بطاقة ائتمانية',
            cardLast4: '1234',
            receiptNumber: '123456'
        },
        {
            id: 'PAY-002',
            amount: 12500,
            studentId: 'STD-002',
            studentName: 'سارة عبدالله أحمد',
            applicationId: 'APP-002',
            program: 'دبلوم علوم الحاسب',
            timestamp: '2025-05-02T14:15:00.000Z',
            status: 'completed',
            method: 'بطاقة مدى',
            cardLast4: '5678',
            receiptNumber: '123457'
        },
        {
            id: 'PAY-003',
            amount: 12500,
            studentId: 'STD-003',
            studentName: 'خالد عبدالرحمن محمد',
            applicationId: 'APP-003',
            program: 'دبلوم المحاسبة',
            timestamp: '2025-05-03T09:45:00.000Z',
            status: 'completed',
            method: 'بطاقة ائتمانية',
            cardLast4: '9012',
            receiptNumber: '123458'
        }
    ];
    filteredPayments = [...allPayments];
}

/**
 * عرض المدفوعات في الجدول
 */
function renderPaymentsTable(payments) {
    const tableBody = document.getElementById('payments-table-body');
    if (!tableBody) return;
    
    // إفراغ الجدول
    tableBody.innerHTML = '';
    
    // إذا لم توجد مدفوعات
    if (payments.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="8" class="text-center">لا توجد مدفوعات</td>';
        tableBody.appendChild(emptyRow);
        return;
    }
    
    // إضافة صفوف المدفوعات
    payments.forEach(payment => {
        const row = document.createElement('tr');
        
        // تنسيق التاريخ
        const paymentDate = new Date(payment.timestamp);
        const formattedDate = paymentDate.toLocaleDateString('ar-SA') + ' ' + paymentDate.toLocaleTimeString('ar-SA');
        
        // تنسيق المبلغ
        const formattedAmount = new Intl.NumberFormat('ar-SA', {
            style: 'currency',
            currency: 'SAR'
        }).format(payment.amount);
        
        row.innerHTML = `
            <td>${payment.id}</td>
            <td>${payment.receiptNumber || '-'}</td>
            <td>${payment.studentName || payment.studentId}</td>
            <td>${payment.program || '-'}</td>
            <td>${formattedAmount}</td>
            <td>${payment.method}</td>
            <td>${formattedDate}</td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button type="button" class="btn btn-info view-payment" data-id="${payment.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button type="button" class="btn btn-primary print-receipt" data-id="${payment.id}">
                        <i class="fas fa-print"></i>
                    </button>
                    <button type="button" class="btn btn-secondary export-payment" data-id="${payment.id}">
                        <i class="fas fa-file-export"></i>
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // إضافة مستمعات الأحداث لأزرار الإجراءات
    addActionButtonListeners();
}

/**
 * إضافة مستمعات الأحداث لأزرار الإجراءات
 */
function addActionButtonListeners() {
    // أزرار عرض التفاصيل
    document.querySelectorAll('.view-payment').forEach(button => {
        button.addEventListener('click', function() {
            const paymentId = this.getAttribute('data-id');
            viewPaymentDetails(paymentId);
        });
    });
    
    // أزرار طباعة الإيصال
    document.querySelectorAll('.print-receipt').forEach(button => {
        button.addEventListener('click', function() {
            const paymentId = this.getAttribute('data-id');
            printPaymentReceipt(paymentId);
        });
    });
    
    // أزرار تصدير بيانات المدفوعة
    document.querySelectorAll('.export-payment').forEach(button => {
        button.addEventListener('click', function() {
            const paymentId = this.getAttribute('data-id');
            exportPaymentData(paymentId);
        });
    });
}

/**
 * تهيئة البحث والتصفية
 */
function initSearchAndFilters() {
    // مربع البحث
    const searchInput = document.getElementById('payment-search');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterPayments();
        });
    }
    
    // تصفية حسب طريقة الدفع
    const methodFilter = document.getElementById('payment-method-filter');
    if (methodFilter) {
        methodFilter.addEventListener('change', function() {
            filterPayments();
        });
    }
    
    // تصفية حسب التاريخ
    const dateFromFilter = document.getElementById('payment-date-from');
    const dateToFilter = document.getElementById('payment-date-to');
    
    if (dateFromFilter && dateToFilter) {
        dateFromFilter.addEventListener('change', function() {
            filterPayments();
        });
        
        dateToFilter.addEventListener('change', function() {
            filterPayments();
        });
    }
}

/**
 * تصفية المدفوعات حسب معايير البحث
 */
function filterPayments() {
    const searchTerm = document.getElementById('payment-search')?.value.toLowerCase() || '';
    const methodFilter = document.getElementById('payment-method-filter')?.value || '';
    const dateFromStr = document.getElementById('payment-date-from')?.value || '';
    const dateToStr = document.getElementById('payment-date-to')?.value || '';
    
    // تحويل التاريخ إلى كائن Date
    const dateFrom = dateFromStr ? new Date(dateFromStr) : null;
    const dateTo = dateToStr ? new Date(dateToStr + 'T23:59:59') : null;
    
    // تطبيق التصفية
    filteredPayments = allPayments.filter(payment => {
        // البحث في رقم الإيصال أو اسم الطالب أو البرنامج
        const matchesSearch = searchTerm === '' || 
            payment.id.toLowerCase().includes(searchTerm) ||
            payment.receiptNumber?.toLowerCase().includes(searchTerm) ||
            payment.studentName?.toLowerCase().includes(searchTerm) ||
            payment.studentId?.toLowerCase().includes(searchTerm) ||
            payment.program?.toLowerCase().includes(searchTerm);
        
        // تصفية طريقة الدفع
        const matchesMethod = methodFilter === '' || payment.method === methodFilter;
        
        // تصفية التاريخ
        const paymentDate = new Date(payment.timestamp);
        const matchesDateFrom = !dateFrom || paymentDate >= dateFrom;
        const matchesDateTo = !dateTo || paymentDate <= dateTo;
        
        return matchesSearch && matchesMethod && matchesDateFrom && matchesDateTo;
    });
    
    // تحديث الجدول
    renderPaymentsTable(filteredPayments);
    
    // تحديث إحصائيات التصفية
    updateFilterStats();
}

/**
 * تحديث إحصائيات التصفية
 */
function updateFilterStats() {
    const statsContainer = document.getElementById('filter-stats');
    if (!statsContainer) return;
    
    // حساب المبلغ الإجمالي
    const totalAmount = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
    
    // تنسيق المبلغ
    const formattedAmount = new Intl.NumberFormat('ar-SA', {
        style: 'currency',
        currency: 'SAR'
    }).format(totalAmount);
    
    statsContainer.innerHTML = `
        <div class="alert alert-info">
            <strong>الإحصائيات:</strong> تم العثور على ${filteredPayments.length} سجل من أصل ${allPayments.length} | 
            إجمالي المبالغ: ${formattedAmount}
        </div>
    `;
}

/**
 * تهيئة أزرار تصدير البيانات
 */
function initExportButtons() {
    // زر تصدير جميع المدفوعات
    const exportAllBtn = document.getElementById('export-all-payments');
    if (exportAllBtn) {
        exportAllBtn.addEventListener('click', function() {
            exportPaymentsData(filteredPayments);
        });
    }
    
    // زر طباعة التقرير
    const printReportBtn = document.getElementById('print-payments-report');
    if (printReportBtn) {
        printReportBtn.addEventListener('click', function() {
            printPaymentsReport();
        });
    }
}

/**
 * عرض تفاصيل المدفوعة
 */
function viewPaymentDetails(paymentId) {
    // البحث عن المدفوعة
    const payment = allPayments.find(p => p.id === paymentId);
    if (!payment) {
        showErrorMessage('لم يتم العثور على بيانات المدفوعة');
        return;
    }
    
    // تنسيق البيانات
    const paymentDate = new Date(payment.timestamp);
    const formattedDate = paymentDate.toLocaleDateString('ar-SA') + ' ' + paymentDate.toLocaleTimeString('ar-SA');
    const formattedAmount = new Intl.NumberFormat('ar-SA', {
        style: 'currency',
        currency: 'SAR'
    }).format(payment.amount);
    
    // إنشاء محتوى النافذة المنبثقة
    const modalContent = `
        <div class="modal-header">
            <h5 class="modal-title">تفاصيل المدفوعة #${payment.id}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="إغلاق"></button>
        </div>
        <div class="modal-body">
            <div class="row mb-3">
                <div class="col-md-6">
                    <p><strong>رقم المدفوعة:</strong> ${payment.id}</p>
                    <p><strong>رقم الإيصال:</strong> ${payment.receiptNumber || '-'}</p>
                    <p><strong>تاريخ الدفع:</strong> ${formattedDate}</p>
                    <p><strong>المبلغ:</strong> ${formattedAmount}</p>
                </div>
                <div class="col-md-6">
                    <p><strong>طريقة الدفع:</strong> ${payment.method}</p>
                    <p><strong>حالة الدفع:</strong> ${payment.status === 'completed' ? 'مكتمل' : payment.status}</p>
                    <p><strong>آخر 4 أرقام من البطاقة:</strong> ${payment.cardLast4 || '-'}</p>
                </div>
            </div>
            <hr>
            <div class="row">
                <div class="col-md-6">
                    <p><strong>معرف الطالب:</strong> ${payment.studentId}</p>
                    <p><strong>اسم الطالب:</strong> ${payment.studentName || '-'}</p>
                </div>
                <div class="col-md-6">
                    <p><strong>رقم الطلب:</strong> ${payment.applicationId}</p>
                    <p><strong>البرنامج:</strong> ${payment.program || '-'}</p>
                </div>
            </div>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-primary print-receipt-modal" data-id="${payment.id}">
                <i class="fas fa-print me-1"></i> طباعة الإيصال
            </button>
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إغلاق</button>
        </div>
    `;
    
    // عرض النافذة المنبثقة
    const modalElement = document.getElementById('payment-details-modal');
    if (modalElement) {
        const modalContentElement = modalElement.querySelector('.modal-content');
        modalContentElement.innerHTML = modalContent;
        
        // إضافة مستمع حدث لزر الطباعة
        modalElement.querySelector('.print-receipt-modal').addEventListener('click', function() {
            const paymentId = this.getAttribute('data-id');
            printPaymentReceipt(paymentId);
        });
        
        // عرض النافذة المنبثقة
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    }
}

/**
 * طباعة إيصال المدفوعة
 */
function printPaymentReceipt(paymentId) {
    // البحث عن المدفوعة
    const payment = allPayments.find(p => p.id === paymentId);
    if (!payment) {
        showErrorMessage('لم يتم العثور على بيانات المدفوعة');
        return;
    }
    
    // تنسيق البيانات
    const paymentDate = new Date(payment.timestamp);
    const formattedDate = paymentDate.toLocaleDateString('ar-SA');
    const formattedTime = paymentDate.toLocaleTimeString('ar-SA');
    const formattedAmount = new Intl.NumberFormat('ar-SA', {
        style: 'currency',
        currency: 'SAR'
    }).format(payment.amount);
    
    // إنشاء محتوى الإيصال
    const receiptContent = `
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>إيصال دفع #${payment.receiptNumber}</title>
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    margin: 0;
                    padding: 20px;
                    direction: rtl;
                }
                .receipt {
                    max-width: 800px;
                    margin: 0 auto;
                    border: 1px solid #ddd;
                    padding: 20px;
                }
                .header {
                    text-align: center;
                    margin-bottom: 20px;
                    border-bottom: 2px solid #08294E;
                    padding-bottom: 10px;
                }
                .logo {
                    max-width: 150px;
                    margin-bottom: 10px;
                }
                .receipt-title {
                    font-size: 24px;
                    margin: 10px 0;
                    color: #08294E;
                }
                .receipt-subtitle {
                    font-size: 16px;
                    color: #666;
                    margin: 5px 0;
                }
                .receipt-number {
                    font-size: 18px;
                    margin: 10px 0;
                }
                .details {
                    margin: 20px 0;
                }
                .row {
                    display: flex;
                    margin-bottom: 10px;
                }
                .label {
                    font-weight: bold;
                    width: 150px;
                }
                .value {
                    flex: 1;
                }
                .amount-section {
                    background-color: #f9f9f9;
                    padding: 15px;
                    margin: 20px 0;
                    border-radius: 5px;
                    text-align: center;
                }
                .amount {
                    font-size: 24px;
                    color: #08294E;
                    font-weight: bold;
                }
                .footer {
                    margin-top: 30px;
                    text-align: center;
                    font-size: 14px;
                    color: #666;
                    border-top: 1px solid #ddd;
                    padding-top: 10px;
                }
                .qr-code {
                    text-align: center;
                    margin: 20px 0;
                }
                .qr-code img {
                    width: 100px;
                    height: 100px;
                }
                .barcode {
                    text-align: center;
                    margin: 20px 0;
                }
                @media print {
                    body {
                        padding: 0;
                    }
                    .receipt {
                        border: none;
                    }
                    .print-button {
                        display: none;
                    }
                }
            </style>
        </head>
        <body>
            <div class="receipt">
                <div class="header">
                    <img src="/assets/kau-logo.svg" alt="شعار جامعة الملك عبدالعزيز" class="logo">
                    <h1 class="receipt-title">إيصال دفع رسوم دراسية</h1>
                    <p class="receipt-subtitle">جامعة الملك عبدالعزيز - التعليم عن بعد</p>
                    <p class="receipt-number">رقم الإيصال: ${payment.receiptNumber}</p>
                </div>
                
                <div class="details">
                    <div class="row">
                        <div class="label">رقم المعاملة:</div>
                        <div class="value">${payment.id}</div>
                    </div>
                    <div class="row">
                        <div class="label">تاريخ الدفع:</div>
                        <div class="value">${formattedDate}</div>
                    </div>
                    <div class="row">
                        <div class="label">وقت الدفع:</div>
                        <div class="value">${formattedTime}</div>
                    </div>
                    <div class="row">
                        <div class="label">طريقة الدفع:</div>
                        <div class="value">${payment.method}</div>
                    </div>
                    <div class="row">
                        <div class="label">آخر 4 أرقام من البطاقة:</div>
                        <div class="value">${payment.cardLast4 || '-'}</div>
                    </div>
                </div>
                
                <div class="details">
                    <div class="row">
                        <div class="label">اسم الطالب:</div>
                        <div class="value">${payment.studentName || payment.studentId}</div>
                    </div>
                    <div class="row">
                        <div class="label">رقم الطلب:</div>
                        <div class="value">${payment.applicationId}</div>
                    </div>
                    <div class="row">
                        <div class="label">البرنامج:</div>
                        <div class="value">${payment.program || '-'}</div>
                    </div>
                </div>
                
                <div class="amount-section">
                    <div>المبلغ المدفوع</div>
                    <div class="amount">${formattedAmount}</div>
                </div>
                
                <div class="qr-code">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${payment.id}" alt="رمز QR">
                </div>
                
                <div class="footer">
                    <p>هذا الإيصال دليل على سداد الرسوم الدراسية</p>
                    <p>لأي استفسارات، يرجى التواصل مع الإدارة المالية على الرقم: 966-12-xxxxxxx</p>
                    <p>© ${new Date().getFullYear()} جامعة الملك عبدالعزيز - جميع الحقوق محفوظة</p>
                </div>
                
                <div class="print-button" style="text-align: center; margin-top: 20px;">
                    <button onclick="window.print();" style="padding: 10px 20px; background-color: #08294E; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        طباعة الإيصال
                    </button>
                </div>
            </div>
        </body>
        </html>
    `;
    
    // فتح نافذة جديدة للطباعة
    const printWindow = window.open('', '_blank');
    printWindow.document.write(receiptContent);
    printWindow.document.close();
    
    // طباعة المحتوى بعد تحميل الصفحة
    printWindow.onload = function() {
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
        }, 250);
    };
}

/**
 * تصدير بيانات المدفوعة
 */
function exportPaymentData(paymentId) {
    // البحث عن المدفوعة
    const payment = allPayments.find(p => p.id === paymentId);
    if (!payment) {
        showErrorMessage('لم يتم العثور على بيانات المدفوعة');
        return;
    }
    
    // تحويل البيانات إلى تنسيق CSV
    const csvData = [
        ['رقم المدفوعة', 'رقم الإيصال', 'تاريخ الدفع', 'المبلغ', 'طريقة الدفع', 'معرف الطالب', 'اسم الطالب', 'رقم الطلب', 'البرنامج'],
        [
            payment.id, 
            payment.receiptNumber || '', 
            new Date(payment.timestamp).toLocaleString('ar-SA'), 
            payment.amount, 
            payment.method, 
            payment.studentId, 
            payment.studentName || '', 
            payment.applicationId, 
            payment.program || ''
        ]
    ];
    
    // تحويل البيانات إلى نص CSV
    let csvContent = csvData.map(row => row.join(',')).join('\n');
    
    // إنشاء Blob للتنزيل
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // إنشاء رابط التنزيل
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `payment_${payment.id}.csv`);
    document.body.appendChild(link);
    
    // النقر على الرابط لبدء التنزيل
    link.click();
    
    // تنظيف
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * تصدير بيانات المدفوعات المصفاة
 */
function exportPaymentsData(payments) {
    if (payments.length === 0) {
        showErrorMessage('لا توجد بيانات للتصدير');
        return;
    }
    
    // تحضير الصفوف
    const headers = ['رقم المدفوعة', 'رقم الإيصال', 'تاريخ الدفع', 'المبلغ', 'طريقة الدفع', 'معرف الطالب', 'اسم الطالب', 'رقم الطلب', 'البرنامج'];
    
    const rows = payments.map(payment => [
        payment.id, 
        payment.receiptNumber || '', 
        new Date(payment.timestamp).toLocaleString('ar-SA'), 
        payment.amount, 
        payment.method, 
        payment.studentId, 
        payment.studentName || '', 
        payment.applicationId, 
        payment.program || ''
    ]);
    
    // إضافة الرأس إلى مصفوفة الصفوف
    const csvData = [headers, ...rows];
    
    // تحويل البيانات إلى نص CSV
    let csvContent = csvData.map(row => row.join(',')).join('\n');
    
    // إنشاء Blob للتنزيل
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // إنشاء رابط التنزيل
    const link = document.createElement('a');
    link.href = url;
    const date = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `payments_report_${date}.csv`);
    document.body.appendChild(link);
    
    // النقر على الرابط لبدء التنزيل
    link.click();
    
    // تنظيف
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * طباعة تقرير المدفوعات
 */
function printPaymentsReport() {
    if (filteredPayments.length === 0) {
        showErrorMessage('لا توجد بيانات للطباعة');
        return;
    }
    
    // تنسيق البيانات
    const totalAmount = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const formattedTotalAmount = new Intl.NumberFormat('ar-SA', {
        style: 'currency',
        currency: 'SAR'
    }).format(totalAmount);
    
    const today = new Date().toLocaleDateString('ar-SA');
    
    // إنشاء صفوف الجدول
    let tableRows = '';
    filteredPayments.forEach((payment, index) => {
        const paymentDate = new Date(payment.timestamp);
        const formattedDate = paymentDate.toLocaleDateString('ar-SA');
        const formattedAmount = new Intl.NumberFormat('ar-SA', {
            style: 'currency',
            currency: 'SAR'
        }).format(payment.amount);
        
        tableRows += `
            <tr>
                <td>${index + 1}</td>
                <td>${payment.id}</td>
                <td>${payment.receiptNumber || '-'}</td>
                <td>${payment.studentName || payment.studentId}</td>
                <td>${payment.program || '-'}</td>
                <td>${formattedAmount}</td>
                <td>${payment.method}</td>
                <td>${formattedDate}</td>
            </tr>
        `;
    });
    
    // إنشاء محتوى التقرير
    const reportContent = `
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>تقرير المدفوعات</title>
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    margin: 0;
                    padding: 20px;
                    direction: rtl;
                }
                .report {
                    max-width: 1200px;
                    margin: 0 auto;
                    border: 1px solid #ddd;
                    padding: 20px;
                }
                .header {
                    text-align: center;
                    margin-bottom: 20px;
                    border-bottom: 2px solid #08294E;
                    padding-bottom: 10px;
                }
                .logo {
                    max-width: 150px;
                    margin-bottom: 10px;
                }
                .report-title {
                    font-size: 24px;
                    margin: 10px 0;
                    color: #08294E;
                }
                .report-subtitle {
                    font-size: 16px;
                    color: #666;
                    margin: 5px 0;
                }
                .report-date {
                    font-size: 14px;
                    margin: 10px 0;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 20px 0;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: right;
                }
                th {
                    background-color: #f5f5f5;
                    font-weight: bold;
                }
                tr:nth-child(even) {
                    background-color: #f9f9f9;
                }
                .summary {
                    margin: 20px 0;
                    padding: 15px;
                    background-color: #f5f5f5;
                    border-radius: 5px;
                }
                .total-amount {
                    font-size: 18px;
                    font-weight: bold;
                    color: #08294E;
                }
                .footer {
                    margin-top: 30px;
                    text-align: center;
                    font-size: 14px;
                    color: #666;
                    border-top: 1px solid #ddd;
                    padding-top: 10px;
                }
                @media print {
                    body {
                        padding: 0;
                    }
                    .report {
                        border: none;
                    }
                    .print-button {
                        display: none;
                    }
                }
            </style>
        </head>
        <body>
            <div class="report">
                <div class="header">
                    <img src="/assets/kau-logo.svg" alt="شعار جامعة الملك عبدالعزيز" class="logo">
                    <h1 class="report-title">تقرير المدفوعات</h1>
                    <p class="report-subtitle">جامعة الملك عبدالعزيز - التعليم عن بعد</p>
                    <p class="report-date">تاريخ التقرير: ${today}</p>
                </div>
                
                <div class="summary">
                    <p>إجمالي عدد المدفوعات: <strong>${filteredPayments.length}</strong></p>
                    <p class="total-amount">إجمالي المبالغ: ${formattedTotalAmount}</p>
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>رقم المدفوعة</th>
                            <th>رقم الإيصال</th>
                            <th>اسم الطالب</th>
                            <th>البرنامج</th>
                            <th>المبلغ</th>
                            <th>طريقة الدفع</th>
                            <th>تاريخ الدفع</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
                
                <div class="footer">
                    <p>تم إنشاء هذا التقرير بواسطة النظام الإلكتروني لجامعة الملك عبدالعزيز</p>
                    <p>© ${new Date().getFullYear()} جامعة الملك عبدالعزيز - جميع الحقوق محفوظة</p>
                </div>
                
                <div class="print-button" style="text-align: center; margin-top: 20px;">
                    <button onclick="window.print();" style="padding: 10px 20px; background-color: #08294E; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        طباعة التقرير
                    </button>
                </div>
            </div>
        </body>
        </html>
    `;
    
    // فتح نافذة جديدة للطباعة
    const printWindow = window.open('', '_blank');
    printWindow.document.write(reportContent);
    printWindow.document.close();
    
    // طباعة المحتوى بعد تحميل الصفحة
    printWindow.onload = function() {
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
        }, 250);
    };
}

/**
 * إظهار حالة التحميل
 */
function showLoadingState(isLoading) {
    const loadingSpinner = document.getElementById('loading-spinner');
    const tableContainer = document.getElementById('payments-table-container');
    
    if (loadingSpinner && tableContainer) {
        if (isLoading) {
            loadingSpinner.classList.remove('d-none');
            tableContainer.classList.add('d-none');
        } else {
            loadingSpinner.classList.add('d-none');
            tableContainer.classList.remove('d-none');
        }
    }
}

/**
 * عرض رسالة خطأ
 */
function showErrorMessage(message) {
    const errorContainer = document.getElementById('error-container');
    if (errorContainer) {
        errorContainer.textContent = message;
        errorContainer.classList.remove('d-none');
        
        // إخفاء الرسالة بعد 5 ثوانٍ
        setTimeout(() => {
            errorContainer.classList.add('d-none');
        }, 5000);
    } else {
        // استخدام تنبيه عادي إذا لم يكن هناك حاوية خطأ
        alert(message);
    }
}

/**
 * التحقق من تسجيل دخول المشرف
 */
function checkAdminAuth() {
    // في النظام الحقيقي، هذا سيتحقق من جلسة المشرف في الخادم
    // للتجربة، نفترض أن المشرف مسجل الدخول
    return true;
}