import nodemailer from 'nodemailer';

/**
 * Create email transporter using SMTP configuration from environment variables
 */
function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}

/**
 * Send password reset link to user
 * @param email - User's email address
 * @param name - User's name
 * @param token - Password reset token
 */
export async function sendPasswordResetLink(
  email: string,
  name: string,
  token: string
): Promise<void> {
  const transporter = createTransporter();
  
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;
  
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: 'Password Reset Request - GDV Society',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>Hello ${name},</p>
        <p>Your password reset request has been approved by an administrator.</p>
        <p>Click the link below to reset your password:</p>
        <p>
          <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Reset Password
          </a>
        </p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this password reset, please ignore this email.</p>
        <p>Best regards,<br>GDV Society Management</p>
      </div>
    `,
  };
  
  await transporter.sendMail(mailOptions);
}

/**
 * Send password reset denied notification
 * @param email - User's email address
 * @param name - User's name
 */
export async function sendPasswordResetDenied(
  email: string,
  name: string
): Promise<void> {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: 'Password Reset Request Denied - GDV Society',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request Denied</h2>
        <p>Hello ${name},</p>
        <p>Your password reset request has been denied by an administrator.</p>
        <p>If you believe this is an error, please contact the society administrator.</p>
        <p>Best regards,<br>GDV Society Management</p>
      </div>
    `,
  };
  
  await transporter.sendMail(mailOptions);
}

/**
 * Send welcome email to new user
 * @param email - User's email address
 * @param name - User's name
 * @param temporaryPassword - Temporary password for first login
 */
export async function sendWelcomeEmail(
  email: string,
  name: string,
  temporaryPassword: string
): Promise<void> {
  const transporter = createTransporter();
  
  const loginUrl = `${process.env.NEXTAUTH_URL}/auth/signin`;
  
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: 'Welcome to GDV Society Portal',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to GDV Society Portal</h2>
        <p>Hello ${name},</p>
        <p>Your account has been created successfully.</p>
        <p><strong>Login Credentials:</strong></p>
        <p>Email: ${email}<br>
        Temporary Password: <code>${temporaryPassword}</code></p>
        <p>
          <a href="${loginUrl}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Login Now
          </a>
        </p>
        <p><strong>Important:</strong> Please change your password after your first login.</p>
        <p>Best regards,<br>GDV Society Management</p>
      </div>
    `,
  };
  
  await transporter.sendMail(mailOptions);
}

/**
 * Send email verification link
 * @param email - User's email address
 * @param name - User's name
 * @param token - Verification token
 */
export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string
): Promise<void> {
  const transporter = createTransporter();
  
  const verifyUrl = `${process.env.NEXTAUTH_URL}/auth/verify?token=${token}`;
  
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: 'Verify Your Email - GDV Society',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Email Verification</h2>
        <p>Hello ${name},</p>
        <p>Please verify your email address by clicking the link below:</p>
        <p>
          <a href="${verifyUrl}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Verify Email
          </a>
        </p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create this account, please ignore this email.</p>
        <p>Best regards,<br>GDV Society Management</p>
      </div>
    `,
  };
  
  await transporter.sendMail(mailOptions);
}

/**
 * Send password reset request notification to admin
 * @param userEmail - User's email address
 * @param userName - User's name
 */
export async function sendPasswordResetRequestToAdmin(
  userEmail: string,
  userName: string
): Promise<void> {
  const transporter = createTransporter();
  
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@gdv-society.com';
  const dashboardUrl = `${process.env.NEXTAUTH_URL}/dashboard`;
  
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: adminEmail,
    subject: 'New Password Reset Request - GDV Society',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Password Reset Request</h2>
        <p>Hello Admin,</p>
        <p>A new password reset request has been submitted:</p>
        <p><strong>User:</strong> ${userName}<br>
        <strong>Email:</strong> ${userEmail}</p>
        <p>Please review and approve/deny this request from the admin dashboard:</p>
        <p>
          <a href="${dashboardUrl}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Go to Dashboard
          </a>
        </p>
        <p>Best regards,<br>GDV Society System</p>
      </div>
    `,
  };
  
  await transporter.sendMail(mailOptions);
}
