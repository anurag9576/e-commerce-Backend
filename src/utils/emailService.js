const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    secure: false,
    requireTLS: true,
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
const sendOTPEmail = async (email, otp) => {
  try {
    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('Email credentials not configured in .env file');
      console.log('=================================');
      console.log('🔔 DEVELOPMENT MODE - OTP VERIFICATION');
      console.log('=================================');
      console.log(`Email: ${email}`);
      console.log(`OTP: ${otp}`);
      console.log('=================================');
      console.log('Use this OTP for testing in development');
      console.log('=================================');
      return true; // Return true in development if no email config
    }

    console.log('Attempting to send email to:', email);
    console.log('Using email user:', process.env.EMAIL_USER);

    const transporter = createTransporter();
    
    // Verify transporter configuration
    await transporter.verify();
    console.log('Transporter verified successfully');
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Email Verification OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Email Verification</h2>
          <p>Thank you for registering! Please use the following OTP to verify your email address:</p>
          <div style="background: #f0f0f0; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #007bff; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
          </div>
          <p><strong>Note:</strong> This OTP will expire in 10 minutes.</p>
          <p>If you didn't request this OTP, please ignore this email.</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 14px;">This is an automated message. Please do not reply to this email.</p>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    console.log(`OTP sent to ${email}: ${otp}`);
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    console.error('Error details:', error.message);
    if (error.code === 'EAUTH') {
      console.error('Authentication failed. Check your EMAIL_USER and EMAIL_PASS in .env file');
      console.error('Make sure you are using an App Password, not your regular Gmail password');
      
      // Fallback to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log('=================================');
        console.log('🔔 DEVELOPMENT MODE - OTP VERIFICATION');
        console.log('=================================');
        console.log(`Email: ${email}`);
        console.log(`OTP: ${otp}`);
        console.log('=================================');
        console.log('Use this OTP for testing in development');
        console.log('=================================');
        return true;
      }
    }
    return false;
  }
};

module.exports = {
  generateOTP,
  sendOTPEmail
};
