import nodemailer from 'nodemailer';
import {CHROME_EXTENSION_URL, EDGE_EXTENSION_URL} from '../../const/url';

function getHtml(token: string) {
  return `
<!DOCTYPE html>
<html>
<head>
    <title>Welcome to TrackerJam 🍓</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            padding: 50px;
            text-align: center;
        }

        .content {
            font-size: 20px;
            margin: 20px 0;
        }

        .cta-button {
            background-color: #FF6347;
            border: none;
            color: white;
            padding: 15px 32px;
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

        .token {
            padding: 3px;
            background-color: #f0f0f0;
            border-radius: 5px;
        }

        .footer {
            font-size: 12px;
            color: #ccc
        }

        .footer a, .footer a:visited {
            color: #ccc
        }
    </style>
</head>
<body>
<h1>Welcome to <a href="https://trackerjam.com/" class="link">TrackerJam</a> 🍓</h1>
<p class="content">
    Here is your tracking key: <br>
</p>
<p class="content">
    <code class="token">${token}</code>
</p>

<a class="cta-button" href="${CHROME_EXTENSION_URL}" target="_blank">Install Chrome Extension</a>
<a class="cta-button" href="${EDGE_EXTENSION_URL}" target="_blank">Install Edge Extension</a>

<p>
    <small>
        Ignore this email if you are not expecting any tracking key and do not know what TrackerJam is.
    </small>
</p>

<footer class="footer">
    <a href="https://trackerjam.com/">
        TrackerJam.com
    </a>
</footer>

</body>
</html>
`;
}

export async function sendTokenMail(to: string, token: string) {
  if (!to || !token) {
    throw new Error('Missing "to" or "token" fields for email');
  }

  const transporter = await nodemailer.createTransport({
    url: process.env.EMAIL_SERVER,
  });

  return transporter.sendMail({
    to,
    from: `TrackerJam <${process.env.EMAIL_FROM}>`,
    sender: 'TrackerJam',
    subject: 'Welcome to TrackerJam 🍓', // Subject line
    text: 'Here is your tracking key', // plain text body
    html: getHtml(token),
  });
}
