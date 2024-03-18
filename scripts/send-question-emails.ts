import 'dotenv/config';
import nodemailer from 'nodemailer';

const receivers = [
  // 'vannnyle@gmail.com',
  // 'almas.abulkhairov@gmail.com',
  // 'nompo4ta@gmail.com',
  // 'smyk.oa@gmail.com',
  // 'kartikeyj123@gmail.com',
  // 'msaco.testacc@gmail.com',
  // 'td.eliteclass@gmail.com',
  // 'ebenezerrahul@gmail.com',
  'd3liaz@gmail.com',
  // 'castlewania.alex@gmail.com',
  // 'ahmmburr.rose@gmail.com',
  // 'hello@filip.us',
  // 'cbuspri@outlook.com',
];

function getHtml() {
  return `
<!DOCTYPE html>
<html>
<head>
    <title>Denis from TrackerJam.com</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            padding: 50px;
        }

        .content {
            font-size: 14px;
            margin: 20px 0;
        }

        .link, link:hover, link:visited {
            color: #1481d2;
        }

        .footer {
            font-size: 14px;
            color: #555
        }

        .unsubscribe {
            font-size: 11px;
            color: #999
        }

        .unsubscribe a {
            color: #999;
        }
    </style>
</head>
<body>
<main>
    <p class="content">
        Hi,
        <br/> This is Denis from TrackerJam.com ⏰
        <br/> I hope you are doing well!
    </p>

    <p class="content">
        It's been some time now since you joined the TrackerJam and I would love to hear what you think about our web
        tracker.
        <br/>Does it help you track your web activity? What features do you miss?
    </p>
    <p class="content">
        Let me know if you want to have a video call to discuss it.
    </p>
</main>

<footer class="footer">
    <p>
        -----<br/>
        Best regards, <br/>
        Denis from <a href="https://trackerjam.com/">TrackerJam.com</a>
    </p>
    <p class="unsubscribe">
        You are receiving this email because you signed up for TrackerJam. If you don't want to receive these emails in
        the future, you can <a href="%unsubscribe_url%">unsubscribe</a>.
    </p>

</footer>
</body>
</html>
`;
}

export async function sendEmail(to: string) {
  if (!to) {
    throw new Error('Missing "to" or "token" fields for email');
  }

  const transporter = nodemailer.createTransport({
    url: process.env.EMAIL_SERVER,
  });

  return transporter.sendMail({
    to,
    from: 'TrackerJam <hi@trackerjam.com>',
    replyTo: 'hi@trackerjam.com',
    sender: 'Denis from TrackerJam',
    subject: 'What do you think?', // Subject line
    text: '', // plain text body
    html: getHtml(),
  });
}

(async () => {
  for (const receiver of receivers) {
    console.log('Sending email to: ', receiver);
    const res = await sendEmail(receiver);
    console.log('Email sent: ', res.response);
  }
  console.log('All emails sent');
})();
