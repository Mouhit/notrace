# NoTrace Subscription & Payments System — Complete Setup Guide

## 🎯 Overview

This is a **complete Admin Payment Collection System** with Razorpay integration for:
- ✅ USD payments (International clients)
- ✅ INR payments (India clients)
- ✅ Admin payment link generation
- ✅ Client payment processing
- ✅ Automatic payment verification
- ✅ Invoice tracking

---

## 📦 Files Included

### Backend Logic
- `lib/payments/razorpay.ts` — Razorpay API integration
- `types/payments.ts` — TypeScript types

### API Routes
- `app/api/payments/create-order/route.ts` — Create payment invoice
- `app/api/payments/verify/route.ts` — Verify payment
- `app/api/payments/get-order/route.ts` — Fetch payment details

### UI Components
- `components/payments/AdminPaymentForm.tsx` — Admin payment creation interface

### Pages
- `app/pay/page.tsx` — Client payment page

### Database
- `supabase-payments-migration.sql` — Create payments table

---

## 🚀 Setup Instructions

### Step 1: Install Dependencies

```bash
npm install razorpay uuid
```

### Step 2: Environment Variables

Add to your `.env.local`:

```
# Razorpay Keys (get from dashboard.razorpay.com)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx

# Admin Authentication
ADMIN_SECRET_KEY=your-secure-admin-key-here
```

### Step 3: Create Supabase Table

1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `supabase-payments-migration.sql`
3. Paste and click Run

### Step 4: Create Admin Payment Page

Create `app/admin/payments/page.tsx`:

```typescript
import AdminPaymentForm from "@/components/payments/AdminPaymentForm";

export default function AdminPaymentsPage() {
  return <AdminPaymentForm />;
}
```

### Step 5: Deploy

```bash
git add .
git commit -m "Add subscription & payments system"
git push
```

---

## 📋 How It Works

### Admin Creates Payment Invoice

1. Admin visits `/admin/payments`
2. Fills in:
   - Invoice Number (e.g., INV-2024-001)
   - Service Description
   - Amount (any value)
   - Currency (USD or INR)
   - Service Type (service_1 or service_2)
   - Client Email & Name
   - Optional notes
3. Clicks "Create Payment Invoice"
4. Gets a unique payment link to share with client

### Client Completes Payment

1. Client opens payment link (e.g., `/pay?order=...`)
2. Sees invoice details and amount
3. Clicks "Pay Now with Razorpay"
4. Razorpay dialog opens
5. Client enters payment details
6. Payment processed
7. System verifies signature
8. Status updated to "completed"

---

## 🔐 Security Features

✅ Admin authentication via secret key  
✅ Razorpay signature verification  
✅ Database RLS policies (admin only)  
✅ Unique invoice numbers  
✅ Amount validation  
✅ Email validation  
✅ Encrypted payment transmission  

---

## 💳 Razorpay Integration

### Getting API Keys

1. Go to [dashboard.razorpay.com](https://dashboard.razorpay.com)
2. Sign up or login
3. Go to Settings → API Keys
4. Copy `Key ID` and `Key Secret`
5. Add to `.env.local`

### USD Payments (International)

- Razorpay supports USD payments globally
- Convert USD to INR or use direct USD gateway
- Currency validation in code: `USD` or `INR`

### INR Payments (India)

- Direct INR support via Razorpay
- Works with Indian bank accounts
- Supports UPI, Net Banking, Card payments

---

## 📊 Admin Dashboard (Optional)

To view all payments, create `app/admin/payments/dashboard/page.tsx`:

```typescript
"use client";
import { useEffect, useState } from "react";

export default function PaymentsDashboard() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setPayments(data);
    }
  };

  return (
    <div>
      <h1>Payment History</h1>
      <table>
        <thead>
          <tr>
            <th>Invoice</th>
            <th>Amount</th>
            <th>Currency</th>
            <th>Client</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr key={p.id}>
              <td>{p.invoice_number}</td>
              <td>{p.amount}</td>
              <td>{p.currency}</td>
              <td>{p.client_email}</td>
              <td>{p.status}</td>
              <td>{new Date(p.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## 🧪 Testing

### Test Mode (Razorpay Test Keys)

Use test credentials to test payments:

**Test Card Numbers:**
- Visa: `4111 1111 1111 1111`
- Mastercard: `5555 5555 5555 4444`
- Any expiry (future date)
- Any CVV

### Production Mode

Replace test keys with live keys when ready.

---

## 🔗 API Endpoints

### Create Payment Order
```
POST /api/payments/create-order
Headers: x-admin-secret: <ADMIN_SECRET_KEY>

Body:
{
  "invoiceNumber": "INV-2024-001",
  "serviceDescription": "Custom Website Development",
  "amount": 5000,
  "currency": "INR",
  "serviceType": "service_1",
  "clientEmail": "client@example.com",
  "clientName": "John Doe",
  "notes": "Optional notes"
}

Response:
{
  "success": true,
  "orderId": "order_xxxxx",
  "amount": 5000,
  "currency": "INR",
  "invoiceNumber": "INV-2024-001"
}
```

### Verify Payment
```
POST /api/payments/verify

Body:
{
  "orderId": "order_xxxxx",
  "paymentId": "pay_xxxxx",
  "signature": "xxxxx"
}
```

### Get Order Details
```
GET /api/payments/get-order?orderId=order_xxxxx

Response:
{
  "orderId": "order_xxxxx",
  "invoiceNumber": "INV-2024-001",
  "amount": 5000,
  "currency": "INR",
  "clientEmail": "client@example.com",
  "status": "completed"
}
```

---

## 📱 Payment Page Features

✅ Beautiful dark UI matching NoTrace theme  
✅ Invoice details display  
✅ Amount and currency shown  
✅ Direct Razorpay integration  
✅ Payment verification  
✅ Success confirmation  
✅ Error handling  

---

## 📈 For Multiple Services

This system supports 2 services. To add more:

1. Update `PaymentRequest` type in `types/payments.ts`:
   ```typescript
   export type ServiceType = "service_1" | "service_2" | "service_3";
   ```

2. Update admin form in `AdminPaymentForm.tsx`:
   ```typescript
   <option value="service_3">Service 3</option>
   ```

3. Update Supabase constraint

---

## 🚨 Common Issues

### "Invalid signature" error
- Ensure `RAZORPAY_KEY_SECRET` is correct
- Check order ID and payment ID match

### "Order not found"
- Check if Supabase migration ran
- Verify invoice number is unique

### Payment not captured
- Check Razorpay test/live mode
- Verify API keys are correct

---

## 📞 Support

See logs in:
- Browser Console (client-side)
- Server logs (backend)
- Supabase Dashboard (database)
- Razorpay Dashboard (payment status)

---

## ✅ Checklist

- [ ] Install Razorpay package
- [ ] Add environment variables
- [ ] Run Supabase migration
- [ ] Create admin payment page
- [ ] Test with Razorpay test keys
- [ ] Switch to live keys
- [ ] Deploy to Vercel

---

**Ready to collect payments!** 🎉
