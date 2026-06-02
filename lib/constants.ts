// lib/constants.ts
// Plan limits and configuration - By Engage Ad

export const PLANS = {
  FREE: {
    name: 'FREE',
    price: 0,
    secrets_per_day: 5,
    expiry_days: 1,
    collections: 1,
  },
  TRIAL: {
    name: 'TRIAL',
    price: 199, // paise (1.99 INR)
    secrets_per_day: 20,
    expiry_days: 15,
    collections: 2,
  },
  PRO: {
    name: 'PRO',
    price: 499, // paise (4.99 INR)
    secrets_per_day: 50,
    expiry_days: 30,
    collections: 10,
  },
  BUSINESS: {
    name: 'BUSINESS',
    price: 999, // paise (9.99 INR)
    secrets_per_day: 999999,
    expiry_days: 90,
    collections: 999999,
  },
  ENTERPRISE: {
    name: 'ENTERPRISE',
    price: 1999, // paise (19.99 INR)
    secrets_per_day: 999999,
    expiry_days: 365,
    collections: 999999,
  },
};

export const RAZORPAY_CONFIG = {
  currency: 'INR',
  receipt_prefix: 'rcpt_',
  timeout: 30000, // 30 seconds
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
};

export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
  GRACE_PERIOD: 'grace_period',
};

export const GRACE_PERIOD_DAYS = 5;
export const RETRY_ATTEMPTS = 3;
export const WEBHOOK_TIMEOUT_SECONDS = 60;
