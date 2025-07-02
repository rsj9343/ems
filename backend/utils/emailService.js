import nodemailer from 'nodemailer';

// Create email transporter
const createTransporter = () => {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('Email configuration not found. Email features will be disabled.');
    return null;
  }

  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send email function
export const sendEmail = async (to, subject, html, text = '') => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      console.log('Email not sent - transporter not configured');
      return false;
    }

    const mailOptions = {
      from: `"Employee Management System" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return true;

  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};

// Email templates
export const emailTemplates = {
  welcome: (name, role) => ({
    subject: 'Welcome to Employee Management System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4F46E5;">Welcome ${name}!</h1>
        <p>Your account has been created successfully.</p>
        <p><strong>Role:</strong> ${role}</p>
        <p>You can now log in to the system using your email and password.</p>
        <div style="margin-top: 30px; padding: 20px; background-color: #F3F4F6; border-radius: 8px;">
          <p style="margin: 0; color: #6B7280;">If you have any questions, please contact your administrator.</p>
        </div>
      </div>
    `
  }),

  leaveRequest: (employeeName, leaveType, startDate, endDate, totalDays) => ({
    subject: 'New Leave Request Submitted',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4F46E5;">New Leave Request</h1>
        <p><strong>Employee:</strong> ${employeeName}</p>
        <p><strong>Leave Type:</strong> ${leaveType}</p>
        <p><strong>Duration:</strong> ${startDate} to ${endDate} (${totalDays} days)</p>
        <p>Please review and approve/reject this leave request in the system.</p>
      </div>
    `
  }),

  leaveApproved: (employeeName, leaveType, startDate, endDate) => ({
    subject: 'Leave Request Approved',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #10B981;">Leave Request Approved</h1>
        <p>Hello ${employeeName},</p>
        <p>Your ${leaveType} leave request from ${startDate} to ${endDate} has been approved.</p>
        <p>Enjoy your time off!</p>
      </div>
    `
  }),

  leaveRejected: (employeeName, leaveType, startDate, endDate, reason) => ({
    subject: 'Leave Request Rejected',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #EF4444;">Leave Request Rejected</h1>
        <p>Hello ${employeeName},</p>
        <p>Your ${leaveType} leave request from ${startDate} to ${endDate} has been rejected.</p>
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
        <p>Please contact your manager for more information.</p>
      </div>
    `
  }),

  birthdayReminder: (name, birthday) => ({
    subject: `🎉 Happy Birthday ${name}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; text-align: center;">
        <h1 style="color: #4F46E5;">🎉 Happy Birthday!</h1>
        <p style="font-size: 18px;">Wishing you a wonderful birthday, ${name}!</p>
        <p>Hope your special day is filled with happiness and joy.</p>
        <div style="margin-top: 30px; padding: 20px; background-color: #FEF3C7; border-radius: 8px;">
          <p style="margin: 0; color: #92400E;">From all of us at the company! 🎂</p>
        </div>
      </div>
    `
  }),

  workAnniversary: (name, years) => ({
    subject: `🎊 Work Anniversary - ${years} Years!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; text-align: center;">
        <h1 style="color: #4F46E5;">🎊 Congratulations!</h1>
        <p style="font-size: 18px;">Today marks ${years} year${years > 1 ? 's' : ''} of your valuable contribution to our company, ${name}!</p>
        <p>Thank you for your dedication and hard work.</p>
        <div style="margin-top: 30px; padding: 20px; background-color: #DBEAFE; border-radius: 8px;">
          <p style="margin: 0; color: #1E40AF;">Here's to many more years of success together! 🥳</p>
        </div>
      </div>
    `
  })
};