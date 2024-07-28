function emailTemplate(otp) {
    const currentYear = new Date().getFullYear();
  
    const otpHTML = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verification Code</title>
      <style>
      /* Reset and basic styles */
      body {
          margin: 0;
          padding: 0;
          font-family: Montserrat, Arial, sans-serif;
          font-size: 14px;
          color: #333333;
          background-color: #f5f5f5;
      }
  
      /* Container */
      .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 5px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      }
  
      /* Header */
      .header {
          background-color: #7912E5;
          color: #ffffff;
          padding: 20px;
          text-align: center;
      }
  
      .header h1 {
          margin: 0;
          font-size: 24px;
      }
  
      /* Content */
      .content {
          padding: 20px;
      }
  
      .code {
          font-size: 24px;
          font-weight: bold;
          text-align: center;
          margin: 20px 0;
          padding: 10px;
          background-color: #f1f1f1;
          border-radius: 5px;
          color: #6364FF;
      }
  
      /* Footer */
      .footer {
          background-color: #f5f5f5;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #666666;
      }
  
      .footer p {
          margin: 5px 0;
      }
  </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <h1>Capitan Signup OTP</h1>
          </div>
          <div class="content">
              <p>Hi Capitan,</p>
              <p>You are requesting to sign up. The verification code for your request is:</p>
              <div class="code">${otp}</div>
              <p>For your account security, please enter this verification code to authorize this request. The code will expire in 10 minutes.</p>
              <p>If you did not make this request, kindly ignore this and do not disclose the code to anyone.</p>
              <p>This email is automatically generated, please do not reply.</p>
          </div>
          <div class="footer">
              <p>Best Regards!</p>
              <p>Capitan Team</p>
              <p>Email: eddiebob007@gmail.com | Phone: +234 (0)7043786775</p>
              <p>&copy; ${currentYear} Capitan. All rights reserved.</p>
          </div>
      </div>
  </body>
  </html>
  `;
  
    return otpHTML;
  }
  module.exports = emailTemplate;
  