import { Resend } from 'resend';

   const resend = new Resend(process.env.RESEND_API_KEY);

   export async function sendVerificationEmail(email: string, token: string) {
     const verificationLink = `${process.env.NEXTAUTH_URL}/auth/verify?token=${token}`;
     try {
       await resend.emails.send({
         from: 'no-reply@manishportfolio.online', // Replace with your verified domain
         to: email,
         subject: 'Verify Your Email - Clothing Store',
         html: `
           <h1>Welcome to Clothing Store</h1>
           <p>Please verify your email by clicking the link below:</p>
           <a href="${verificationLink}" style="color: #1A3C34; text-decoration: underline;">Verify Email</a>
           <p>This link will expire in 24 hours.</p>
         `,
       });
       console.log(`Verification email sent to ${email}`);
     } catch (error) {
       console.error('Error sending verification email:', error);
       throw new Error('Failed to send verification email');
     }
   }

   export async function sendResetPasswordEmail(email: string, token: string) {
     const resetLink = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;
     try {
       await resend.emails.send({
        from: 'clothing-store <onboarding@resend.dev>',
 // Replace with your verified domain
         to: email,
         subject: 'Reset Your Password - Clothing Store',
         html: `
           <h1>Password Reset Request</h1>
           <p>Click the link below to reset your password:</p>
           <a href="${resetLink}" style="color: #1A3C34; text-decoration: underline;">Reset Password</a>
           <p>This link will expire in 1 hour.</p>
         `,
       });
       console.log(`Reset password email sent to ${email}`);
     } catch (error) {
       console.error('Error sending reset password email:', error);
       throw new Error('Failed to send reset password email');
     }
   }