import nodemailer, { TransportOptions } from "nodemailer"

export const verifyEmailTemplate =async (userEmail:string,link:string)=>{

    const htmlTemplate = 
    `
  <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email Address</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      line-height: 1.5;
      color: #333;
      background-color: #f5f5f5;
      margin: 0;
      padding: 20px;
    }

    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      border: 1px solid #ddd; /* Added a subtle border */
      overflow: hidden;
    }

    .header {
      background-color: #333333;
      color: #ffffff;
      padding: 30px 20px;
      text-align: center;
    }

    .header h1 {
      margin: 0;
      font-size: 24px; /* Reduced font size */
      font-weight: 600;
    }

    .content {
      padding: 30px;
      background-color: #ffffff;
      color: #444;
      font-size: 14px; /* Reduced font size */
    }

    .content p {
      margin-bottom: 16px;
      font-size: 14px; /* Standard text size */
      line-height: 1.6;
    }

    .button {
      display: inline-block;
      padding: 10px 28px;
      background-color: #333333;
      color: #ffffff;
      text-decoration: none;
      border-radius: 50px;
      font-weight: 600;
      font-size: 14px;
      transition: all 0.3s ease;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
    
    #verifyEmail {
      outline: none;
      color: #ffffff;
      font-weight: 500;
    }

    .footer {
      background-color: #f8f8f8;
      padding: 20px;
      text-align: center;
      border-top: 1px solid #eee;
      font-size: 12px; /* Reduced footer font size */
    }

    .footer h4 {
      margin: 10px 0;
      font-size: 14px;
      color: #444;
    }

    .footer a {
      color: #333;
      text-decoration: none;
      font-weight: 500;
      transition: color 0.3s ease;
    }

    .footer a:hover {
      color: #000;
    }

    .signature {
      margin-top: 20px;
      padding-top: 10px;
      border-top: 1px solid #eee;
      font-size: 14px;
      font-style: italic;
    }

    /* Table structure for better responsiveness */
    table {
      width: 100%;
      border-collapse: collapse;
    }

    td {
      padding: 0;
      vertical-align: top;
    }

    @media (max-width: 600px) {
      body {
        padding: 10px;
      }
      
      .content {
        padding: 20px;
      }
      
      .header {
        padding: 25px 15px;
      }
      
      .header h1 {
        font-size: 20px;
      }
      
      .button {
        font-size: 12px;
        padding: 8px 24px;
      }
    }
  </style>
</head>
<body>
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <div class="container">
          <div class="header">
            <h1>Verify Your Email Address</h1>
          </div>

          <div class="content">
            <p>Dear Admin,</p>
            <p>Thank you for registering with our School ERP System. To complete your registration and access your account, please verify your email address by clicking the button below:</p>
            <div style="text-align: center; margin: 25px 0;">
              <a href=${link} class="button" id="verifyEmail">Verify Email Address</a>
            </div>

            <p>If you did not create an account with our School ERP System, please disregard this email or contact the School Administrator if you believe this is suspicious activity.</p>

            <div class="signature">
              <p>Best Regards,<br>
              School ERP Administration Team</p>
            </div>
          </div>

          <div class="footer">
            <p>This is an automated response. Please do not reply to this email.</p>
            <h4>Powered by <a href="http://www.atonix.in/" target="_blank" rel="noopener noreferrer">ATONIX Corp</a></h4>
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>

    `


    const transporter = nodemailer.createTransport({
      host: process.env.NODEMAILER_HOST_NAME as string ,
      port:Number( process.env.NODEMAILER_PORT),
      secure: process.env.NODEMAILER_SECURE === 'true', 
      auth: {
        user:process.env.NODEMAILER_EMAIL,
        pass:process.env.NODEMAILER_PASS,
      },

    } as TransportOptions);



    await transporter.sendMail({
      from:process.env.NODEMAILER_EMAIL,
      to:userEmail,
      subject:`Verify Your Email Address for Atonix School ERP System Registration`,
      html:htmlTemplate
    });
}

