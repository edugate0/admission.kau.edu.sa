// معالج رفع الملفات
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// مجلد تخزين المستندات المرفوعة
const UPLOADS_DIR = path.join(__dirname, '..', 'data', 'uploads');

// التأكد من وجود مجلد التخزين
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// إعداد مخزن multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // إنشاء مجلد للطالب إذا لم يكن موجوداً
        const studentId = req.params.studentId || req.body.studentId;
        const studentDir = path.join(UPLOADS_DIR, studentId);
        
        if (!fs.existsSync(studentDir)) {
            fs.mkdirSync(studentDir, { recursive: true });
        }
        
        cb(null, studentDir);
    },
    filename: function (req, file, cb) {
        // تخزين الملف باسم نوع المستند وطابع زمني
        const documentType = req.body.documentType || 'document';
        const timestamp = Date.now();
        const extension = path.extname(file.originalname);
        const filename = `${documentType}-${timestamp}${extension}`;
        
        cb(null, filename);
    }
});

// فلتر الملفات المسموح بها
const fileFilter = (req, file, cb) => {
    // التحقق من نوع الملف
    const allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'];
    const extension = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(extension)) {
        // قبول الملف
        cb(null, true);
    } else {
        // رفض الملف
        cb(new Error('نوع الملف غير مسموح به. الأنواع المسموح بها: PDF, JPG, PNG, DOC, DOCX'));
    }
};

// إعداد middleware الرفع
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // الحد الأقصى 5 ميجابايت
    }
});

/**
 * الحصول على قائمة الملفات المرفوعة لطالب معين
 * @param {string} studentId - معرف الطالب
 * @returns {Array} قائمة الملفات المرفوعة
 */
function getStudentFiles(studentId) {
    const studentDir = path.join(UPLOADS_DIR, studentId);
    
    if (!fs.existsSync(studentDir)) {
        return [];
    }
    
    const files = fs.readdirSync(studentDir);
    
    return files.map(filename => {
        const filePath = path.join(studentDir, filename);
        const stats = fs.statSync(filePath);
        
        // استخراج نوع المستند من اسم الملف
        const documentType = filename.split('-')[0];
        
        return {
            filename,
            documentType,
            path: `/api/uploads/${studentId}/${filename}`,
            size: stats.size,
            uploadDate: stats.mtime
        };
    });
}

/**
 * حذف ملف مرفوع
 * @param {string} studentId - معرف الطالب
 * @param {string} filename - اسم الملف المراد حذفه
 * @returns {boolean} نجاح العملية
 */
function deleteFile(studentId, filename) {
    const filePath = path.join(UPLOADS_DIR, studentId, filename);
    
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
    }
    
    return false;
}

// تصدير الدوال
module.exports = {
    upload,
    getStudentFiles,
    deleteFile,
    UPLOADS_DIR
};