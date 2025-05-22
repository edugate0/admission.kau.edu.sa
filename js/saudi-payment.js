// Saudi Credit Card Payment Handling
let currentApplicationId = null;
let currentStudentId = null;

// Initialize payment form
function initPaymentForm() {
    // Set up credit card input formatting
    const cardNumberInput = document.getElementById('card-number');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function (e) {
            // Format card number with spaces every 4 digits
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 16) {
                value = value.substring(0, 16);
            }
            // Format with spaces
            value = value.replace(/(.{4})/g, '$1 ').trim();
            e.target.value = value;
        });
    }

    // Set up expiry date formatting
    const expiryDateInput = document.getElementById('expiry-date');
    if (expiryDateInput) {
        expiryDateInput.addEventListener('input', function (e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 4) {
                value = value.substring(0, 4);
            }
            if (value.length > 2) {
                value = value.substring(0, 2) + '/' + value.substring(2);
            }
            e.target.value = value;
        });
    }

    // Set up CVV input restrictions
    const cvvInput = document.getElementById('cvv');
    if (cvvInput) {
        cvvInput.addEventListener('input', function (e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 3) {
                value = value.substring(0, 3);
            }
            e.target.value = value;
        });
    }

    // Set up payment form submission
    const paymentForm = document.getElementById('saudi-payment-form');
    if (paymentForm) {
        paymentForm.addEventListener('submit', processPayment);
    }
}

// Show credit card form
function showCreditCardForm(applicationId, studentId) {
    // Store application and student IDs for payment processing
    currentApplicationId = applicationId;
    currentStudentId = studentId;
    
    // Show the credit card payment container
    const creditCardContainer = document.getElementById('credit-card-container');
    if (creditCardContainer) {
        creditCardContainer.style.display = 'block';
    }
}

// Process payment
async function processPayment(e) {
    if (e) e.preventDefault();

    // Show processing state
    setPaymentProcessing(true);
    
    try {
        // Get form values
        const cardNumber = document.getElementById('card-number').value.replace(/\s/g, '');
        const cardHolder = document.getElementById('card-holder').value;
        const expiryDate = document.getElementById('expiry-date').value;
        const cvv = document.getElementById('cvv').value;
        
        // Validate form values
        if (!validateCardDetails(cardNumber, cardHolder, expiryDate, cvv)) {
            setPaymentProcessing(false);
            return;
        }
        
        // Create payment payload
        const paymentData = {
            cardInfo: {
                cardNumber,
                cardHolder,
                expiryDate,
                cvv
            },
            amount: 12500, // المبلغ بالريال السعودي
            studentId: currentStudentId,
            applicationId: currentApplicationId,
            description: 'رسوم برنامج الدبلوم عن بعد'
        };
        
        // Send payment to server
        const response = await fetch('/api/payments/process', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(paymentData),
        });
        
        const result = await response.json();
        
        if (!result.success) {
            showPaymentError(result.message);
            setPaymentProcessing(false);
            return;
        }
        
        // Payment successful
        handleSuccessfulPayment(result);
        
    } catch (error) {
        console.error('خطأ في معالجة الدفع:', error);
        showPaymentError('حدث خطأ أثناء معالجة الدفع. يرجى المحاولة مرة أخرى.');
        setPaymentProcessing(false);
    }
}

// Validate card details
function validateCardDetails(cardNumber, cardHolder, expiryDate, cvv) {
    // Reset previous error messages
    document.getElementById('payment-error').style.display = 'none';
    
    // Validate card number (16 digits)
    if (!/^\d{16}$/.test(cardNumber)) {
        showPaymentError('رقم البطاقة يجب أن يتكون من 16 رقماً');
        return false;
    }
    
    // Validate card holder (not empty)
    if (!cardHolder || cardHolder.trim().length < 3) {
        showPaymentError('الرجاء إدخال اسم حامل البطاقة بشكل صحيح');
        return false;
    }
    
    // Validate expiry date (MM/YY format)
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryDate)) {
        showPaymentError('الرجاء إدخال تاريخ انتهاء البطاقة بصيغة MM/YY');
        return false;
    }
    
    // Validate CVV (3 digits)
    if (!/^\d{3}$/.test(cvv)) {
        showPaymentError('الرجاء إدخال رمز CVV بشكل صحيح (3 أرقام)');
        return false;
    }
    
    // Validate expiry date is not in past
    const [expMonth, expYear] = expiryDate.split('/');
    const expiry = new Date(2000 + parseInt(expYear), parseInt(expMonth) - 1);
    const now = new Date();
    
    if (expiry < now) {
        showPaymentError('البطاقة منتهية الصلاحية');
        return false;
    }
    
    return true;
}

// Display payment error
function showPaymentError(message) {
    const errorDisplay = document.getElementById('payment-error');
    errorDisplay.textContent = message || 'حدث خطأ أثناء معالجة الدفع';
    errorDisplay.style.display = 'block';
    
    // Scroll to error
    errorDisplay.scrollIntoView({ behavior: 'smooth' });
}

// Set payment processing state
function setPaymentProcessing(isProcessing) {
    const submitButton = document.getElementById('payment-submit');
    
    if (isProcessing) {
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> جارٍ المعالجة...';
    } else {
        submitButton.disabled = false;
        submitButton.innerHTML = 'إتمام الدفع';
    }
}

// Handle successful payment
function handleSuccessfulPayment(paymentResult) {
    // Hide the payment form
    document.getElementById('credit-card-container').style.display = 'none';
    
    // Update UI to show payment success
    document.getElementById('payment-required').classList.add('d-none');
    document.getElementById('payment-completed').classList.remove('d-none');
    
    // Update payment details in the receipt
    document.getElementById('payment-id').textContent = paymentResult.paymentId;
    document.getElementById('payment-date').textContent = new Date(paymentResult.timestamp).toLocaleDateString('ar-SA');
    document.getElementById('payment-method').textContent = 'بطاقة ائتمانية';
    
    // Update application status UI if available
    updateApplicationStatusUI('paid');
}

// Update application status UI
function updateApplicationStatusUI(status) {
    const statusCard = document.getElementById('status-card');
    const statusBadge = document.getElementById('status-badge');
    const statusMessage = document.getElementById('status-message');
    
    if (!statusCard || !statusBadge || !statusMessage) return;
    
    // Remove all status classes
    statusCard.classList.remove('status-pending', 'status-approved', 'status-rejected', 'status-paid');
    statusBadge.classList.remove('bg-warning', 'bg-success', 'bg-danger', 'bg-info');
    
    if (status === 'pending') {
        statusCard.classList.add('status-pending');
        statusBadge.classList.add('bg-warning');
        statusBadge.textContent = 'قيد المراجعة';
        statusMessage.textContent = 'جاري مراجعة طلبك...';
    } else if (status === 'approved') {
        statusCard.classList.add('status-approved');
        statusBadge.classList.add('bg-success');
        statusBadge.textContent = 'مقبول';
        statusMessage.textContent = 'تم قبول طلبك! يرجى إتمام إجراءات التسجيل من خلال سداد الرسوم الدراسية.';
    } else if (status === 'rejected') {
        statusCard.classList.add('status-rejected');
        statusBadge.classList.add('bg-danger');
        statusBadge.textContent = 'مرفوض';
        statusMessage.textContent = 'نأسف، تم رفض طلبك. يمكنك التواصل مع الدعم الفني لمزيد من المعلومات.';
    } else if (status === 'paid') {
        statusCard.classList.add('status-paid');
        statusBadge.classList.add('bg-info');
        statusBadge.textContent = 'تم السداد';
        statusMessage.textContent = 'تم سداد الرسوم الدراسية بنجاح. يمكنك الآن الدخول إلى النظام الأكاديمي.';
        
        // Enable academic access
        const academicBtn = document.getElementById('quick-academic-btn');
        if (academicBtn) {
            academicBtn.classList.remove('disabled');
        }
    }
}

// Handle payment method selection
function selectPaymentMethod(method) {
    document.getElementById('mada-payment-container').style.display = 'none';
    document.getElementById('credit-card-container').style.display = 'none';
    document.getElementById('sadad-payment-container').style.display = 'none';
    
    if (method === 'credit-card') {
        document.getElementById('credit-card-container').style.display = 'block';
    } else if (method === 'mada') {
        document.getElementById('mada-payment-container').style.display = 'block';
    } else if (method === 'sadad') {
        document.getElementById('sadad-payment-container').style.display = 'block';
    }
}

// Attach event listeners on DOM load
document.addEventListener('DOMContentLoaded', function() {
    initPaymentForm();
    
    // Add event listeners to payment method buttons
    const paymentButtons = document.querySelectorAll('.payment-card .btn');
    paymentButtons.forEach(button => {
        button.addEventListener('click', function() {
            const method = this.getAttribute('data-method');
            selectPaymentMethod(method);
        });
    });
});