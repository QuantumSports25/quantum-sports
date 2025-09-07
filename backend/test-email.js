const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmail() {
  try {
    console.log('Testing email configuration...');
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_APP_PASSWORD exists:', !!process.env.EMAIL_APP_PASSWORD);
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    });

    const testOtp = Math.floor(100000 + Math.random() * 900000).toString();
    
    const mailOptions = {
      from: {
        name: 'Quantum Sports',
        address: process.env.EMAIL_USER,
      },
      to: "dakshr264@gmail.com", // Send to yourself for testing
      subject: 'Test OTP - Quantum Sports',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Test OTP Email</h2>
          <p>This is a test email to verify your email configuration.</p>
          <div style="background: #f0f0f0; padding: 20px; text-align: center; margin: 20px 0;">
            <h3>Your Test OTP: ${testOtp}</h3>
          </div>
          <p>If you received this email, your email configuration is working correctly!</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n📋 Email Setup Instructions:');
      console.log('1. Enable 2-Factor Authentication on your Gmail account');
      console.log('2. Go to Google Account → Security → 2-Step Verification');
      console.log('3. Scroll down to "App passwords"');
      console.log('4. Generate a new app password for "Mail"');
      console.log('5. Use the 16-character app password (not your regular Gmail password)');
      console.log('6. Update EMAIL_APP_PASSWORD in your .env file with the app password');
    }
  }
}

testEmail();
