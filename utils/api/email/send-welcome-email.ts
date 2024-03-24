import 'dotenv/config';
import nodemailer from 'nodemailer';
import {CHROME_EXTENSION_URL, EDGE_EXTENSION_URL} from '../../../const/url';

function getHtml() {
  return `
  <!DOCTYPE html>
<html>
<head>
    <title>Welcome to TrackerJam</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            padding: 30px;
            text-align: left;
        }

        .title {
            font-size: 20px;
            margin: 20px 0;
        }

        .content {
            font-size: 15px;
            margin: 10px 0;
        }

        .cta-button {
            background-color: #FF6347;
            border: none;
            color: white;
            padding: 10px 22px;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            font-size: 16px;
            margin: 20px 2px;
            cursor: pointer;
            border-radius: 5px;
        }

        .cta-button:hover {
            background-color: #616196;
            color: white;
        }

        .link, link:hover, link:visited {
            color: #1481d2;
        }

        .footer {
            font-size: 12px;
            color: #555
        }

        .footer a, .footer a:visited {
            color: #555
        }

        .unsubscribe {
            font-size: 11px;
            color: #999
        }

        .unsubscribe a, .unsubscribe a:visited {
        color: #999
        }
    </style>
</head>
<body>
<h1 class="title">Welcome to <a href="https://trackerjam.com/" class="link">TrackerJam</a></h1>
<p class="content">
    Hey there! I am Denis from TrackerJam.
    <br />
    Thank you for joining! 🎉
</p>
<p class="content">
    We are helping people and teams to analyze their web activity and improve productivity.
</p>
<p class="content">
    Please don't forget to install one of our browser extensions to start tracking your web activity.
</p>

<a class="cta-button" href="${CHROME_EXTENSION_URL}" target="_blank">Install Chrome Extension</a>
<a class="cta-button" href="${EDGE_EXTENSION_URL}" target="_blank">Install Edge Extension</a>

<p class="content">
    Please let me know if you have any questions or want to set up a video call with me.
</p>

<footer class="footer">
    <p>
        -----<br/>
        Best regards, <br/>
        Denis from <a href="https://trackerjam.com/">TrackerJam.com</a>
    </p>

    <p class="unsubscribe">
        You are receiving this email because you signed up for TrackerJam.
        <br/>
        If you don't want to receive these emails in the future, you can <a href="%unsubscribe_url%">unsubscribe</a>.
    </p>
</footer>

</body>
</html>
`;
}

export async function sendWelcomeEmail(to: string) {
  if (!to) {
    throw new Error('Missing "to" field for email');
  }

  const transporter = nodemailer.createTransport({
    url: process.env.EMAIL_SERVER,
  });

  return transporter.sendMail({
    to,
    from: `TrackerJam <${process.env.EMAIL_FROM}>`,
    replyTo: 'hi@trackerjam.com',
    sender: 'TrackerJam',
    subject: 'Welcome to TrackerJam 🍓', // Subject line
    text: 'Do not forget to install extension', // plain text body
    html: getHtml(),
  });
}
