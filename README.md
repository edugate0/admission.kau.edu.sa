# جامعة الملك عبدالعزيز - نظام الدبلوم عن بعد
# King Abdulaziz University - Online Diploma System

## نظرة عامة (Overview)

This is an educational platform for King Abdulaziz University's online diploma program with:
- Student registration
- Application submission
- Course catalog
- Payment processing via Stripe
- Course management

## المتطلبات (Requirements)

- Node.js 14+ 
- A Stripe account (for payment processing)

## الإعداد (Setup)

1. Install required packages for the payment server:
   ```
   cd server
   npm install
   ```

2. Configure your Stripe API keys:
   - Copy `.env-example` to `.env` in the server directory
   - Update with your Stripe API keys:
     ```
     STRIPE_SECRET_KEY=sk_test_your_secret_key
     STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
     ```

3. Update the client-side Stripe public key in `js/stripe-payment.js` with your actual Stripe publishable key.

## تشغيل النظام (Running the System)

1. Start the payment server:
   ```
   cd server
   node payment.js
   ```

2. Open `index.html` in your browser to access the main application.

## خصائص النظام (Features)

- **التسجيل وإدارة الحساب (Registration & Account Management)**
  - Student registration and login
  - Profile management

- **نظام التقديم (Application System)**
  - Program browsing
  - Application submission with document upload
  - Application status tracking

- **نظام الدفع (Payment System)**
  - Secure payments via Stripe
  - Support for credit/debit cards
  - Payment verification and receipts

- **النظام الأكاديمي (Academic System)**
  - Course enrollment
  - Course materials
  - Academic records

## لوحة الإدارة (Admin Panel)

The admin panel allows university staff to:
- Review applications
- Manage student accounts
- Process payments
- Manage academic records

Access the admin panel at `admin/login.html`

## الأمان (Security)

- All payments are processed securely through Stripe
- User authentication is required for sensitive operations
- Admin access is restricted with separate authentication

## ملاحظات فنية (Technical Notes)

- The frontend is built with HTML, CSS (Bootstrap), and JavaScript
- The payment system uses Node.js with Express and Stripe API
- Data is currently stored using browser localStorage (would use a database in production)