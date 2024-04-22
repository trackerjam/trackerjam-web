import 'dotenv/config';
import nodemailer from 'nodemailer';

const sent = [
  '',
  // 'vannnyle@gmail.com',
  // 'almas.abulkhairov@gmail.com',
  // 'nompo4ta@gmail.com',
  // 'smyk.oa@gmail.com',
  // 'kartikeyj123@gmail.com',
  // 'msaco.testacc@gmail.com',
  // 'td.eliteclass@gmail.com',
  // 'ebenezerrahul@gmail.com',
  // 'castlewania.alex@gmail.com',
  // 'ahmmburr.rose@gmail.com',
  // 'hello@filip.us',
  // 'cbuspri@outlook.com',
  // 'airobot67@gmail.com',
  // 'decorkkmc@gmail.com',
  // 'chahalvishal000@gmail.com',
  // 'brizhaclaudiaatoch@gmail.com',
  // 'qerqt22@gmail.com',
  // 'ishii@fmi.co.jp',
  // 'lizheng8318@gmail.com',
  // 'pawankumaragarwal1782@gmail.com',
  // 'vannnyle@gmail.com',
  // 'almas.abulkhairov@gmail.com',
  // 'nompo4ta@gmail.com',
  // 'smyk.oa@gmail.com',
  // 'kartikeyj123@gmail.com',
  // 'msaco.testacc@gmail.com',
  // 'td.eliteclass@gmail.com',
  // 'ebenezerrahul@gmail.com',
  // 'ahmmburr.rose@gmail.com',
  // 'hello@filip.us',
  // 'cbuspri@outlook.com',
  // 'aravindnirmal10@gmail.com',
  // 'shradhadalvi3051@gmail.com',
  // 'anushreeshekhar120@gmail.com',
  // 'iblondin@tink.ca',
  // 'aadiljannath666@gmail.com',
  // 'ahmmburr.rose@gmail.com',
  // 'castlewania.alex+@gmail.com',
  // 'd3liaz@yandex.com',
  // 'ebenezerrahul@gmail.com',
  // 'gabrielmorenoibarra@gmail.com',
  // 'hatredforlife66@gmail.com',
  // 'iblondin@tink.ca',
  // 'kartikeyj123@gmail.com',
  // 'msaco.testacc@gmail.com',
  // 'qerqt22@gmail.com',
  // 'qertest09@gmail.com',
  // 'rjonesfisherman@gmail.com',
  // 'shradhadalvi3051@gmail.com',
  // 'smyk.oa@gmail.com',
  // 'soshi.nakama@onedrops.com',
  // 'tim.hein@victoriousseo.com',
];

const allUsers = [
  // 'd3liaz@gmail.com',
  'castlewania.alex@gmail.com',
  'aadiljannath007@gmail.com',
  'teampodteam@gmail.com',
  'mintmnr@gmail.com',
  'kaichiny@gmail.com',
  'hemanthsairaj009@gmail.com',
  'sunil.p112233@gmail.com',
  'krishna427549@gmail.com',
  'real.wh1t30@gmail.com',
  'khaledapanna1617@gmail.com',
  'onekertis@gmail.com',
  'pawankumaragarwal1782@gmail.com',
  'lizheng8318@gmail.com',
  'ishii@fmi.co.jp',
  'brizhaclaudiaatoch@gmail.com',
  'chahalvishal000@gmail.com',
  'decorkkmc@gmail.com',
  'anushreeshekhar120@gmail.com',
  'aravindnirmal10@gmail.com',
  'cbuspri@outlook.com',
  'hello@filip.us',
  'td.eliteclass@gmail.com',
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
        <br/> This is Denis from TrackerJam.com
    </p>

    <p class="content">
        I see you signed up for TrackerJam but haven't installed the extension yet.
        <br>
        Let&apos;s set up a quick call to help you get started!
    </p>
    <p class="content">
        Feel free to pick a time slot that works for you: <a href="https://calendly.com/d3liaz/25min">Calendly</a>
    </p>
</main>

<footer class="footer">
    <p>
        -----<br/>
        Best regards, <br/>
        Denis from <a href="https://trackerjam.com/">TrackerJam.com</a>
    </p>
    <p class="unsubscribe">
        You are receiving this email because you signed up for TrackerJam. <a href="%unsubscribe_url%">Unsubscribe</a>.
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
    from: 'Denis L <hi@trackerjam.com>',
    replyTo: 'hi@trackerjam.com',
    sender: 'Denis from TrackerJam',
    subject: 'Call about TrackerJam', // Subject line
    text: '', // plain text body
    html: getHtml(),
  });
}

(async () => {
  const emailsToSend = allUsers.filter((email) => !sent.includes(email));
  const filteredEmails = allUsers.length - emailsToSend.length;
  if (filteredEmails !== 0) {
    console.log('Filtered emails: ', filteredEmails);
  }

  for (const receiver of emailsToSend) {
    console.log('Sending email to: ', receiver);
    const res = await sendEmail(receiver);
    console.log('Email sent: ', res.response);
  }
  console.log('All emails sent');
})();
