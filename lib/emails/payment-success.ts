// lib/emails/payment-success.ts
// Payment success email - By Engage Ad

export function paymentSuccessEmail(
  email: string,
  plan: string,
  amount: number,
  transactionId: string
) {
  return {
    to: email,
    subject: `Payment Successful - NoTrace ${plan} Plan`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #00e5a0; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Payment Confirmed ✓</h1>
        </div>
        
        <div style="padding: 20px; background-color: #f8fafc;">
          <p>Hi there,</p>
          
          <p>Thank you for your payment! Your ${plan} plan is now active.</p>
          
          <div style="background-color: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Plan:</strong> ${plan}</p>
            <p style="margin: 5px 0;"><strong>Amount Paid:</strong> ₹${(amount / 100).toFixed(2)}</p>
            <p style="margin: 5px 0;"><strong>Transaction ID:</strong> ${transactionId}</p>
          </div>
          
          <p><a href="https://notrace.co.in/app" style="background-color: #00e5a0; color: #0f172a; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Start Creating Secrets</a></p>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
          
          <p style="font-size: 12px; color: #666;">
            Questions? Email us at support@notrace.co.in
          </p>
        </div>
      </div>
    `,
  };
}
