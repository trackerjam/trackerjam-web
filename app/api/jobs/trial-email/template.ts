type TrialEmailJob = {
  timeLeft: string;
};

export function getTemplate({timeLeft}: TrialEmailJob) {
  return `
<!DOCTYPE html>
<html>
<head>
    <title>Denis from TrackerJam.com</title>
    <style>
        body {font-family: Arial, sans-serif;padding: 50px;}
        .content {font-size: 14px;margin: 20px 0;}
        .link, link:hover, link:visited {color: #1481d2;}
        .footer {font-size: 14px;color: #555}
        .unsubscribe {font-size: 11px;color: #999}
        .unsubscribe a {color: #999;}
    </style>
</head>
<body>
<main>
    <p class="content">
        Hey 👋, this is Denis
    </p>

    <p class="content">
        Your free trial at TrackerJam ends in ${timeLeft}.
    </p>

    <p class="content">
        To continue using TrackerJam, stay productive, and keep track of your web time, you will need to <a href="https://trackerjam.com/pricing">upgrade your account</a> to a paid plan.
    </p>

    <p class="content">
        If you have any questions or feedback, feel free to reply to this email.
    </p>
</main>

<footer class="footer">
    <p>
        -----<br/>
        Best regards, <br/>
        Denis from <a href="https://trackerjam.com/">TrackerJam.com</a> <br/>
        <a href="https://x.com/TrackerJam">@TrackerJam</a>
    </p>
    <p class="unsubscribe">
        You are receiving this email because you signed up for TrackerJam. <a href="%unsubscribe_url%">Unsubscribe</a>.
    </p>

</footer>
</body>
</html>
`;
}
