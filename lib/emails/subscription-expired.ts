// lib/emails/subscription-expired.ts
// Subscription expired email - By Engage Ad

export function subscriptionExpiredEmail(email: string, plan: string) {
  return {
    to: email,
    subject: `Your NoTrace ${plan} Plan Has Expired`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f59e0b; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Subscription Expired</h1>
        </div>
        
        <div style="padding: 20px; background-color: #f8fafc;">
          <p>Hi there,</p>
          
          <p>Your NoTrace ${plan} plan has expired. Your account is now on the Free plan.</p>
          
          <div style="background-color: #fffbeb; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
            <p style="margin: 0;">You still have access to your old secrets, but can only create 5 new secrets per day.</p>
          </div>
          
          <h3>Upgrade to continue:</h3>
          <ul>
            <li>50+ secrets per day</li>
            <li>Longer expiry times</li>
            <li>More collections</li>
            <li>Priority support</li>
          </ul>
          
          <p><a href="https://notrace.co.in/checkout?plan=PRO" style="background-color: #00e5a0; color: #0f172a; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Upgrade Now</a></p>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
          
          <p style="font-size: 12px; color: #666;">
            Have questions? Email us at support@notrace.co.in
          </p>
        </div>
      </div>
    `,
  };
}
