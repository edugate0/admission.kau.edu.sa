/**
 * صفحة البرامج المتاحة - متوافقة مع التخزين الملفي
 */

// متغيرات عامة
let programs = [];
let categories = [];
let selectedCategory = null;

// عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // تحميل البرامج والفئات
    loadProgramsData();
    
    // تهيئة أحداث النقر على الفئات
    setupCategoryFilters();
    
    // تهيئة البحث
    setupSearch();
});

/**
 * تحميل بيانات البرامج والفئات
 */
async function loadProgramsData() {
    try {
        // إظهار حالة التحميل
        showLoading(true);
        
        // في النظام الحقيقي، سيتم جلب البيانات من الخادم
        // const response = await fetch('/api/programs');
        // const data = await response.json();
        // programs = data.programs || [];
        // categories = data.categories || [];
        
        // للتجربة، إنشاء بيانات افتراضية
        await generateSampleData();
        
        // تحديث واجهة المستخدم
        renderCategories();
        renderPrograms();
        
    } catch (error) {
        console.error('خطأ في تحميل البرامج:', error);
        showNotification('حدث خطأ أثناء تحميل البرامج', 'error');
    } finally {
        // إخفاء حالة التحميل
        showLoading(false);
    }
}

/**
 * إنشاء بيانات افتراضية للبرامج والفئات
 */
async function generateSampleData() {
    // تأخير اصطناعي لمحاكاة تحميل البيانات
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // بيانات الفئات
    categories = [
        { id: 'business', name: 'كلية الاقتصاد والإدارة', icon: 'fa-chart-line' },
        { id: 'it', name: 'كلية الحاسبات وتقنية المعلومات', icon: 'fa-laptop-code' },
        { id: 'education', name: 'كلية التربية', icon: 'fa-user-graduate' },
        { id: 'languages', name: 'كلية اللغات والترجمة', icon: 'fa-language' }
    ];
    
    // بيانات البرامج
    programs = [
        {
            id: 'BUS-001',
            name: 'دبلوم إدارة الأعمال',
            category: 'business',
            duration: '2 سنة',
            credits: 60,
            fee: 12500,
            description: 'يهدف البرنامج إلى تزويد الطلاب بالمهارات الأساسية في مجال إدارة الأعمال، ويشمل مواضيع مثل المحاسبة، والتسويق، وإدارة الموارد البشرية، والاقتصاد.',
            requirements: ['شهادة الثانوية العامة بمعدل لا يقل عن 70%', 'اجتياز المقابلة الشخصية'],
            careers: ['مساعد إداري', 'مسؤول موارد بشرية', 'مسؤول تسويق'],
            featured: true
        },
        {
            id: 'BUS-002',
            name: 'دبلوم المحاسبة',
            category: 'business',
            duration: '2 سنة',
            credits: 60,
            fee: 12500,
            description: 'يركز هذا البرنامج على تطوير المهارات المحاسبية الأساسية، ويشمل مواضيع مثل المحاسبة المالية، ومحاسبة التكاليف، والضرائب، والتدقيق.',
            requirements: ['شهادة الثانوية العامة بمعدل لا يقل عن 75%', 'اجتياز اختبار القبول'],
            careers: ['مساعد محاسب', 'مدقق حسابات مساعد', 'أمين صندوق'],
            featured: false
        },
        {
            id: 'BUS-003',
            name: 'دبلوم التسويق',
            category: 'business',
            duration: '2 سنة',
            credits: 60,
            fee: 12500,
            description: 'يهدف البرنامج إلى تطوير مهارات الطلاب في مجال التسويق، ويشمل مواضيع مثل سلوك المستهلك، وإدارة المنتجات، والإعلان، والتسويق الرقمي.',
            requirements: ['شهادة الثانوية العامة بمعدل لا يقل عن 70%', 'اجتياز المقابلة الشخصية'],
            careers: ['مساعد تسويق', 'مسؤول وسائل التواصل الاجتماعي', 'منسق مبيعات'],
            featured: false
        },
        {
            id: 'IT-001',
            name: 'دبلوم علوم الحاسب',
            category: 'it',
            duration: '2 سنة',
            credits: 60,
            fee: 13500,
            description: 'يهدف البرنامج إلى تزويد الطلاب بالمعرفة الأساسية في مجال علوم الحاسب، ويشمل مواضيع مثل البرمجة، وهياكل البيانات، وقواعد البيانات، وشبكات الحاسب.',
            requirements: ['شهادة الثانوية العامة بمعدل لا يقل عن 75%', 'اجتياز اختبار القبول'],
            careers: ['مبرمج مساعد', 'فني دعم تقني', 'مطور مواقع ويب مبتدئ'],
            featured: true
        },
        {
            id: 'IT-002',
            name: 'دبلوم تقنية المعلومات',
            category: 'it',
            duration: '2 سنة',
            credits: 60,
            fee: 13500,
            description: 'يركز هذا البرنامج على الجوانب العملية لتقنية المعلومات، ويشمل مواضيع مثل إدارة أنظمة التشغيل، والشبكات، وأمن المعلومات، وتطوير البرمجيات.',
            requirements: ['شهادة الثانوية العامة بمعدل لا يقل عن 70%', 'اجتياز المقابلة الشخصية'],
            careers: ['فني دعم تقني', 'فني شبكات', 'مدير نظم معلومات مساعد'],
            featured: false
        },
        {
            id: 'IT-003',
            name: 'دبلوم أمن المعلومات',
            category: 'it',
            duration: '2 سنة',
            credits: 60,
            fee: 14500,
            description: 'يهدف البرنامج إلى تطوير مهارات الطلاب في مجال أمن المعلومات، ويشمل مواضيع مثل تشفير البيانات، وحماية الشبكات، والتحقيق الرقمي، وتقييم المخاطر.',
            requirements: ['شهادة الثانوية العامة بمعدل لا يقل عن 80%', 'اجتياز اختبار القبول'],
            careers: ['فني أمن معلومات مساعد', 'محلل أمن معلومات مبتدئ', 'فني استجابة للحوادث الأمنية'],
            featured: true
        },
        {
            id: 'EDU-001',
            name: 'دبلوم التربية العام',
            category: 'education',
            duration: '1 سنة',
            credits: 30,
            fee: 10000,
            description: 'يهدف البرنامج إلى تأهيل الطلاب للعمل في المجال التربوي، ويشمل مواضيع مثل أصول التربية، وعلم النفس التربوي، وطرق التدريس، والتقويم التربوي.',
            requirements: ['الحصول على شهادة البكالوريوس في أي تخصص'],
            careers: ['معلم', 'مرشد طلابي', 'منسق تعليمي'],
            featured: false
        },
        {
            id: 'LANG-001',
            name: 'دبلوم الترجمة',
            category: 'languages',
            duration: '2 سنة',
            credits: 60,
            fee: 12000,
            description: 'يهدف البرنامج إلى تطوير مهارات الطلاب في مجال الترجمة، ويشمل مواضيع مثل نظريات الترجمة، والترجمة التحريرية، والترجمة الفورية، والمصطلحات المتخصصة.',
            requirements: ['شهادة الثانوية العامة بمعدل لا يقل عن 75%', 'اجتياز اختبار اللغة'],
            careers: ['مترجم مساعد', 'مصحح لغوي', 'منسق لغوي'],
            featured: false
        }
    ];
}

/**
 * تهيئة أحداث النقر على الفئات
 */
function setupCategoryFilters() {
    // إضافة مستمع حدث للنقر على رابط "جميع البرامج"
    document.getElementById('all-categories')?.addEventListener('click', function(e) {
        e.preventDefault();
        selectedCategory = null;
        updateActiveCategory();
        renderPrograms();
    });
}

/**
 * تهيئة البحث
 */
function setupSearch() {
    const searchInput = document.getElementById('program-search');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            renderPrograms();
        });
    }
}

/**
 * عرض فئات البرامج
 */
function renderCategories() {
    const categoriesContainer = document.getElementById('categories-list');
    if (!categoriesContainer) return;
    
    // إفراغ قائمة الفئات
    categoriesContainer.innerHTML = '';
    
    // إضافة الفئات إلى القائمة
    categories.forEach(category => {
        const listItem = document.createElement('li');
        listItem.className = 'nav-item';
        
        listItem.innerHTML = `
            <a href="#" class="nav-link category-link d-flex align-items-center" data-category="${category.id}">
                <i class="fas ${category.icon} me-2"></i>
                <span>${category.name}</span>
            </a>
        `;
        
        categoriesContainer.appendChild(listItem);
    });
    
    // إضافة مستمعات الأحداث للفئات
    document.querySelectorAll('.category-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            selectedCategory = this.getAttribute('data-category');
            updateActiveCategory();
            renderPrograms();
        });
    });
    
    // تحديث الفئة النشطة
    updateActiveCategory();
}

/**
 * تحديث الفئة النشطة
 */
function updateActiveCategory() {
    // إزالة الفئة النشطة من جميع الروابط
    document.querySelectorAll('.category-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // إضافة الفئة النشطة للرابط المختار
    if (selectedCategory) {
        document.querySelector(`.category-link[data-category="${selectedCategory}"]`)?.classList.add('active');
    } else {
        document.getElementById('all-categories')?.classList.add('active');
    }
}

/**
 * عرض البرامج
 */
function renderPrograms() {
    const programsContainer = document.getElementById('programs-container');
    if (!programsContainer) return;
    
    // الحصول على نص البحث
    const searchText = document.getElementById('program-search')?.value.toLowerCase() || '';
    
    // تصفية البرامج حسب الفئة والبحث
    const filteredPrograms = programs.filter(program => {
        // تصفية حسب الفئة
        const categoryMatch = !selectedCategory || program.category === selectedCategory;
        
        // تصفية حسب البحث
        const searchMatch = searchText === '' || 
            program.name.toLowerCase().includes(searchText) || 
            program.description.toLowerCase().includes(searchText);
        
        return categoryMatch && searchMatch;
    });
    
    // إفراغ حاوية البرامج
    programsContainer.innerHTML = '';
    
    // إذا لم توجد برامج مطابقة
    if (filteredPrograms.length === 0) {
        programsContainer.innerHTML = `
            <div class="col-12">
                <div class="alert alert-info">
                    <i class="fas fa-info-circle me-2"></i>
                    لم يتم العثور على برامج مطابقة لمعايير البحث.
                </div>
            </div>
        `;
        return;
    }
    
    // إضافة البرامج إلى الحاوية
    filteredPrograms.forEach(program => {
        // تنسيق الرسوم الدراسية
        const formattedFee = new Intl.NumberFormat('ar-SA').format(program.fee);
        
        // إضافة شارة للبرامج المميزة
        const featuredBadge = program.featured ? 
            '<span class="badge bg-danger position-absolute top-0 start-0 m-2">مميز</span>' : '';
        
        // إنشاء بطاقة البرنامج
        const programCard = document.createElement('div');
        programCard.className = 'col-md-6 col-lg-4 mb-4';
        
        programCard.innerHTML = `
            <div class="card h-100 position-relative">
                ${featuredBadge}
                <div class="card-body">
                    <h5 class="card-title">${program.name}</h5>
                    <div class="category-badge mb-2">
                        <span class="badge bg-light text-dark">
                            <i class="fas ${getCategoryIcon(program.category)} me-1"></i>
                            ${getCategoryName(program.category)}
                        </span>
                    </div>
                    <div class="card-text mb-3">
                        <p>${program.description}</p>
                    </div>
                    <div class="program-details mb-3">
                        <div class="row">
                            <div class="col-6">
                                <small class="text-muted">مدة البرنامج</small>
                                <p><i class="fas fa-clock me-1"></i> ${program.duration}</p>
                            </div>
                            <div class="col-6">
                                <small class="text-muted">الساعات المعتمدة</small>
                                <p><i class="fas fa-graduation-cap me-1"></i> ${program.credits} ساعة</p>
                            </div>
                        </div>
                        <div class="mt-2">
                            <small class="text-muted">الرسوم الدراسية</small>
                            <p class="text-primary fw-bold"><i class="fas fa-money-bill-wave me-1"></i> ${formattedFee} ريال</p>
                        </div>
                    </div>
                </div>
                <div class="card-footer bg-white border-top-0">
                    <button class="btn btn-primary w-100 view-program-btn" data-id="${program.id}">
                        عرض التفاصيل
                    </button>
                </div>
            </div>
        `;
        
        programsContainer.appendChild(programCard);
    });
    
    // إضافة مستمعات الأحداث لأزرار عرض التفاصيل
    document.querySelectorAll('.view-program-btn').forEach(button => {
        button.addEventListener('click', function() {
            const programId = this.getAttribute('data-id');
            
            // العثور على البرنامج
            const program = programs.find(prog => prog.id === programId);
            
            if (program) {
                // عرض تفاصيل البرنامج
                showProgramDetails(program);
            }
        });
    });
}

/**
 * الحصول على اسم الفئة من معرفها
 */
function getCategoryName(categoryId) {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : '';
}

/**
 * الحصول على أيقونة الفئة من معرفها
 */
function getCategoryIcon(categoryId) {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.icon : 'fa-folder';
}

/**
 * عرض تفاصيل البرنامج
 */
function showProgramDetails(program) {
    // تنسيق الرسوم الدراسية
    const formattedFee = new Intl.NumberFormat('ar-SA').format(program.fee);
    
    // تحضير قائمة المتطلبات
    let requirementsList = '';
    if (program.requirements && program.requirements.length > 0) {
        requirementsList = '<ul class="mb-0">' + 
            program.requirements.map(req => `<li>${req}</li>`).join('') + 
            '</ul>';
    } else {
        requirementsList = '<p class="mb-0">لا توجد متطلبات محددة</p>';
    }
    
    // تحضير قائمة المسارات الوظيفية
    let careersList = '';
    if (program.careers && program.careers.length > 0) {
        careersList = '<ul class="mb-0">' + 
            program.careers.map(career => `<li>${career}</li>`).join('') + 
            '</ul>';
    } else {
        careersList = '<p class="mb-0">لا توجد مسارات وظيفية محددة</p>';
    }
    
    // تحديث محتوى النافذة المنبثقة
    const modal = document.getElementById('program-details-modal');
    
    // تحديث العنوان
    modal.querySelector('.modal-title').textContent = program.name;
    
    // تحديث المحتوى
    const modalBody = modal.querySelector('.modal-body');
    modalBody.innerHTML = `
        <div class="program-header mb-4">
            <div class="category-badge mb-2">
                <span class="badge bg-light text-dark">
                    <i class="fas ${getCategoryIcon(program.category)} me-1"></i>
                    ${getCategoryName(program.category)}
                </span>
                ${program.featured ? '<span class="badge bg-danger ms-2">برنامج مميز</span>' : ''}
            </div>
            <p>${program.description}</p>
        </div>
        
        <div class="row mb-4">
            <div class="col-md-4">
                <div class="card h-100">
                    <div class="card-body text-center">
                        <i class="fas fa-clock fa-2x text-primary mb-2"></i>
                        <h6>مدة البرنامج</h6>
                        <p class="mb-0">${program.duration}</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card h-100">
                    <div class="card-body text-center">
                        <i class="fas fa-graduation-cap fa-2x text-primary mb-2"></i>
                        <h6>الساعات المعتمدة</h6>
                        <p class="mb-0">${program.credits} ساعة</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card h-100">
                    <div class="card-body text-center">
                        <i class="fas fa-money-bill-wave fa-2x text-primary mb-2"></i>
                        <h6>الرسوم الدراسية</h6>
                        <p class="mb-0 text-primary fw-bold">${formattedFee} ريال</p>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="requirements mb-4">
            <h5><i class="fas fa-clipboard-list me-2"></i> متطلبات القبول</h5>
            <div class="card">
                <div class="card-body">
                    ${requirementsList}
                </div>
            </div>
        </div>
        
        <div class="careers mb-4">
            <h5><i class="fas fa-briefcase me-2"></i> المسارات الوظيفية</h5>
            <div class="card">
                <div class="card-body">
                    ${careersList}
                </div>
            </div>
        </div>
    `;
    
    // تحديث الأزرار
    const modalFooter = modal.querySelector('.modal-footer');
    modalFooter.innerHTML = `
        <a href="apply.html?program=${program.id}" class="btn btn-primary">
            <i class="fas fa-file-alt me-1"></i> تقديم طلب
        </a>
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إغلاق</button>
    `;
    
    // إظهار النافذة المنبثقة
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
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