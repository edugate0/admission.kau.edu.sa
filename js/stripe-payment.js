// Stripe Payment Integration
let stripe;
let elements;
let paymentIntentId;

// Initialize Stripe
async function initializeStripe() {
    // Load Stripe.js
    if (!stripe) {
        // In a real-world scenario, you would fetch this from the server
        // or have it injected in your HTML template to avoid exposing it in JS
        const stripePublicKey = 'pk_test_51IrvOKJLmIxfMj5B5C7PYdGd4Py2J5yQWZGMsgQVykJ5tYO0B33ZuhvJ9JZdNfS3U79nmS7xUBWQbP0z9t8EvYwE00CPiZO8Bj';
        stripe = Stripe(stripePublicKey);
    }
}

// Setup the payment form
async function setupPaymentForm(amount) {
    try {
        // Create PaymentIntent on the server
        const response = await fetch('http://localhost:3000/create-payment-intent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ amount }),
        });
        
        const data = await response.json();
        
        if (response.status !== 200) {
            throw new Error(data.error || 'حدث خطأ أثناء إعداد الدفع');
        }
        
        const { clientSecret, paymentIntentId: intentId } = data;
        paymentIntentId = intentId;
        
        // Create the payment form elements
        const appearance = {
            theme: 'stripe',
            variables: {
                colorPrimary: '#08294E',
                colorBackground: '#ffffff',
                colorText: '#30313d',
                colorDanger: '#df1b41',
                fontFamily: 'Tajawal, system-ui, sans-serif',
                spacingUnit: '4px',
                borderRadius: '4px',
            },
            rules: {
                '.Label': {
                    marginBottom: '8px',
                },
            },
        };
        
        elements = stripe.elements({ clientSecret, appearance });
        
        // Create and mount the Payment Element
        const paymentElement = elements.create('payment');
        paymentElement.mount('#payment-element');
        
        // Show the payment form
        document.getElementById('stripe-payment-form').classList.remove('d-none');
        
        // Setup the form submission
        const form = document.getElementById('stripe-payment-form');
        form.addEventListener('submit', handlePaymentSubmission);
        
    } catch (error) {
        console.error('خطأ في إعداد نموذج الدفع:', error);
        showPaymentError(error.message);
    }
}

// Handle payment form submission
async function handlePaymentSubmission(e) {
    e.preventDefault();
    
    setPaymentProcessing(true);
    
    try {
        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: window.location.origin + '/confirmation.html',
            },
            redirect: 'if_required',
        });
        
        if (error) {
            throw error;
        }
        
        // Check payment status
        const statusResponse = await fetch(`http://localhost:3000/payment-status/${paymentIntentId}`);
        const statusData = await statusResponse.json();
        
        if (statusData.status === 'succeeded' || statusData.status === 'processing') {
            handleSuccessfulPayment();
        } else {
            throw new Error('لم يتم إكمال الدفع. يرجى المحاولة مرة أخرى.');
        }
        
    } catch (error) {
        console.error('خطأ في معالجة الدفع:', error);
        showPaymentError(error.message);
        setPaymentProcessing(false);
    }
}

// Handle successful payment
function handleSuccessfulPayment() {
    // Save payment info to localStorage
    const studentData = JSON.parse(localStorage.getItem('studentData') || '{}');
    const applicationData = JSON.parse(localStorage.getItem('applicationData') || '{}');
    
    if (applicationData && applicationData.id) {
        // Update the application status to paid
        const applications = JSON.parse(localStorage.getItem('applications') || '[]');
        const applicationIndex = applications.findIndex(app => app.id === applicationData.id);
        
        if (applicationIndex !== -1) {
            applications[applicationIndex].status = 'paid';
            applications[applicationIndex].paymentDate = new Date().toISOString();
            applications[applicationIndex].paymentMethod = 'بطاقة ائتمان';
            localStorage.setItem('applications', JSON.stringify(applications));
        }
    }
    
    // Show payment success message and hide form
    document.getElementById('stripe-payment-form').classList.add('d-none');
    document.getElementById('payment-required').classList.add('d-none');
    document.getElementById('payment-completed').classList.remove('d-none');
    
    // Update UI to reflect paid status
    document.getElementById('status-card').classList.remove('status-pending', 'status-approved');
    document.getElementById('status-card').classList.add('status-paid');
    document.getElementById('status-badge').textContent = 'تم السداد';
    document.getElementById('status-badge').classList.remove('bg-warning', 'bg-success');
    document.getElementById('status-badge').classList.add('bg-info');
    document.getElementById('status-message').textContent = 'تم سداد الرسوم الدراسية بنجاح. يمكنك الآن الدخول إلى النظام الأكاديمي.';
    
    // Enable academic access
    document.getElementById('quick-academic-btn').classList.remove('disabled');
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

// Handle payment method selection
function selectPaymentMethod(method) {
    const paymentAmount = 12500; // المبلغ بالريال السعودي
    
    // Hide all payment forms first
    document.getElementById('mada-payment-container').style.display = 'none';
    document.getElementById('card-payment-container').style.display = 'none';
    document.getElementById('sadad-payment-container').style.display = 'none';
    document.getElementById('stripe-container').style.display = 'none';
    
    // Show selected payment form
    if (method === 'card') {
        document.getElementById('stripe-container').style.display = 'block';
        initializeStripe().then(() => {
            setupPaymentForm(paymentAmount);
        });
    } else if (method === 'mada') {
        document.getElementById('mada-payment-container').style.display = 'block';
    } else if (method === 'sadad') {
        document.getElementById('sadad-payment-container').style.display = 'block';
    }
}

// Event listener for payment method buttons
document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners for payment method selection buttons
    const paymentButtons = document.querySelectorAll('.payment-card .btn');
    paymentButtons.forEach(button => {
        button.addEventListener('click', function() {
            const method = this.getAttribute('data-method');
            selectPaymentMethod(method);
        });
    });
});