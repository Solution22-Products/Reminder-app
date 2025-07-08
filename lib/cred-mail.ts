import nodemailer from "nodemailer";
import * as handlebars from "handlebars";

interface Service {
  name: string;
  icon: string;
}

export async function sendMail({
  to,
  name,
  password,
  body,
}: {
  to: string;
  name: string;
  password: string;
  subject: string;
  body: string;
}) {
  const { SMTP_USER, SMTP_PASS } = process.env;

  const transport = nodemailer.createTransport({
    host: "mail.smtp2go.com",
    port: 587,
    secure: false,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  try {
    const testResult = await transport.verify();
    console.log("Server is ready to take our messages:", testResult);
  } catch (error) {
    console.error("Error verifying SMTP connection:", error);
    return;
  }

  try {
    const sendResult = await transport.sendMail({
      from: "Reminder App <" + SMTP_USER + ">",
      to,
      subject: "Your Reminder App Web Portal Login Details",
      html: body,
    });
    console.log("Email sent successfully:", sendResult);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

export function compileWelcomeTemplate(
  name: string,
  url: string,
  password: any,
  to: any
) {
  const template = handlebars.compile(`
<!DOCTYPE html>
<html>

<head>
    <title>Confirm Your Account</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            background-color: #ffffff !important;
            background-image: url("https://i.ibb.co/K6rmgT2/white-wall-with-white-background-that-says-word-it-994023-371201.jpg");
            background-size: cover;
        }

        .container {
            max-width: 640px;
            margin: 0 auto;
            padding: 20px;
            background-color: #fff;
            border-radius: 6px;
        }

        .header {
            display: flex;
            align-items: center;
            padding: 10px 0;
        }

        .header img {
            max-width: 100px;
            height: auto;
            margin-right: 10px;
        }

        .header-bar {
            flex-grow: 1;
            height: 40px;
            background-color: #1A56DB;
            border-radius: 0 0 0 10px;
        }

        .main-content {
            text-align: center;
            background-color: #f4f4f4;
            padding: 40px 20px;
            border-radius: 14px;
            margin-top: 20px;
        }

        .main-content img {
            max-width: 100%;
            height: auto;
        }

        .title {
            font-size: 30px;
            font-weight: 700;
            color: #000;
            margin-top: 20px;
        }

        .greeting {
            font-size: 24px;
            font-weight: 600;
            color: #000;
            margin-top: 20px;
        }

        .username {
            color: #1A56DB;
        }

        .description {
            font-size: 14px;
            font-weight: 500;
            color: #000;
            margin-top: 20px;
            line-height: 20px;
        }

        .confirm-button {
            display: block;
            width: 100%;
            max-width: 249px;
            padding: 10px 16px;
            margin: 20px auto 0;
            background-color: #1A56DB;
            color: #fff;
            font-size: 14px;
            font-weight: 500;
            text-align: center;
            border-radius: 4px;
            text-decoration: none;
        }

        .info-text,
        .expiry-notice {
            font-size: 14px;
            font-weight: 500;
            color: #000;
            margin-top: 20px;
            line-height: 20px;
        }

        .divider {
            height: 1px;
            background-color: #000;
            margin: 20px 0;
        }

        .footer {
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
            align-items: center;
            margin-top: 20px;
            font-size: 14px;
            color: #000;
        }

        .footer img {
            max-width: 80px;
            height: auto;
        }

        .disclaimer {
            font-size: 10px;
            color: #dcdcdc;
            margin-top: 20px;
            text-align: center;
        }

        @media (max-width: 600px) {
            .header {
                flex-direction: column;
            }

            .footer {
                flex-direction: column;
            }
        }
    </style>
</head>

<body>
    <div class="container" style="background-color: #ffffff !important;">
        <div class="header">
            <img src="https://i.ibb.co/4R3h8B2s/s22-remain.png" alt="Company Logo">
            <span class="header-bar" style="width:1000px;"></span>
        </div>

        <div class="main-content">
            <img src="https://i.ibb.co/S4Swf1fg/Login-rafiki.png" alt="Sign Up Illustration" style="border-radius: 6px;">
        </div>



        <p class="greeting">Hi <span class="username">{{ name }}</span>,</p>

        <p class="description">
    Great news! Your Reminder App web portal is now ready for you to access. You can now log in using the provided portal link, username, and password to experience the app. Start managing your reminders, tracking your tasks, and staying organized with ease.
</p>

        <p class="description">
            🔑 Your Login Details: 
        </p>
        <p class="description">
            📍 <b>Portal Link:</b> {{url}}
        </p>
        <p class="description">
           📧 <b>Email:</b> ${to}
        </p>
        <p class="description">
           📧 <b>Password:</b> ${password}
        </p>
        

        <a href="{{url}}" class="confirm-button" style="color:white">Go to Login</a>


        <p class="expiry-notice">
           If you have any trouble accessing your account or need assistance, feel free to reach out to us at <a href="mailto:support@onlycard.com.au">support@onlycard.com.au</a> <br>We’re excited to help you get the most out of Only Card! 🚀
        </p>
       <p class="expiry-notice">
            Best regards,<br>
Only Card Team <br>
<a href="https://www.onlycard.com.au">www.onlycard.com.au </a>| <a href="mailto:support@onlycard.com.au">support@onlycard.com.au</a>
        </p>

        <div class="divider"></div>

        <div class="footer">
            <div>
                <p>Sent by</p>
                <img src="https://i.ibb.co/4R3h8B2s/s22-remain.png" alt="Sender Logo">
            </div>
        </div>

        <p class="disclaimer">
    This email contains your account credentials. Please keep them secure and do not share them with anyone. If you did not request this account, please contact our support team immediately.
</p>

    </div>
</body>

</html>

`);
  const htmlBody = template({
    name,
    url,
    password,
  });

  return htmlBody;
}
