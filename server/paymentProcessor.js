// Saudi Credit Card Payment Processor
const { paymentStorage, applicationStorage } = require('./fileStorage');

// Validate credit card information (basic validation for demo purposes)
function validateCreditCard(cardInfo) {
    const { cardNumber, cardHolder, expiryDate, cvv } = cardInfo;
    
    // Validate card number (should be 16 digits)
    if (!/^\d{16}$/.test(cardNumber)) {
        return { valid: false, message: 'رقم البطاقة يجب أن يتكون من 16 رقماً' };
    }
    
    // Validate card holder name (should not be empty)
    if (!cardHolder || cardHolder.trim().length < 3) {
        return { valid: false, message: 'الرجاء إدخال اسم حامل البطاقة بشكل صحيح' };
    }
    
    // Validate expiry date (MM/YY format)
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryDate)) {
        return { valid: false, message: 'الرجاء إدخال تاريخ انتهاء البطاقة بصيغة MM/YY' };
    }
    
    // Validate CVV (3 digits)
    if (!/^\d{3}$/.test(cvv)) {
        return { valid: false, message: 'الرجاء إدخال رمز CVV بشكل صحيح (3 أرقام)' };
    }
    
    // Validate expiry date is not in past
    const [expMonth, expYear] = expiryDate.split('/');
    const expiry = new Date(2000 + parseInt(expYear), parseInt(expMonth) - 1);
    const now = new Date();
    
    if (expiry < now) {
        return { valid: false, message: 'البطاقة منتهية الصلاحية' };
    }
    
    return { valid: true };
}

// Process payment
async function processPayment(paymentInfo) {
    const { 
        cardInfo, 
        amount, 
        studentId, 
        applicationId, 
        description 
    } = paymentInfo;
    
    // Validate card information
    const validation = validateCreditCard(cardInfo);
    if (!validation.valid) {
        return {
            success: false,
            message: validation.message
        };
    }
    
    // For demo purposes, we'll simulate payment processing
    // In a real system, this would connect to a payment gateway
    
    // Generate payment ID
    const paymentId = `PAY-${Date.now()}`;
    
    // Create payment record (excluding sensitive card details)
    const payment = {
        id: paymentId,
        amount,
        studentId,
        applicationId,
        description,
        timestamp: new Date().toISOString(),
        status: 'completed',
        method: 'بطاقة ائتمانية',
        // Store only last 4 digits of card number for reference
        cardLast4: cardInfo.cardNumber.slice(-4),
        receiptNumber: Math.floor(100000 + Math.random() * 900000).toString()
    };
    
    // Save payment record
    paymentStorage.savePayment(payment);
    
    // Update application status if applicable
    if (applicationId) {
        const application = applicationStorage.getApplication(applicationId);
        if (application) {
            application.status = 'paid';
            application.paymentDate = payment.timestamp;
            application.paymentId = paymentId;
            applicationStorage.saveApplication(application);
        }
    }
    
    return {
        success: true,
        message: 'تمت عملية الدفع بنجاح',
        paymentId,
        receiptNumber: payment.receiptNumber,
        timestamp: payment.timestamp
    };
}

// Get payment by ID
function getPayment(paymentId) {
    return paymentStorage.getPayment(paymentId);
}

// Get all payments for a student
function getStudentPayments(studentId) {
    return paymentStorage.getPaymentsByStudent(studentId);
}

// Get all payments for an application
function getApplicationPayments(applicationId) {
    return paymentStorage.getPaymentsByApplication(applicationId);
}

// Export API
module.exports = {
    processPayment,
    getPayment,
    getStudentPayments,
    getApplicationPayments
};