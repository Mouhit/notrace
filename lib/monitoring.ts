// lib/monitoring.ts
// Payment monitoring and alerting - By Engage Ad

export interface PaymentMetrics {
  timestamp: string;
  successful_payments: number;
  failed_payments: number;
  refunds: number;
  total_amount_paise: number;
}

const metrics: PaymentMetrics = {
  timestamp: new Date().toISOString(),
  successful_payments: 0,
  failed_payments: 0,
  refunds: 0,
  total_amount_paise: 0,
};

export function recordPaymentSuccess(amount: number) {
  metrics.successful_payments++;
  metrics.total_amount_paise += amount;
  checkMetrics();
}

export function recordPaymentFailure() {
  metrics.failed_payments++;
  checkMetrics();
}

export function recordRefund(amount: number) {
  metrics.refunds++;
  metrics.total_amount_paise -= amount;
  checkMetrics();
}

function checkMetrics() {
  const total = metrics.successful_payments + metrics.failed_payments;
  const failureRate = total > 0 ? (metrics.failed_payments / total) * 100 : 0;

  // Alert if failure rate exceeds 10%
  if (failureRate > 10) {
    alertHighFailureRate(failureRate);
  }

  // Alert if no successful payments in the last hour
  if (metrics.successful_payments === 0) {
    alertNoPayments();
  }
}

function alertHighFailureRate(rate: number) {
  console.warn(`⚠️ High payment failure rate: ${rate.toFixed(2)}%`);
  // TODO: Send Slack/email alert
}

function alertNoPayments() {
  console.warn(`⚠️ No successful payments in the last period`);
  // TODO: Send Slack/email alert
}

export function getMetrics(): PaymentMetrics {
  return { ...metrics };
}

export function resetMetrics() {
  metrics.timestamp = new Date().toISOString();
  metrics.successful_payments = 0;
  metrics.failed_payments = 0;
  metrics.refunds = 0;
  metrics.total_amount_paise = 0;
}
