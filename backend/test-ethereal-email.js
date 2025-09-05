// Alternative email test using Ethereal (testing service)
const nodemailer = require('nodemailer');

async function testEtherealEmail() {
  try {
    console.log('Creating test account with Ethereal...');
    
    // Generate test SMTP service account from ethereal.email
    let testAccount = await nodemailer.createTestAccount();

    console.log('Test account created:');
    console.log('User:', testAccount.user);
    console.log('Pass:', testAccount.pass);

    // Create transporter with test account
    let transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const testOtp = Math.floor(100000 + Math.random() * 900000).toString();

    let info = await transporter.sendMail({
      from: '"Quantum Sports" <quantumsports@example.com>',
      to: 'test@example.com',
      subject: 'Test OTP - Quantum Sports',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>🏃‍♂️ Quantum Sports - Test OTP</h2>
          <div style="background: #f0f8ff; border: 2px dashed #4169e1; padding: 20px; text-align: center; margin: 20px 0;">
            <h3>Your OTP: ${testOtp}</h3>
          </div>
          <p>This is a test email. Your email configuration is working!</p>
        </div>
      `,
    });

    console.log('✅ Email sent successfully!');
    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
  }
}

testEtherealEmail();
