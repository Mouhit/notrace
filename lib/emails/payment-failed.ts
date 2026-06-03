// lib/emails/payment-failed.ts
// Payment failed email - By Engage Ad

export function paymentFailedEmail(email: string, plan: string, reason: string) {
  return {
    to: email,
    subject: `Payment Failed - NoTrace ${plan} Plan`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #ef4444; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Payment Failed</h1>
        </div>
        
        <div style="padding: 20px; background-color: #f8fafc;">
          <p>Hi there,</p>
          
          <p>We weren't able to process your payment for the ${plan} plan.</p>
          
          <div style="background-color: #fee2e2; padding: 15px; border-radius: 8px; border-left: 4px solid #ef4444; margin: 20px 0;">
            <p style="margin: 0;"><strong>Reason:</strong> ${reason}</p>
          </div>
          
          <p><a href="https://notrace.co.in/checkout?plan=${plan}" style="background-color: #00e5a0; color: #0f172a; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Retry Payment</a></p>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
          
          <p style="font-size: 12px; color: #666;">
            Questions? Email us at support@notrace.co.in
          </p>
        </div>
      </div>
    `,
  };
}
