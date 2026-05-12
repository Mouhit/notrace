/**
 * Payment System Types
 */

export type Currency = "USD" | "INR";
export type PaymentStatus = "pending" | "completed" | "failed" | "cancelled";
export type ServiceType = "service_1" | "service_2";

export interface PaymentRequest {
  invoiceNumber: string;
  serviceDescription: string;
  amount: number;
  currency: Currency;
  serviceType: ServiceType;
  clientEmail: string;
  clientName?: string;
  notes?: string;
}

export interface PaymentRecord {
  id: string;
  invoiceNumber: string;
  serviceDescription: string;
  amount: number;
  currency: Currency;
  serviceType: ServiceType;
  clientEmail: string;
  clientName?: string;
  notes?: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  status: PaymentStatus;
  amountPaid?: number;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface RazorpayOrderResponse {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  offer_id?: string;
  status: string;
  attempts: number;
  notes: Record<string, any>;
  created_at: number;
}
