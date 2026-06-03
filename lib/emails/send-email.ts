// lib/emails/send-email.ts
// Email sender utility - By Engage Ad

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: EmailOptions) {
  try {
    // For now, log emails (replace with Resend, SendGrid, etc.)
    console.log(`📧 Email sent to ${options.to}: ${options.subject}`);
    
    // TODO: Integrate with actual email service
    // const response = await fetch('https://api.resend.com/emails', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     from: 'noreply@notrace.co.in',
    //     to: options.to,
    //     subject: options.subject,
    //     html: options.html,
    //   }),
    // });
    
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error };
  }
}
