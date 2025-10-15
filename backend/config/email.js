import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create reusable transporter
export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Email templates
export const emailTemplates = {
  volunteerApproved: (name) => ({
    subject: '🎉 Your Volunteer Application has been Approved!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Suryoday Family!</h1>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <p style="font-size: 16px; color: #374151; line-height: 1.6;">Dear ${name},</p>
          <p style="font-size: 16px; color: #374151; line-height: 1.6;">
            We are delighted to inform you that your volunteer application has been <strong>approved</strong>! 🎊
          </p>
          <p style="font-size: 16px; color: #374151; line-height: 1.6;">
            You can now log in to your volunteer dashboard to view your assigned tasks, upcoming events, and log your volunteer hours.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/volunteer-portal" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Access Volunteer Portal
            </a>
          </div>
          <p style="font-size: 16px; color: #374151; line-height: 1.6;">
            Thank you for choosing to make a difference in the lives of our elderly residents. Together, we can create meaningful impact!
          </p>
          <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-top: 30px;">
            Warm regards,<br/>
            <strong>Team Suryoday Old Age Home</strong>
          </p>
        </div>
        <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
          <p>Suryoday Old Age Home - Tejasvi Foundation</p>
          <p>Making every sunrise beautiful for our elders 🌅</p>
        </div>
      </div>
    `
  }),

  volunteerRejected: (name) => ({
    subject: 'Update on Your Volunteer Application',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Application Status Update</h1>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <p style="font-size: 16px; color: #374151; line-height: 1.6;">Dear ${name},</p>
          <p style="font-size: 16px; color: #374151; line-height: 1.6;">
            Thank you for your interest in volunteering with Suryoday Old Age Home.
          </p>
          <p style="font-size: 16px; color: #374151; line-height: 1.6;">
            After careful consideration, we regret to inform you that we are unable to proceed with your application at this time. This decision was not easy, as we received many qualified applications.
          </p>
          <p style="font-size: 16px; color: #374151; line-height: 1.6;">
            We encourage you to apply again in the future when new opportunities arise. Your interest in supporting our cause is greatly appreciated.
          </p>
          <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-top: 30px;">
            Best wishes,<br/>
            <strong>Team Suryoday Old Age Home</strong>
          </p>
        </div>
      </div>
    `
  }),

  taskAssigned: (name, taskTitle, taskDescription, dueDate) => ({
    subject: '📋 New Task Assigned',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">New Task Assignment</h1>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <p style="font-size: 16px; color: #374151; line-height: 1.6;">Hello ${name},</p>
          <p style="font-size: 16px; color: #374151; line-height: 1.6;">
            You have been assigned a new task:
          </p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #1f2937; margin: 0 0 10px 0; font-size: 20px;">${taskTitle}</h2>
            <p style="color: #4b5563; margin: 10px 0; line-height: 1.6;">${taskDescription}</p>
            <p style="color: #6b7280; margin: 10px 0; font-size: 14px;"><strong>Due Date:</strong> ${dueDate}</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/volunteer-portal" 
               style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              View Task Details
            </a>
          </div>
          <p style="font-size: 16px; color: #374151; line-height: 1.6;">
            Thank you for your continued support!
          </p>
          <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-top: 30px;">
            Best regards,<br/>
            <strong>Team Suryoday</strong>
          </p>
        </div>
      </div>
    `
  }),

  welcomeEmail: (name, email, tempPassword, role) => ({
    subject: '🔐 Your Account Has Been Created',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Suryoday!</h1>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <p style="font-size: 16px; color: #374151; line-height: 1.6;">Hello ${name},</p>
          <p style="font-size: 16px; color: #374151; line-height: 1.6;">
            Your ${role} account has been created successfully!
          </p>
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e;"><strong>⚠️ Important: Your Login Credentials</strong></p>
          </div>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #1f2937; margin: 5px 0;"><strong>Email:</strong> ${email}</p>
            <p style="color: #1f2937; margin: 5px 0;"><strong>Temporary Password:</strong> <code style="background: #e5e7eb; padding: 2px 6px; border-radius: 3px;">${tempPassword}</code></p>
            <p style="color: #1f2937; margin: 5px 0;"><strong>Role:</strong> ${role}</p>
          </div>
          <p style="font-size: 14px; color: #dc2626; line-height: 1.6;">
            ⚠️ Please change your password after first login for security purposes.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" 
               style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Login to Dashboard
            </a>
          </div>
          <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-top: 30px;">
            Best regards,<br/>
            <strong>Team Suryoday</strong>
          </p>
        </div>
      </div>
    `
  })
};

// Send email function
export async function sendEmail(to, template) {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('⚠️  Email not configured. Email would be sent to:', to);
      console.log('Subject:', template.subject);
      return { success: true, message: 'Email service not configured' };
    }

    const info = await transporter.sendMail({
      from: `"Suryoday Old Age Home" <${process.env.EMAIL_USER}>`,
      to,
      subject: template.subject,
      html: template.html,
    });

    console.log('✅ Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email error:', error.message);
    return { success: false, error: error.message };
  }
}
