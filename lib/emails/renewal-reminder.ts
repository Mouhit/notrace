// lib/emails/renewal-reminder.ts
// Renewal reminder email - By Engage Ad

export function renewalReminderEmail(
  email: string,
  plan: string,
  amount: number,
  renewalDate: string
) {
  return {
    to: email,
    subject: `Your NoTrace ${plan} Plan Renews Soon`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #3b82f6; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Renewal Reminder</h1>
        </div>
        
        <div style="padding: 20px; background-color: #f8fafc;">
          <p>Hi there,</p>
          
          <p>Your NoTrace ${plan} plan will renew on <strong>${renewalDate}</strong>.</p>
          
          <div style="background-color: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Plan:</strong> ${plan}</p>
            <p style="margin: 5px 0;"><strong>Renewal Amount:</strong> ₹${(amount / 100).toFixed(2)}</p>
            <p style="margin: 5px 0;"><strong>Renewal Date:</strong> ${renewalDate}</p>
          </div>
          
          <p>No action needed if you want to continue. You can update your payment method or manage your plan anytime.</p>
          
          <p><a href="https://notrace.co.in/dashboard" style="background-color: #00e5a0; color: #0f172a; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Manage Subscription</a></p>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
          
          <p style="font-size: 12px; color: #666;">
            Questions? Email us at support@notrace.co.in
          </p>
        </div>
      </div>
    `,
  };
}
