import 'dotenv/config';
import nodemailer from 'nodemailer';

const sent: string[] = [];

const allUsers = ['d3liaz@gmail.com', 'vannnyle@gmail.com'];

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
        Hey 👋
    </p>

   <p class="content">
        I just wanted to mention the new update we recently released
    </p>

    <blockquote class="twitter-tweet"><p lang="en" dir="ltr">🚀 Exciting update! Member Cards now feature a 📊 last week&#39;s activity trend bar chart. Check it out: <a href="https://twitter.com/hashtag/TrackerJam?src=hash&amp;ref_src=twsrc%5Etfw">#TrackerJam</a> <a href="https://twitter.com/hashtag/ProductUpdate?src=hash&amp;ref_src=twsrc%5Etfw">#ProductUpdate</a> <a href="https://twitter.com/hashtag/NewFeature?src=hash&amp;ref_src=twsrc%5Etfw">#NewFeature</a> <a href="https://twitter.com/hashtag/DataViz?src=hash&amp;ref_src=twsrc%5Etfw">#DataViz</a> <a href="https://t.co/gBkIYn067q">pic.twitter.com/gBkIYn067q</a></p>&mdash; TrackerJam (@TrackerJam) <a href="https://twitter.com/TrackerJam/status/1804223615212351856?ref_src=twsrc%5Etfw">June 21, 2024</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
    <img src="https://pbs.twimg.com/media/GQnjNbFWUAAkzv8?format=png&name=medium" alt="Member card update" style="width: 480px; margin: 20px 0; border: 1px solid #ddd;">

    <p class="content">
        Thanks again for choosing TrackerJam. I'd love to hear your thoughts on the product and how we can make it better.
    </p>
    <p class="content">
        If you have any questions, feel free to hit Reply to this email or book a <a href="https://calendly.com/d3liaz/25min">call</a> with me.
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
    from: 'Denis <hi@trackerjam.com>',
    replyTo: 'hi@trackerjam.com',
    sender: 'Denis from TrackerJam',
    subject: 'Member card UI update', // Subject line
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
